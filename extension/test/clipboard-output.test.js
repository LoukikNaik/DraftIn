import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { copyMessageToClipboard } from "../src/clipboard-output.js";

describe("clipboard output", () => {
  it("copies generated messages to the clipboard", async () => {
    const writes = [];
    const result = await copyMessageToClipboard("Hi Taylor", {
      clipboard: {
        async writeText(value) {
          writes.push(value);
        },
      },
    });

    assert.deepEqual(writes, ["Hi Taylor"]);
    assert.deepEqual(result, { copied: true, message: "Hi Taylor" });
  });

  it("returns the message when clipboard writing fails", async () => {
    const result = await copyMessageToClipboard("Hi Taylor", {
      clipboard: {
        async writeText() {
          throw new Error("permission denied");
        },
      },
    });

    assert.equal(result.copied, false);
    assert.equal(result.message, "Hi Taylor");
    assert.match(result.error, /permission denied/);
  });
});
