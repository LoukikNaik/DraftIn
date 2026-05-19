import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import { createGenerationService } from "../src/generation-service.js";

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
    assert.deepEqual(calls[0].attachments, []);
  });

  it("wraps Oracle runner failures with a controlled error", async () => {
    const dir = await createTempDir();
    const profilePath = path.join(dir, "me.md");
    await writeFile(profilePath, "I build recruiting workflow tools.", "utf8");
    const service = createGenerationService({
      profilePath,
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
