import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { describe, it } from "node:test";

import { createHandler } from "../src/app.js";

describe("HTTP contract", () => {
  it("reports health", async () => {
    const response = await request(createHandler(), {
      method: "GET",
      url: "/health",
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { ok: true });
  });

  it("rejects malformed generation requests with a stable error code", async () => {
    const response = await request(createHandler(), {
      method: "POST",
      url: "/generate",
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      error: {
        code: "INVALID_GENERATE_REQUEST",
        message: "Missing required field: url",
      },
    });
  });
});

function request(handler, { method, url, body = "" }) {
  const request = Readable.from([body]);
  request.method = method;
  request.url = url;
  request.setEncoding = () => {};

  return new Promise((resolve) => {
    const response = {
      status: undefined,
      headers: undefined,
      writeHead(status, headers) {
        this.status = status;
        this.headers = headers;
      },
      end(payload) {
        resolve({
          status: this.status,
          headers: this.headers,
          body: JSON.parse(payload),
        });
      },
    };

    handler(request, response);
  });
}
