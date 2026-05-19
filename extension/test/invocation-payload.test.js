import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildGeneratePayload } from "../src/invocation-payload.js";

describe("extension invocation payload", () => {
  it("builds the server request shape from tab + screenshot only", () => {
    const payload = buildGeneratePayload({
      tab: {
        url: "https://www.linkedin.com/in/taylor-recruiter/",
        title: "Taylor Recruiter | LinkedIn",
      },
      screenshotDataUrl: "data:image/png;base64,iVBORw0KGgo=",
    });

    assert.deepEqual(payload, {
      url: "https://www.linkedin.com/in/taylor-recruiter/",
      title: "Taylor Recruiter | LinkedIn",
      screenshotDataUrl: "data:image/png;base64,iVBORw0KGgo=",
      intent: "Draft a concise LinkedIn reach-out message about hiring opportunities.",
    });
  });

  it("rejects invocation without an active tab URL", () => {
    assert.throws(
      () =>
        buildGeneratePayload({
          tab: {},
          screenshotDataUrl: "data:image/png;base64,iVBORw0KGgo=",
        }),
      /active tab URL/,
    );
  });

  it("rejects invocation without a screenshot", () => {
    assert.throws(
      () =>
        buildGeneratePayload({
          tab: { url: "https://www.linkedin.com/in/example/" },
        }),
      /without a screenshot/,
    );
  });
});
