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
    assert.match(prompt, /150 to 200 words/);
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

  it("instructs the warm opener + five-bullet body + mission-tied closer shape", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    assert.match(prompt, /saw your \{hook\}/);
    assert.match(prompt, /sounds like exactly the kind of/i);
    assert.match(prompt, /A few things about me:/);
    assert.match(prompt, /Exactly five bullets/i);
    assert.match(prompt, /values, breadth, recent role, prior role, side project/);
    assert.match(prompt, /Would love to chat about how I could contribute to the team\./);
  });

  it("embeds three few-shot example messages so the model has the voice", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    assert.match(prompt, /Example 1/);
    assert.match(prompt, /Example 2/);
    assert.match(prompt, /Example 3/);
    assert.match(prompt, /Hey Tamir, saw your post/);
    assert.match(prompt, /Hey Priya, saw your post/);
    assert.match(prompt, /Hey Sam, saw Lumen's/);
    assert.match(prompt, /Before that at Plainsight/);
    assert.match(prompt, /PodClipper \(podclipper\.loukik\.dev\)/);
  });

  it("walks the bullets from values through breadth, both roles, and a side project", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    assert.match(prompt, /VALUES/);
    assert.match(prompt, /BREADTH/);
    assert.match(prompt, /RECENT ROLE/);
    assert.match(prompt, /PRIOR ROLE/);
    assert.match(prompt, /SIDE PROJECT/);

    // Recent employer stays unnamed; Plainsight is named.
    assert.match(prompt, /Keep `a Legal AI startup` unnamed/);
    assert.match(prompt, /Name `Plainsight`/);

    // Breadth bullet always grounds in the Bay Area + AI startups.
    assert.match(prompt, /AI startups in the Bay Area/);
  });

  it("tailors the message to the role's emphasis without changing the shape", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    assert.match(prompt, /role's emphasis/i);
    assert.match(prompt, /It does NOT change the overall shape/);

    // The three examples cover distinct role surfaces.
    assert.match(prompt, /Example 1 — FULL-STACK/);
    assert.match(prompt, /Example 2 — BACKEND/);
    assert.match(prompt, /Example 3 — ML \/ CV/);
  });

  it("bans the AI-template phrases the user flagged as fake", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    // Each phrase appears inside the "banned phrases" list, so the prompt
    // text itself should contain them (as forbidden examples).
    assert.match(prompt, /this really stood out to me/i);
    assert.match(prompt, /to be honest/i);
    assert.match(prompt, /i was impressed by your background/i);
    assert.match(prompt, /i would be a great fit because/i);
  });

  it("does not blacklist phrases the user wants to keep available", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    // Pull the banned-phrases block out of the prompt and assert these
    // phrases are NOT in the banned section. The phrases themselves do
    // appear elsewhere in the prompt, which is fine.
    const bannedBlock = extractSection(prompt, "## Banned phrases", "##");
    assert.doesNotMatch(bannedBlock, /would love to chat/i);
    assert.doesNotMatch(bannedBlock, /exactly the kind of/i);
  });

  it("uses standard punctuation and proper capitalization, not enforced lowercase", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    // No instruction that forces everything to lowercase.
    assert.doesNotMatch(prompt, /lowercase throughout/i);
    assert.doesNotMatch(prompt, /lowercase greeting/i);

    // Greetings in the examples use proper case.
    assert.match(prompt, /Hey Tamir, saw your post/);
    assert.match(prompt, /Hey Priya, saw your post/);
    assert.match(prompt, /Hey Sam, saw Lumen's/);

    // Proper-noun product/company names keep conventional casing.
    assert.match(prompt, /at Plainsight/);

    // Positive guidance for how to capitalize is in the prompt.
    assert.match(prompt, /standard sentence capitalization/i);
  });

  it("keeps the bullets warm and human, not JD comma-soup", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    assert.match(prompt, /15 to 35 words/);
    assert.match(prompt, /Conversational, first person/i);
    assert.match(prompt, /no insider jargon/i);
    assert.match(prompt, /genuinely love/i);
  });

  it("forbids image generation so Oracle never produces a visual asset", () => {
    const prompt = buildPrompt({
      personalContext: "Backend engineer.",
      request: validRequest(),
    });

    assert.match(prompt, /Text only/i);
    assert.match(prompt, /do not generate any image/i);
    assert.match(prompt, /do not call any image-generation tool/i);
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
