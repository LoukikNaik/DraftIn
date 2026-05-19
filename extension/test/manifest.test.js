import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("extension manifest", () => {
  it("declares MV3, command trigger, LinkedIn scope, and localhost access only", async () => {
    const manifest = JSON.parse(await readFile("extension/manifest.json", "utf8"));

    assert.equal(manifest.manifest_version, 3);
    assert.equal(manifest.background.service_worker, "src/background.js");
    assert.equal(manifest.background.type, "module");
    assert.deepEqual(manifest.content_scripts[0].js, ["src/content-runtime.js"]);
    assert.equal(manifest.content_scripts[0].type, undefined);
    assert.ok(manifest.action.default_title.includes("lreachout"));
    assert.ok(manifest.commands["draft-linkedin-message"]);
    assert.deepEqual(manifest.host_permissions.sort(), [
      "http://127.0.0.1:17391/*",
      "https://www.linkedin.com/*",
    ].sort());
    assert.ok(manifest.permissions.includes("activeTab"));
    assert.ok(manifest.permissions.includes("scripting"));
    assert.ok(manifest.permissions.includes("tabs"));
    assert.ok(manifest.permissions.includes("clipboardWrite"));
    assert.ok(manifest.permissions.includes("offscreen"));
  });

  it("declares Alt+K to add a screenshot and Alt+C to clear the buffer", async () => {
    const manifest = JSON.parse(await readFile("extension/manifest.json", "utf8"));

    assert.equal(manifest.commands["add-screenshot"].suggested_key.default, "Alt+K");
    assert.equal(manifest.commands["clear-screenshots"].suggested_key.default, "Alt+C");
  });

  it("requests the storage permission for the screenshot buffer", async () => {
    const manifest = JSON.parse(await readFile("extension/manifest.json", "utf8"));

    assert.ok(manifest.permissions.includes("storage"));
  });
});
