chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "DRAFTIN_OFFSCREEN_COPY") {
    return false;
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = message.message ?? "";
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";

    document.body.append(textarea);
    textarea.focus();
    textarea.select();

    const ok = document.execCommand("copy");
    textarea.remove();

    sendResponse({ ok: Boolean(ok) });
  } catch (error) {
    sendResponse({ ok: false, error: error?.message });
  }

  return false;
});
