import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import { afterEach, describe, it } from "node:test";

import { createOracleRunner } from "../src/oracle-runner.js";

const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("Oracle runner", () => {
  it("invokes Oracle with prompt and attachment files", async () => {
    const dir = await createTempDir();
    const screenshotPath = path.join(dir, "screenshot.png");
    await writeFile(screenshotPath, "png", "utf8");
    const calls = [];
    const runner = createOracleRunner({
      tempDir: dir,
      spawnFn(command, args) {
        calls.push({ command, args });
        return fakeChild({ stdout: "Hi Taylor\n", code: 0 });
      },
    });

    const message = await runner.run({
      prompt: "Draft a message",
      attachments: [screenshotPath],
    });

    assert.equal(message, "Hi Taylor");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].command, "oracle");
    assert.ok(calls[0].args.includes("--prompt"));
    assert.match(calls[0].args[calls[0].args.indexOf("--prompt") + 1], /Use the attached files/);
    assert.ok(calls[0].args.includes("--file"));
    assert.ok(calls[0].args.includes(screenshotPath));
    assert.ok(calls[0].args.some((arg) => arg.endsWith(".md")));
  });

  it("throws a controlled error when Oracle exits non-zero", async () => {
    const dir = await createTempDir();
    const runner = createOracleRunner({
      tempDir: dir,
      spawnFn() {
        return fakeChild({ stderr: "not logged in", code: 1 });
      },
    });

    await assert.rejects(
      () => runner.run({ prompt: "Draft", attachments: [] }),
      (error) => {
        assert.equal(error.code, "ORACLE_CLI_FAILED");
        assert.match(error.message, /not logged in/);
        return true;
      },
    );
  });

  it("extracts only the final answer from browser-mode Oracle logs", async () => {
    const dir = await createTempDir();
    const runner = createOracleRunner({
      tempDir: dir,
      spawnFn() {
        return fakeChild({
          stdout: [
            "🧿 oracle 0.12.1 — Globs to gospel.",
            "Session: use-the-attached-files-to-2",
            "Mode: browser foreground",
            "Answer:",
            "Hi Example, saw Acme AI is hiring backend engineers.",
            "",
            "14.2s · gpt-5.5[browser] · ↑1.7k ↓91 ↻0 Δ1.79k",
            "files=1",
          ].join("\n"),
          code: 0,
        });
      },
    });

    const message = await runner.run({
      prompt: "Draft",
      attachments: [],
    });

    assert.equal(message, "Hi Example, saw Acme AI is hiring backend engineers.");
  });

  it("strips multi-minute footers like 1m18s", async () => {
    const dir = await createTempDir();
    const runner = createOracleRunner({
      tempDir: dir,
      spawnFn() {
        return fakeChild({
          stdout: [
            "Answer:",
            "Hi Taylor, saw the platform team is hiring.",
            "",
            "1m18s · gpt-5.5-instant[browser] · ↑2.25k ↓90 ↻0 Δ2.33k files=2",
          ].join("\n"),
          code: 0,
        });
      },
    });

    const message = await runner.run({ prompt: "Draft", attachments: [] });

    assert.equal(message, "Hi Taylor, saw the platform team is hiring.");
  });

  it("strips hour-scale footers", async () => {
    const dir = await createTempDir();
    const runner = createOracleRunner({
      tempDir: dir,
      spawnFn() {
        return fakeChild({
          stdout: [
            "Answer:",
            "Hello Jordan, noticed the recent talk on distributed systems.",
            "",
            "1h2m45s · gpt-5.5[browser] · ↑3.1k ↓120 ↻0 Δ3.22k",
            "files=2",
          ].join("\n"),
          code: 0,
        });
      },
    });

    const message = await runner.run({ prompt: "Draft", attachments: [] });

    assert.equal(message, "Hello Jordan, noticed the recent talk on distributed systems.");
  });

  it("strips a footer even when no Answer: marker is present", async () => {
    const dir = await createTempDir();
    const runner = createOracleRunner({
      tempDir: dir,
      spawnFn() {
        return fakeChild({
          stdout: [
            "Hi Sam, noticed Acme is hiring AI infra engineers.",
            "",
            "45.6s · gpt-5.5-instant[browser] · ↑1.1k ↓80 ↻0 Δ1.18k",
            "files=2",
          ].join("\n"),
          code: 0,
        });
      },
    });

    const message = await runner.run({ prompt: "Draft", attachments: [] });

    assert.equal(message, "Hi Sam, noticed Acme is hiring AI infra engineers.");
  });

  it("does not strip message lines that happen to contain a duration-like pattern", async () => {
    const dir = await createTempDir();
    const runner = createOracleRunner({
      tempDir: dir,
      spawnFn() {
        return fakeChild({
          stdout: [
            "Answer:",
            "Hi Pat, our pipeline cut latency from 12.5s to 800ms.",
            "",
            "14.2s · gpt-5.5[browser] · ↑1.7k ↓91 ↻0 Δ1.79k",
          ].join("\n"),
          code: 0,
        });
      },
    });

    const message = await runner.run({ prompt: "Draft", attachments: [] });

    assert.equal(message, "Hi Pat, our pipeline cut latency from 12.5s to 800ms.");
  });
});

function fakeChild({ stdout = "", stderr = "", code }) {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();

  queueMicrotask(() => {
    child.stdout.end(stdout);
    child.stderr.end(stderr);
    child.emit("close", code);
  });

  return child;
}

async function createTempDir() {
  const dir = await mkdtemp(path.join(tmpdir(), "lreachout-"));
  tempDirs.push(dir);
  return dir;
}
