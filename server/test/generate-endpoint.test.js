import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { afterEach, describe, it } from "node:test";

import { createHandler } from "../src/app.js";

const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("generate endpoint", () => {
  it("returns an Oracle draft for a valid request", async () => {
    const dir = await createTempDir();
    const profilePath = path.join(dir, "me.md");
    await writeFile(profilePath, "I build developer productivity systems.", "utf8");
    const oracleCalls = [];
    const clipboardCalls = [];
    const handler = createHandler({
      profilePath,
      oracleRunner: {
        async run(input) {
          oracleCalls.push(input);
          return "Hi Taylor, noticed Acme is hiring backend engineers. I build developer productivity systems and would be glad to connect.";
        },
      },
      copyToClipboard: async (text) => {
        clipboardCalls.push(text);
        return { copied: true, command: "pbcopy" };
      },
    });

    const response = await request(handler, {
      method: "POST",
      url: "/generate",
      body: JSON.stringify(validRequest()),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.source, "oracle");
    assert.match(response.body.message, /Hi Taylor/);
    assert.equal(oracleCalls.length, 1);
    assert.match(oracleCalls[0].prompt, /developer productivity systems/);
    assert.equal(clipboardCalls.length, 1);
    assert.match(clipboardCalls[0], /Hi Taylor/);
    assert.deepEqual(response.body.clipboard, { copied: true, command: "pbcopy" });
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

function validRequest() {
  const dataUrl = "data:image/png;base64,iVBORw0KGgo=";
  return {
    url: "https://www.linkedin.com/in/taylor-recruiter/",
    title: "Taylor Recruiter | LinkedIn",
    intent: "Draft a concise LinkedIn reach-out message about hiring opportunities.",
    screenshots: [dataUrl],
    // Temporary: generation-service still reads screenshotDataUrl until cycle 8.
    screenshotDataUrl: dataUrl,
  };
}

async function createTempDir() {
  const dir = await mkdtemp(path.join(tmpdir(), "lreachout-"));
  tempDirs.push(dir);
  return dir;
}
