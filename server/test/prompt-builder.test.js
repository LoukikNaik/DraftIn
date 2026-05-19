import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildPrompt } from "../src/prompt-builder.js";

describe("prompt builder", () => {
  it("includes profile, page url + title, length, and antipattern guidance", () => {
    const prompt = buildPrompt({
      personalContext: "I am a backend engineer who has worked on hiring platforms.",
      request: validRequest(),
    });

    assert.match(prompt, /backend engineer who has worked on hiring platforms/);
    assert.match(prompt, /URL: https:\/\/www\.linkedin\.com\/in\/example-recruiter\//);
    assert.match(prompt, /Page title: Example Recruiter \| LinkedIn/);
    assert.match(prompt, /first name only/i);
    assert.match(prompt, /120 to 180 words/);
    assert.match(prompt, /em dashes/);
    assert.match(prompt, /never invent/i);
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

  it("frames multi-screenshot attachments as an ordered set", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
      hasScreenshot: true,
    });

    assert.match(prompt, /attached screenshots/i);
    assert.match(prompt, /in order/i);
  });

  it("instructs the fixed template shape: opener, bulleted body, day-one closer", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    assert.match(prompt, /i'll keep this short/i);
    assert.match(prompt, /based in the bay area/i);
    assert.match(prompt, /4 to 5 bullets/i);
    assert.match(prompt, /day one/i);
    assert.match(prompt, /across the stack/i);
  });

  it("embeds three few-shot example messages so the model has the voice", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    assert.match(prompt, /Example 1/);
    assert.match(prompt, /Example 2/);
    assert.match(prompt, /Example 3/);
    assert.match(prompt, /Hey Priya, I'm Loukik/);
    assert.match(prompt, /Hi Jordan, I'm Loukik/);
    assert.match(prompt, /Hey Sam, I'm Loukik/);
    assert.match(prompt, /M&A backend service at Eudia/);
    assert.match(prompt, /Shipped real-time segmentation APIs at Plainsight/);
  });

  it("bans the AI-template phrases the user flagged as fake", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    // Each phrase appears inside the "banned phrases" list, so the prompt
    // text itself should contain them (as forbidden examples).
    assert.match(prompt, /this really stood out to me/i);
    assert.match(prompt, /this is the kind of work i have been looking for/i);
    assert.match(prompt, /to be honest/i);
    assert.match(prompt, /came across your profile/i);
    assert.match(prompt, /i was impressed by your background/i);
    assert.match(prompt, /here's what i've done/i);
    assert.match(prompt, /i would be a great fit because/i);
  });

  it("uses standard punctuation and proper capitalization, not enforced lowercase", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    // No instruction that forces everything to lowercase.
    assert.doesNotMatch(prompt, /lowercase throughout/i);
    assert.doesNotMatch(prompt, /lowercase greeting/i);
    assert.doesNotMatch(prompt, /lowercase product and library names/i);

    // Greetings and identity in the examples use proper case.
    assert.match(prompt, /Hey Priya, I'm Loukik/);
    assert.match(prompt, /Hi Jordan, I'm Loukik/);
    assert.match(prompt, /Hey Sam, I'm Loukik/);

    // Proper-noun product/company names keep conventional casing in the examples.
    assert.match(prompt, /M&A backend service at Eudia/);
    assert.match(prompt, /at Plainsight/);

    // Closing tag is capitalized.
    assert.match(prompt, /I've worked across the stack/);

    // Positive guidance for how to capitalize is in the prompt.
    assert.match(prompt, /standard sentence capitalization/i);
  });

  it("does not blacklist phrases the user wants to keep available", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    // Pull the banned-phrases block out of the prompt and assert these
    // phrases are NOT in the banned section. The phrases themselves do
    // appear elsewhere in the prompt (in the examples and template), which
    // is fine — the assertion is specifically about the banned list.
    const bannedBlock = extractSection(prompt, "## Banned phrases", "##");
    assert.doesNotMatch(bannedBlock, /love what you're building/i);
    assert.doesNotMatch(bannedBlock, /would love to chat/i);
    assert.doesNotMatch(bannedBlock, /would love to connect/i);
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

function extractSection(prompt, startMarker, endMarker) {
  const startIndex = prompt.indexOf(startMarker);
  assert.notEqual(startIndex, -1, `expected prompt to contain section "${startMarker}"`);
  const rest = prompt.slice(startIndex + startMarker.length);
  const endIndex = rest.indexOf(endMarker);
  return endIndex === -1 ? rest : rest.slice(0, endIndex);
}
