export function buildPrompt({ personalContext, playbook, request, hasScreenshot = true }) {
  const sections = [
    "You are drafting a single outreach message that the user will paste and send WITHOUT editing, so it must be ready to ship. Output only the final message body — no preamble, headings, quotes around the message, alternatives, or commentary. Text only: do not generate, attach, or describe any image, diagram, chart, or other visual, and do not call any image-generation tool.",
    "",
    "You are writing on behalf of the person described under \"About me\", to the recipient shown in the attached screenshots, following the style defined under \"How to write this message\".",
    "",
  ];

  if (hasScreenshot) {
    sections.push(
      "## The attached screenshots",
      "",
      "The attached screenshots are the source of truth for the recipient and the context, in order. The FIRST screenshot is the recipient — their profile, a post they wrote, or a recent activity. Later screenshots, if present, are additional context such as a job description, a company or product page, or another post. Read everything visible: names, headlines, companies, locations, the post or page content, and the mission behind it.",
      "",
      "Do not invent any detail that is not visible. If you need the recipient's name and it isn't shown, fall back to the page title, which usually starts with their name.",
      "",
    );
  } else {
    sections.push(
      "## No screenshot is attached",
      "",
      "No screenshot is attached. Use the page title and URL to figure out who the recipient is, and keep the message specific to what you can infer.",
      "",
    );
  }

  sections.push(
    "## If you don't recognize the company or person, search the web before drafting",
    "",
    "The opener and the closing line usually depend on naming what the recipient or their company actually does. If you don't recognize them and have a browsing or search tool available, look them up before writing. Never guess or invent a mission — search, or stick to what is visible in the screenshots.",
    "",
    "## How to write this message",
    "",
    playbook,
    "",
    "## About me",
    "",
    personalContext,
    "",
    "## The page the user is looking at",
    "",
    `- URL: ${request.url}`,
    `- Page title: ${request.title}`,
    "",
    "## Goal for this message",
    "",
    request.intent,
    "",
    "Return only the message body, ready to paste.",
  );

  return sections.join("\n");
}
