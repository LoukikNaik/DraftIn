export function handleContentMessage(message, environment = {}) {
  const documentRef = environment.document ?? globalThis.document;

  if (message?.type === "LREACHOUT_PING") {
    return {
      ok: true,
    };
  }

  if (message?.type === "LREACHOUT_COPY_MESSAGE") {
    return copyFromPage(documentRef, message.message ?? "").then((copied) => ({
      ok: true,
      copied,
    }));
  }

  return {
    ok: false,
    error: "Unknown lreachout message type",
  };
}

async function copyFromPage(documentRef, message) {
  documentRef.defaultView?.focus?.();

  const clipboard = documentRef.defaultView?.navigator?.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(message);
      return true;
    } catch (error) {
      console.warn("[lreachout] navigator.clipboard.writeText failed; falling back to execCommand", error);
    }
  }

  const previousActive = documentRef.activeElement;
  const textarea = documentRef.createElement("textarea");
  textarea.value = message;
  textarea.setAttribute?.("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";

  documentRef.body.append(textarea);
  textarea.focus();
  textarea.select();

  let succeeded = false;
  try {
    succeeded = Boolean(documentRef.execCommand("copy"));
  } catch (error) {
    console.warn("[lreachout] execCommand copy threw", error);
  } finally {
    documentRef.body.removeChild(textarea);
    previousActive?.focus?.();
  }

  return succeeded;
}

export function showOverlay({ message, copied, error }, documentRef = globalThis.document) {
  const existing = documentRef.getElementById?.("lreachout-overlay");
  existing?.remove?.();

  const overlay = documentRef.createElement("div");
  overlay.id = "lreachout-overlay";
  overlay.style.cssText = [
    "position: fixed",
    "right: 24px",
    "bottom: 24px",
    "z-index: 2147483647",
    "max-width: 420px",
    "padding: 14px 16px",
    "border-radius: 14px",
    "box-shadow: 0 16px 44px rgba(0,0,0,.22)",
    "background: #102018",
    "color: #f4fff8",
    "font: 13px/1.45 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    "white-space: pre-wrap",
  ].join(";");

  const status = arguments[0].status ??
    (error
    ? `lreachout error: ${error}`
    : `Draft ready${copied ? " - copied" : ""}`);

  overlay.textContent = message ? `${status}\n\n${message}` : status;
  documentRef.body.append(overlay);

  const timer = setTimeout(() => overlay.remove(), error ? 10000 : 8000);
  timer.unref?.();
}

if (globalThis.chrome?.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "LREACHOUT_SHOW_OVERLAY") {
      showOverlay(message);
      sendResponse({ ok: true });
      return false;
    }

    const result = handleContentMessage(message);
    if (result && typeof result.then === "function") {
      result.then(sendResponse, (error) => sendResponse({ ok: false, error: error?.message }));
      return true;
    }

    sendResponse(result);
    return false;
  });
}
