import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { appendScreenshot, clearScreenshots, getScreenshots } from "../src/screenshot-buffer.js";

describe("screenshot buffer", () => {
  it("returns an empty array when nothing has been buffered yet", async () => {
    const storage = makeFakeStorage();

    const screenshots = await getScreenshots({ storage });

    assert.deepEqual(screenshots, []);
  });

  it("retrieves a screenshot that was appended", async () => {
    const storage = makeFakeStorage();

    await appendScreenshot("data:image/png;base64,AAA", { storage });

    assert.deepEqual(await getScreenshots({ storage }), ["data:image/png;base64,AAA"]);
  });

  it("returns the running count from append so callers can update the badge", async () => {
    const storage = makeFakeStorage();

    const first = await appendScreenshot("data:image/png;base64,AAA", { storage });
    const second = await appendScreenshot("data:image/png;base64,BBB", { storage });

    assert.equal(first, 1);
    assert.equal(second, 2);
  });

  it("empties the buffer when cleared", async () => {
    const storage = makeFakeStorage();
    await appendScreenshot("data:image/png;base64,AAA", { storage });
    await appendScreenshot("data:image/png;base64,BBB", { storage });

    await clearScreenshots({ storage });

    assert.deepEqual(await getScreenshots({ storage }), []);
  });
});

function makeFakeStorage(initial = {}) {
  const store = { ...initial };
  return {
    async get(keys) {
      const requested = Array.isArray(keys) ? keys : [keys];
      const result = {};
      for (const key of requested) {
        if (key in store) {
          result[key] = store[key];
        }
      }
      return result;
    },
    async set(items) {
      Object.assign(store, items);
    },
    async remove(key) {
      delete store[key];
    },
    _store: store,
  };
}
