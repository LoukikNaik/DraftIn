import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import { loadPersonalContext } from "../src/personal-context.js";

const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("personal context loading", () => {
  it("loads and trims the markdown profile", async () => {
    const dir = await createTempDir();
    const profilePath = path.join(dir, "me.md");
    await writeFile(profilePath, "\n# Loukik\n\nI build product engineering systems.\n\n", "utf8");

    const context = await loadPersonalContext(profilePath);

    assert.equal(context, "# Loukik\n\nI build product engineering systems.");
  });

  it("throws a controlled error when the profile is missing", async () => {
    const dir = await createTempDir();
    const profilePath = path.join(dir, "missing.md");

    await assert.rejects(
      () => loadPersonalContext(profilePath),
      (error) => {
        assert.equal(error.code, "PERSONAL_CONTEXT_NOT_FOUND");
        assert.match(error.message, /missing\.md/);
        return true;
      },
    );
  });
});

async function createTempDir() {
  const dir = await mkdtemp(path.join(tmpdir(), "draftin-"));
  tempDirs.push(dir);
  return dir;
}
