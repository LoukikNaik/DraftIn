export function buildPrompt({ personalContext, request, hasScreenshot = true }) {
  const sections = [
    "You are drafting a single LinkedIn reach-out message on behalf of the person described under \"About me\".",
    "Output only the final message body. No preamble, no headings, no quotation marks around the message, no alternatives, no commentary.",
    "",
    "## About me",
    personalContext,
    "",
    "## Goal for this message",
    request.intent,
    "",
    "## LinkedIn page the user is looking at",
    `- URL: ${request.url}`,
    `- Page title: ${request.title}`,
  ];

  if (hasScreenshot) {
    sections.push(
      "",
      "The attached screenshots, in order, are pages the user wants you to consider together when drafting the message. Typically the first is a LinkedIn profile or post about the recipient, and later screenshots may be a job description, a company careers page, or another piece of context on the same opportunity. Read all of them as the source of truth for the recipient and the role: name, headline, current company, location, About text, recent posts, hiring banners, role descriptions, anything visible. The user has scrolled to whatever they consider relevant in each capture, so the visible portion is what matters. The page title and URL only confirm which LinkedIn page anchors the request.",
      "",
      "If a detail you would want (the recipient's name, a specific role title, a team) is not visible in any of the screenshots, do not invent it. Work with what you can see, or fall back to the page title which usually starts with the recipient's name.",
    );
  } else {
    sections.push(
      "",
      "No screenshot is attached. Use the page title and URL to figure out who the recipient is, and keep the message generic but specific to that role surface.",
    );
  }

  sections.push(
    "",
    "## How to write it",
    "1. Pick ONE specific, concrete hook from what is visible: a hiring post, a recent talk, a product they shipped, a stated focus area, a technology they mentioned, a domain they work in. Do not invent details.",
    "2. Open with a direct greeting using their first name only.",
    "3. One sentence stating the hook.",
    "4. One sentence connecting that hook to ONE relevant slice of \"About me\". Choose the slice using the matching entry under \"Example Angles\" in the profile (recruiter, engineering manager, founder, legal AI / document intelligence, computer vision / MLOps).",
    "5. One short, low-friction ask. Examples: \"Are you the right person to talk to about backend openings?\", \"Would the team be open to a 15-minute chat next week?\", \"Is the team hiring for platform or AI infra roles right now?\".",
    "",
    "## Length and tone",
    "- 60 to 90 words. Hard cap at 110 words and 700 characters so the message fits in a LinkedIn connection note if needed.",
    "- Conversational and direct. Sound like one thoughtful person writing one message, not a recruiter template.",
    "- At most two technologies or projects named. Lead with impact, not jargon.",
    "",
    "## Do not",
    "- Use em dashes (—), emoji, or smart quotes. Use periods and commas.",
    "- Use generic openers: \"I hope this finds you well\", \"I came across your profile\", \"I was impressed by your background\", \"Hope you are doing well\".",
    "- Use cover-letter phrasing: \"I would be a great fit because\", \"I am writing to express interest\".",
    "- Flatter without a specific fact: \"Your work is amazing\", \"Love what you are building\".",
    "- Claim a prior relationship, mutual contact, or previous outreach that is not stated in the page.",
    "- Say I am currently employed at a specific company unless the page states it.",
    "- Mention that this message was generated, drafted from a screenshot, or automated in any way.",
    "- Invent facts about the recipient, their company, open roles, or my background.",
    "- Produce more than one message, alternatives, or any commentary.",
    "",
    "Return only the message body, ready to paste.",
  );

  return sections.join("\n");
}
