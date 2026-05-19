import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildPrompt } from "../src/prompt-builder.js";

describe("prompt builder", () => {
  it("includes profile, page url + title, structure, length, and antipattern guidance", () => {
    const prompt = buildPrompt({
      personalContext: "I am a backend engineer who has worked on hiring platforms.",
      request: validRequest(),
    });

    assert.match(prompt, /backend engineer who has worked on hiring platforms/);
    assert.match(prompt, /URL: https:\/\/www\.linkedin\.com\/in\/example-recruiter\//);
    assert.match(prompt, /Page title: Example Recruiter \| LinkedIn/);
    assert.match(prompt, /first name only/);
    assert.match(prompt, /60 to 90 words/);
    assert.match(prompt, /em dashes/);
    assert.match(prompt, /Example Angles/);
    assert.match(prompt, /Do not invent details/);
    assert.match(prompt, /Return only the message body/);
  });

  it("treats the screenshot as the source of truth when one is attached", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
      hasScreenshot: true,
    });

    assert.match(prompt, /attached screenshot/i);
    assert.match(prompt, /source of truth/i);
    assert.doesNotMatch(prompt, /No screenshot is attached/);
  });

  it("falls back to title + URL guidance when no screenshot is attached", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
      hasScreenshot: false,
    });

    assert.match(prompt, /No screenshot is attached/);
    assert.doesNotMatch(prompt, /attached screenshot is a capture/i);
  });
});

function validRequest() {
  return {
    url: "https://www.linkedin.com/in/example-recruiter/",
    title: "Example Recruiter | LinkedIn",
    intent: "Draft a concise LinkedIn reach-out message about hiring opportunities.",
  };
}
