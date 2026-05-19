import { copyMessageToClipboard } from "./clipboard-output.js";
import { buildGeneratePayload } from "./invocation-payload.js";
import { generateMessage } from "./server-client.js";

chrome.action.onClicked.addListener((tab) => {
  console.info("[lreachout] toolbar clicked", tab?.url);
  draftForTab(tab);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "draft-linkedin-message") {
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.info("[lreachout] command invoked", command, tab?.url);
  await draftForTab(tab);
});

async function draftForTab(tab) {
  try {
    if (!tab?.id) {
      throw new Error("No active tab found");
    }

    console.info("[lreachout] starting draft", { tabId: tab.id, url: tab.url });
    await ensureContentScript(tab.id);
    await showStatus(tab.id, { status: "Drafting LinkedIn message..." });

    const screenshotDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });
    console.info("[lreachout] captured screenshot", { bytes: screenshotDataUrl.length });
    const payload = buildGeneratePayload({ tab, screenshotDataUrl });
    console.info("[lreachout] sending payload to local server");
    const result = await generateMessage({ payload });
    console.info("[lreachout] received draft", { chars: result.message.length });
    const offscreenCopy = await copyMessageViaOffscreen(result.message);
    const clipboardResult = offscreenCopy.copied
      ? { copied: true }
      : await copyMessageToClipboard(result.message);
    const pageCopyResult = clipboardResult.copied
      ? { copied: true }
      : await copyMessageInPage(tab.id, result.message);
    const copied = offscreenCopy.copied || clipboardResult.copied || pageCopyResult.copied;
    const insertion = await insertMessage(tab.id, result.message);

    await showStatus(tab.id, {
      message: result.message,
      copied,
      inserted: insertion.inserted,
      error: copied ? undefined : offscreenCopy.error ?? clipboardResult.error,
    });
  } catch (error) {
    console.error("[lreachout] draft failed", error);
    if (tab?.id) {
      await showStatus(tab.id, { message: "", error: error.message });
    }
  }
}

const OFFSCREEN_URL = "src/offscreen.html";
let offscreenSetup = null;

async function copyMessageViaOffscreen(message) {
  if (!chrome.offscreen) {
    return { copied: false, error: "offscreen API unavailable" };
  }

  try {
    await ensureOffscreenDocument();
    const response = await chrome.runtime.sendMessage({
      type: "LREACHOUT_OFFSCREEN_COPY",
      message,
    });

    console.info("[lreachout] offscreen clipboard", { ok: Boolean(response?.ok) });
    if (response?.ok) {
      return { copied: true };
    }

    return { copied: false, error: response?.error ?? "offscreen copy returned no response" };
  } catch (error) {
    console.warn("[lreachout] offscreen clipboard failed", error);
    return { copied: false, error: error?.message };
  }
}

async function ensureOffscreenDocument() {
  if (typeof chrome.offscreen.hasDocument === "function") {
    const exists = await chrome.offscreen.hasDocument();
    if (exists) {
      return;
    }
  }

  if (!offscreenSetup) {
    offscreenSetup = chrome.offscreen
      .createDocument({
        url: OFFSCREEN_URL,
        reasons: ["CLIPBOARD"],
        justification: "Write generated LinkedIn reach-out message to the clipboard.",
      })
      .catch((error) => {
        offscreenSetup = null;
        if (!String(error?.message ?? "").includes("Only a single offscreen document")) {
          throw error;
        }
      });
  }

  await offscreenSetup;
}

async function copyMessageInPage(tabId, message) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: "LREACHOUT_COPY_MESSAGE",
      message,
    });

    console.info("[lreachout] page clipboard fallback", { copied: Boolean(response?.copied) });
    return { copied: Boolean(response?.copied) };
  } catch (error) {
    console.warn("[lreachout] page clipboard fallback failed", error);
    return { copied: false };
  }
}

async function ensureContentScript(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: "LREACHOUT_PING",
    });

    if (response?.ok) {
      console.info("[lreachout] content script already active");
      return;
    }
  } catch {
    console.info("[lreachout] content script not active; injecting");
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["src/content-runtime.js"],
  });
  console.info("[lreachout] content script injected");
}

async function insertMessage(tabId, message) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: "LREACHOUT_INSERT_MESSAGE",
      message,
    });

    return { inserted: Boolean(response?.inserted) };
  } catch {
    return { inserted: false };
  }
}

async function showStatus(tabId, payload) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "LREACHOUT_SHOW_OVERLAY",
      ...payload,
    });
  } catch (error) {
    console.warn("[lreachout] could not show overlay", error);
    // The overlay is best-effort. Clipboard remains the reliable output path.
  }
}
