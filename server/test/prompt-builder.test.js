import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildPrompt } from "../src/prompt-builder.js";

describe("prompt builder", () => {
  it("assembles the universal scaffold around the supplied profile and playbook", () => {
    const prompt = buildPrompt({
      personalContext: "I am a backend engineer who has worked on hiring platforms.",
      playbook: "PLAYBOOK_SENTINEL: write a warm note.",
      request: validRequest(),
    });

    // Profile and playbook are injected verbatim under their own headings.
    assert.match(prompt, /## About me\n\nI am a backend engineer who has worked on hiring platforms\./);
    assert.match(prompt, /## How to write this message\n\nPLAYBOOK_SENTINEL: write a warm note\./);

    // Page context comes from the request.
    assert.match(prompt, /URL: https:\/\/www\.linkedin\.com\/in\/example-recruiter\//);
    assert.match(prompt, /Page title: Example Recruiter \| LinkedIn/);
    assert.match(prompt, /Draft a concise LinkedIn reach-out message about hiring opportunities\./);

    assert.match(prompt, /Return only the message body/);
  });

  it("does NOT hardcode hiring-specific message content in the scaffold", () => {
    const prompt = buildPrompt({
      personalContext: "About me text.",
      playbook: "PLAYBOOK_SENTINEL",
      request: validRequest(),
    });

    // The message shape, examples, and voice now live in the playbook, not the
    // scaffold. With a sentinel playbook none of the hiring specifics appear.
    assert.doesNotMatch(prompt, /A few things about me:/);
    assert.doesNotMatch(prompt, /Plainsight/);
    assert.doesNotMatch(prompt, /Legal AI startup/);
    assert.doesNotMatch(prompt, /day one/);
  });

  it("treats the screenshots as the source of truth when attached, in order", () => {
    const prompt = buildPrompt({
      personalContext: "About me.",
      playbook: "PB",
      request: validRequest(),
      hasScreenshot: true,
    });

    assert.match(prompt, /attached screenshots/i);
    assert.match(prompt, /source of truth/i);
    assert.match(prompt, /in order/i);
    assert.match(prompt, /FIRST screenshot is the recipient/);
    assert.doesNotMatch(prompt, /No screenshot is attached/);
  });

  it("tells the model to search the web for unfamiliar companies or people", () => {
    const prompt = buildPrompt({
      personalContext: "About me.",
      playbook: "PB",
      request: validRequest(),
    });

    assert.match(prompt, /search the web before drafting/i);
    assert.match(prompt, /Never guess or invent a mission/);
  });

  it("forbids image generation so Oracle never produces a visual asset", () => {
    const prompt = buildPrompt({
      personalContext: "About me.",
      playbook: "PB",
      request: validRequest(),
    });

    assert.match(prompt, /Text only/i);
    assert.match(prompt, /do not generate.*any image/i);
    assert.match(prompt, /do not call any image-generation tool/i);
  });

  it("falls back to title + URL guidance when no screenshot is attached", () => {
    const prompt = buildPrompt({
      personalContext: "About me.",
      playbook: "PB",
      request: validRequest(),
      hasScreenshot: false,
    });

    assert.match(prompt, /No screenshot is attached/);
    assert.doesNotMatch(prompt, /The attached screenshots are the source of truth/);
  });
});

function validRequest() {
  return {
    url: "https://www.linkedin.com/in/example-recruiter/",
    title: "Example Recruiter | LinkedIn",
    intent: "Draft a concise LinkedIn reach-out message about hiring opportunities.",
  };
}
