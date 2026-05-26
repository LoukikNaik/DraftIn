export const defaultIntent =
  "Draft a reach-out message to the person in the screenshots, following the configured playbook.";

export function buildGeneratePayload({ tab, screenshots, intent = defaultIntent }) {
  if (!tab?.url) {
    throw new Error("Cannot build generate payload without an active tab URL");
  }

  if (!Array.isArray(screenshots) || screenshots.length === 0) {
    throw new Error("Cannot build generate payload without at least one screenshot");
  }

  return {
    url: tab.url,
    title: tab.title ?? "",
    screenshots,
    intent,
  };
}
