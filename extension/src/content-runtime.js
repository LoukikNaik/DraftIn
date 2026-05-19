(() => {
  function insertIntoFocusedEditor(documentRef, message) {
    const element = documentRef.activeElement;

    if (!element) {
      return { inserted: false };
    }

    if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
      element.value = message;
      dispatchInput(documentRef, element);
      return { inserted: true };
    }

    if (element.isContentEditable) {
      element.textContent = message;
      dispatchInput(documentRef, element);
      return { inserted: true };
    }

    return { inserted: false };
  }

  function showOverlay({ message, copied, inserted, error, status: providedStatus }, documentRef = document) {
    documentRef.getElementById?.("lreachout-overlay")?.remove?.();

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

    const status = providedStatus ?? (error
      ? `lreachout error: ${error}`
      : `Draft ready${copied ? " - copied" : ""}${inserted ? " - inserted" : ""}`);

    overlay.textContent = message ? `${status}\n\n${message}` : status;
    documentRef.body.append(overlay);
    const timer = setTimeout(() => overlay.remove(), error ? 10000 : 8000);
    timer.unref?.();
  }

  function handleContentMessage(message) {
    if (message?.type === "LREACHOUT_PING") {
      return {
        ok: true,
      };
    }

    if (message?.type === "LREACHOUT_INSERT_MESSAGE") {
      const result = insertIntoFocusedEditor(document, message.message ?? "");
      return {
        ok: true,
        inserted: result.inserted,
      };
    }

    if (message?.type === "LREACHOUT_COPY_MESSAGE") {
      return copyFromPage(document, message.message ?? "").then((copied) => ({
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

  function dispatchInput(documentRef, element) {
    const EventConstructor = documentRef.defaultView?.InputEvent ?? documentRef.defaultView?.Event ?? Event;
    element.dispatchEvent(new EventConstructor("input", { bubbles: true, inputType: "insertText" }));
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.info("[lreachout] content message", message?.type);
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
})();
