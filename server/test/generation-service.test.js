import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import { createGenerationService, normalizeBulletMarkers } from "../src/generation-service.js";

const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("generation service", () => {
  it("loads profile context, builds a prompt, and returns the Oracle draft", async () => {
    const dir = await createTempDir();
    const profilePath = path.join(dir, "me.md");
    await writeFile(profilePath, "I build recruiting workflow tools.", "utf8");
    const calls = [];
    const service = createGenerationService({
      profilePath,
      playbookPath: "prompts/hiring.md",
      attachScreenshot: false,
      oracleRunner: {
        async run(input) {
          calls.push(input);
          return "Hi Taylor, saw the team is hiring backend engineers. I build recruiting workflow tools and would be interested in learning more.";
        },
      },
    });

    const result = await service(validRequest());

    assert.equal(result.source, "oracle");
    assert.match(result.message, /Hi Taylor/);
    assert.equal(calls.length, 1);
    assert.match(calls[0].prompt, /I build recruiting workflow tools/);
    assert.match(calls[0].prompt, /taylor-recruiter/);
    // The configured playbook is injected into the prompt.
    assert.match(calls[0].prompt, /A few things about me:/);
    assert.deepEqual(calls[0].attachments, []);
  });

  it("requires a playbookPath", () => {
    assert.throws(
      () => createGenerationService({ profilePath: "profile/me.md" }),
      /requires playbookPath/,
    );
  });

  it("creates one Oracle attachment per screenshot URL in the request", async () => {
    const dir = await createTempDir();
    const profilePath = path.join(dir, "me.md");
    await writeFile(profilePath, "Backend engineer.", "utf8");
    const calls = [];
    const service = createGenerationService({
      profilePath,
      playbookPath: "prompts/hiring.md",
      tempDir: dir,
      oracleRunner: {
        async run(input) {
          calls.push(input);
          return "ok";
        },
      },
    });

    await service({
      ...validRequest(),
      screenshots: [
        "data:image/png;base64,iVBORw0KGgo=",
        "data:image/png;base64,iVBORw0KGgo=",
      ],
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].attachments.length, 2);
  });

  it("rewrites leading `* ` bullet markers to `- ` in the Oracle output", async () => {
    const dir = await createTempDir();
    const profilePath = path.join(dir, "me.md");
    await writeFile(profilePath, "Backend engineer.", "utf8");
    const service = createGenerationService({
      profilePath,
      playbookPath: "prompts/hiring.md",
      attachScreenshot: false,
      oracleRunner: {
        async run() {
          return "Hey Amy.\n\n* Shipped backend APIs.\n* Migrated orchestration.\n\nWould love to chat.";
        },
      },
    });

    const result = await service(validRequest());

    assert.match(result.message, /^- Shipped backend APIs\./m);
    assert.match(result.message, /^- Migrated orchestration\./m);
    assert.doesNotMatch(result.message, /^\* /m);
  });

  it("normalizeBulletMarkers leaves non-bullet asterisks untouched", () => {
    assert.equal(normalizeBulletMarkers("Run 5 * 3 in your head."), "Run 5 * 3 in your head.");
    assert.equal(normalizeBulletMarkers("  * indented bullet"), "  - indented bullet");
  });

  it("wraps Oracle runner failures with a controlled error", async () => {
    const dir = await createTempDir();
    const profilePath = path.join(dir, "me.md");
    await writeFile(profilePath, "I build recruiting workflow tools.", "utf8");
    const service = createGenerationService({
      profilePath,
      playbookPath: "prompts/hiring.md",
      attachScreenshot: false,
      oracleRunner: {
        async run() {
          throw new Error("Oracle session expired");
        },
      },
    });

    await assert.rejects(
      () => service(validRequest()),
      (error) => {
        assert.equal(error.code, "ORACLE_GENERATION_FAILED");
        assert.match(error.message, /Oracle session expired/);
        return true;
      },
    );
  });
});

function validRequest() {
  return {
    url: "https://www.linkedin.com/in/taylor-recruiter/",
    title: "Taylor Recruiter | LinkedIn",
    intent: "Draft a concise LinkedIn reach-out message about hiring opportunities.",
    screenshotDataUrl: "data:image/png;base64,iVBORw0KGgo=",
  };
}

async function createTempDir() {
  const dir = await mkdtemp(path.join(tmpdir(), "lreachout-"));
  tempDirs.push(dir);
  return dir;
}
