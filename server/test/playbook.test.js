import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import { loadPlaybook } from "../src/playbook.js";

const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("playbook loader", () => {
  it("reads and trims a playbook file", async () => {
    const dir = await createTempDir();
    const playbookPath = path.join(dir, "sales.md");
    await writeFile(playbookPath, "\n# Sales reach-out\n\nBe brief.\n\n", "utf8");

    const playbook = await loadPlaybook(playbookPath);

    assert.equal(playbook, "# Sales reach-out\n\nBe brief.");
  });

  it("raises a controlled error when the playbook file is missing", async () => {
    await assert.rejects(
      () => loadPlaybook("/no/such/playbook.md"),
      (error) => {
        assert.equal(error.code, "PLAYBOOK_NOT_FOUND");
        assert.match(error.message, /Playbook file not found/);
        return true;
      },
    );
  });

  it("ships a default hiring playbook with the expected shape", async () => {
    const playbook = await loadPlaybook("prompts/hiring.md");

    assert.match(playbook, /Hiring reach-out playbook/);
    assert.match(playbook, /A few things about me:/);
    assert.match(playbook, /Hey Tamir, saw your post/);
  });
});

async function createTempDir() {
  const dir = await mkdtemp(path.join(tmpdir(), "lreachout-playbook-"));
  tempDirs.push(dir);
  return dir;
}
