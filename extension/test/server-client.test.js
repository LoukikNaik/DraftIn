import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { generateMessage } from "../src/server-client.js";

describe("local server client", () => {
  it("returns generated messages from the local server", async () => {
    const result = await generateMessage({
      payload: { url: "https://www.linkedin.com/in/taylor/" },
      fetchFn: async (url, options) => ({
        ok: true,
        status: 200,
        json: async () => ({ message: "Hi Taylor", source: "oracle" }),
        url,
        options,
      }),
    });

    assert.deepEqual(result, { message: "Hi Taylor", source: "oracle" });
  });

  it("turns network failure into a start-server error", async () => {
    await assert.rejects(
      () =>
        generateMessage({
          payload: {},
          fetchFn: async () => {
            throw new TypeError("fetch failed");
          },
        }),
      /Start the local lreachout server/,
    );
  });

  it("surfaces non-200 server errors", async () => {
    await assert.rejects(
      () =>
        generateMessage({
          payload: {},
          fetchFn: async () => ({
            ok: false,
            status: 502,
            json: async () => ({
              error: { code: "ORACLE_GENERATION_FAILED", message: "Oracle session expired" },
            }),
          }),
        }),
      /Oracle session expired/,
    );
  });
});
