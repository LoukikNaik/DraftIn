import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { handleAddScreenshot, handleClearBuffer, handleDraft } from "../src/draft.js";
import {
  appendScreenshot,
  clearScreenshots,
  getScreenshots,
} from "../src/screenshot-buffer.js";

describe("draft orchestrator", () => {
  it("captures the visible tab, appends to the buffer, and updates the badge to the new count", async () => {
    const storage = makeFakeStorage();
    const badgeText = [];
    const buffer = makeBufferAdapter(storage);
    const tab = { id: 42, windowId: 7 };

    await handleAddScreenshot({
      tab,
      capture: async () => "data:image/png;base64,AAA",
      buffer,
      setBadge: (text) => badgeText.push(text),
    });

    assert.deepEqual(await getScreenshots({ storage }), ["data:image/png;base64,AAA"]);
    assert.deepEqual(badgeText, ["1"]);
  });

  it("sends the buffered screenshots without re-capturing when the buffer is non-empty", async () => {
    const storage = makeFakeStorage();
    await appendScreenshot("A", { storage });
    await appendScreenshot("B", { storage });
    let captureCalls = 0;
    const sent = [];

    await handleDraft({
      tab: { id: 1 },
      capture: async () => {
        captureCalls += 1;
        return "X";
      },
      buffer: makeBufferAdapter(storage),
      setBadge: () => {},
      sendDraft: async (payload) => sent.push(payload),
    });

    assert.equal(captureCalls, 0);
    assert.equal(sent.length, 1);
    assert.deepEqual(sent[0].screenshots, ["A", "B"]);
  });

  it("auto-captures and sends a single screenshot when the buffer is empty", async () => {
    const storage = makeFakeStorage();
    let captureCalls = 0;
    const sent = [];

    await handleDraft({
      tab: { id: 1 },
      capture: async () => {
        captureCalls += 1;
        return "data:image/png;base64,X";
      },
      buffer: makeBufferAdapter(storage),
      setBadge: () => {},
      sendDraft: async (payload) => sent.push(payload),
    });

    assert.equal(captureCalls, 1);
    assert.deepEqual(sent[0].screenshots, ["data:image/png;base64,X"]);
  });

  it("clears the buffer and the badge after a successful draft", async () => {
    const storage = makeFakeStorage();
    await appendScreenshot("A", { storage });
    await appendScreenshot("B", { storage });
    const badgeText = [];

    await handleDraft({
      tab: { id: 1 },
      capture: async () => "X",
      buffer: makeBufferAdapter(storage),
      setBadge: (text) => badgeText.push(text),
      sendDraft: async () => {},
    });

    assert.deepEqual(await getScreenshots({ storage }), []);
    assert.deepEqual(badgeText, [""]);
  });

  it("leaves the buffer and the badge intact when the draft fails so the user can retry", async () => {
    const storage = makeFakeStorage();
    await appendScreenshot("A", { storage });
    await appendScreenshot("B", { storage });
    const badgeText = [];

    await assert.rejects(
      () =>
        handleDraft({
          tab: { id: 1 },
          capture: async () => "X",
          buffer: makeBufferAdapter(storage),
          setBadge: (text) => badgeText.push(text),
          sendDraft: async () => {
            throw new Error("server down");
          },
        }),
      /server down/,
    );

    assert.deepEqual(await getScreenshots({ storage }), ["A", "B"]);
    assert.deepEqual(badgeText, []);
  });

  it("clears the buffer and the badge when the clear command fires", async () => {
    const storage = makeFakeStorage();
    await appendScreenshot("A", { storage });
    await appendScreenshot("B", { storage });
    const badgeText = [];
    const buffer = makeBufferAdapter(storage);

    await handleClearBuffer({
      buffer,
      setBadge: (text) => badgeText.push(text),
    });

    assert.deepEqual(await getScreenshots({ storage }), []);
    assert.deepEqual(badgeText, [""]);
  });
});

function makeFakeStorage(initial = {}) {
  const store = { ...initial };
  return {
    async get(key) {
      return key in store ? { [key]: store[key] } : {};
    },
    async set(items) {
      Object.assign(store, items);
    },
    async remove(key) {
      delete store[key];
    },
  };
}

function makeBufferAdapter(storage) {
  return {
    append: (dataUrl) => appendScreenshot(dataUrl, { storage }),
    get: () => getScreenshots({ storage }),
    clear: () => clearScreenshots({ storage }),
  };
}
