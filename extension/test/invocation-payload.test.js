import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildGeneratePayload, defaultIntent } from "../src/invocation-payload.js";

describe("extension invocation payload", () => {
  it("builds the server request shape with an ordered screenshots array", () => {
    const payload = buildGeneratePayload({
      tab: {
        url: "https://www.linkedin.com/in/taylor-recruiter/",
        title: "Taylor Recruiter | LinkedIn",
      },
      screenshots: [
        "data:image/png;base64,AAA",
        "data:image/png;base64,BBB",
      ],
    });

    assert.deepEqual(payload, {
      url: "https://www.linkedin.com/in/taylor-recruiter/",
      title: "Taylor Recruiter | LinkedIn",
      screenshots: [
        "data:image/png;base64,AAA",
        "data:image/png;base64,BBB",
      ],
      intent: defaultIntent,
    });
  });

  it("defaults to a playbook-agnostic intent, not a hiring-specific one", () => {
    assert.doesNotMatch(defaultIntent, /hiring/i);
    assert.match(defaultIntent, /playbook/i);
  });

  it("rejects invocation without an active tab URL", () => {
    assert.throws(
      () =>
        buildGeneratePayload({
          tab: {},
          screenshots: ["data:image/png;base64,iVBORw0KGgo="],
        }),
      /active tab URL/,
    );
  });

  it("rejects invocation when the screenshots field is missing", () => {
    assert.throws(
      () =>
        buildGeneratePayload({
          tab: { url: "https://www.linkedin.com/in/example/" },
        }),
      /at least one screenshot/,
    );
  });

  it("rejects invocation when the screenshots array is empty", () => {
    assert.throws(
      () =>
        buildGeneratePayload({
          tab: { url: "https://www.linkedin.com/in/example/" },
          screenshots: [],
        }),
      /at least one screenshot/,
    );
  });
});
