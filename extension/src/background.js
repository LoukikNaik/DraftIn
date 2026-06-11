import { copyMessageToClipboard } from "./clipboard-output.js";
import {
  handleAddScreenshot,
  handleClearBuffer,
  handleDraft,
} from "./draft.js";
import { buildGeneratePayload } from "./invocation-payload.js";
import {
  appendScreenshot,
  clearScreenshots,
  getScreenshots,
} from "./screenshot-buffer.js";
import { generateMessage } from "./server-client.js";

const BADGE_BACKGROUND = "#0a66c2";

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: BADGE_BACKGROUND });
});

chrome.action.onClicked.addListener((tab) => {
  console.info("[draftin] toolbar clicked", tab?.url);
  draftForTab(tab);
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.info("[draftin] command invoked", command, tab?.url);

  switch (command) {
    case "draft-linkedin-message":
      await draftForTab(tab);
      return;
    case "add-screenshot":
      await addScreenshotForTab(tab);
      return;
    case "clear-screenshots":
      await clearBuffer(tab);
      return;
    default:
      console.warn("[draftin] unknown command", command);
  }
});

const buffer = {
  append: (dataUrl) => appendScreenshot(dataUrl),
  get: () => getScreenshots(),
  clear: () => clearScreenshots(),
};

const setBadge = (text) => chrome.action.setBadgeText({ text });

const captureViewport = (tab) =>
  chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });

async function addScreenshotForTab(tab) {
  try {
    if (!tab?.id) {
      throw new Error("No active tab found");
    }

    await handleAddScreenshot({
      tab,
      capture: captureViewport,
      buffer,
      setBadge,
    });

    const count = (await buffer.get()).length;
    console.info("[draftin] screenshot added to buffer", { count });
    await showFlash(tab.id, `Buffered screenshot ${count}`);
  } catch (error) {
    console.error("[draftin] add-screenshot failed", error);
    if (tab?.id) {
      await showFlash(tab.id, `draftin: `);
    }
  }
}

async function clearBuffer(tab) {
  try {
    await handleClearBuffer({ buffer, setBadge });
    console.info("[draftin] screenshot buffer cleared");
    if (tab?.id) {
      await showFlash(tab.id, "Screenshot buffer cleared");
    }
  } catch (error) {
    console.error("[draftin] clear-screenshots failed", error);
  }
}

async function draftForTab(tab) {
  try {
    if (!tab?.id) {
      throw new Error("No active tab found");
    }

    console.info("[draftin] starting draft", { tabId: tab.id, url: tab.url });
    await ensureContentScript(tab.id);
    await showStatus(tab.id, { status: "Drafting LinkedIn message..." });

    await handleDraft({
      tab,
      capture: captureViewport,
      buffer,
      setBadge,
      sendDraft: ({ tab: draftTab, screenshots }) => sendDraft(draftTab, screenshots),
    });
  } catch (error) {
    console.error("[draftin] draft failed", error);
    if (tab?.id) {
      await showStatus(tab.id, { message: "", error: error.message });
    }
  }
}

async function sendDraft(tab, screenshots) {
  console.info("[draftin] preparing draft", { screenshotCount: screenshots.length });
  const payload = buildGeneratePayload({ tab, screenshots });
  console.info("[draftin] sending payload to local server");
  const result = await generateMessage({ payload });
  console.info("[draftin] received draft", { chars: result.message.length });

  const offscreenCopy = await copyMessageViaOffscreen(result.message);
  const clipboardResult = offscreenCopy.copied
    ? { copied: true }
    : await copyMessageToClipboard(result.message);
  const pageCopyResult = clipboardResult.copied
    ? { copied: true }
    : await copyMessageInPage(tab.id, result.message);
  const copied = offscreenCopy.copied || clipboardResult.copied || pageCopyResult.copied;

  await showStatus(tab.id, {
    message: result.message,
    copied,
    error: copied ? undefined : offscreenCopy.error ?? clipboardResult.error,
  });
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
      type: "DRAFTIN_OFFSCREEN_COPY",
      message,
    });

    console.info("[draftin] offscreen clipboard", { ok: Boolean(response?.ok) });
    if (response?.ok) {
      return { copied: true };
    }

    return { copied: false, error: response?.error ?? "offscreen copy returned no response" };
  } catch (error) {
    console.warn("[draftin] offscreen clipboard failed", error);
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
      type: "DRAFTIN_COPY_MESSAGE",
      message,
    });

    console.info("[draftin] page clipboard fallback", { copied: Boolean(response?.copied) });
    return { copied: Boolean(response?.copied) };
  } catch (error) {
    console.warn("[draftin] page clipboard fallback failed", error);
    return { copied: false };
  }
}

async function ensureContentScript(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: "DRAFTIN_PING",
    });

    if (response?.ok) {
      console.info("[draftin] content script already active");
      return;
    }
  } catch {
    console.info("[draftin] content script not active; injecting");
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["src/content-runtime.js"],
  });
  console.info("[draftin] content script injected");
}

async function showStatus(tabId, payload) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "DRAFTIN_SHOW_OVERLAY",
      ...payload,
    });
  } catch (error) {
    console.warn("[draftin] could not show overlay", error);
  }
}

async function showFlash(tabId, text) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (status) => {
        document.getElementById("draftin-flash")?.remove();
        const el = document.createElement("div");
        el.id = "draftin-flash";
        el.textContent = status;
        el.style.cssText =
          "position:fixed;right:24px;bottom:24px;z-index:2147483647;padding:10px 14px;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.25);background:#102018;color:#f4fff8;font:13px/1.4 ui-sans-serif,system-ui,sans-serif;max-width:320px";
        document.body.append(el);
        setTimeout(() => el.remove(), 2500);
      },
      args: [text],
    });
  } catch {
    // Unsupported page (chrome://, devtools, etc.) — badge is the canonical feedback.
  }
}
