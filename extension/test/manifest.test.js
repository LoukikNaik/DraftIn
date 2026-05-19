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
});
