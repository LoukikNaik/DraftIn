import assert from "node:assert/strict";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import { createGenerationService } from "../src/generation-service.js";

const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("screenshot file handling", () => {
  it("passes a temporary screenshot file to Oracle and cleans it up after success", async () => {
    const dir = await createTempDir();
    const profilePath = path.join(dir, "me.md");
    await writeFile(profilePath, "I build hiring tools.", "utf8");
    let screenshotPath;
    const service = createGenerationService({
      profilePath,
      tempDir: dir,
      attachScreenshot: true,
      oracleRunner: {
        async run(input) {
          assert.equal(input.attachments.length, 1);
          screenshotPath = input.attachments[0];
          await access(screenshotPath);
          return "Hi Taylor, saw Acme is hiring. I build hiring tools and would be glad to connect.";
        },
      },
    });

    await service(validRequest());

    await assert.rejects(() => access(screenshotPath), /ENOENT/);
  });

  it("rejects invalid screenshot data URLs before invoking Oracle", async () => {
    const dir = await createTempDir();
    const profilePath = path.join(dir, "me.md");
    await writeFile(profilePath, "I build hiring tools.", "utf8");
    let called = false;
    const service = createGenerationService({
      profilePath,
      tempDir: dir,
      attachScreenshot: true,
      oracleRunner: {
        async run() {
          called = true;
          return "Should not happen";
        },
      },
    });

    await assert.rejects(
      () =>
        service({
          ...validRequest(),
          screenshotDataUrl: "not-a-data-url",
        }),
      (error) => {
        assert.equal(error.code, "INVALID_SCREENSHOT_DATA_URL");
        return true;
      },
    );
    assert.equal(called, false);
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
