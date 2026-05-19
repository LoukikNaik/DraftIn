export const defaultIntent = "Draft a concise LinkedIn reach-out message about hiring opportunities.";

export function buildGeneratePayload({ tab, screenshotDataUrl, intent = defaultIntent }) {
  if (!tab?.url) {
    throw new Error("Cannot build generate payload without an active tab URL");
  }

  if (!screenshotDataUrl) {
    throw new Error("Cannot build generate payload without a screenshot");
  }

  return {
    url: tab.url,
    title: tab.title ?? "",
    screenshotDataUrl,
    intent,
  };
}
