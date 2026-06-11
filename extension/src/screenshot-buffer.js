const STORAGE_KEY = "draftin.screenshots";

export async function getScreenshots(options = {}) {
  const storage = resolveStorage(options);
  const result = await storage.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? [];
}

export async function appendScreenshot(dataUrl, options = {}) {
  const storage = resolveStorage(options);
  const existing = await getScreenshots({ storage });
  const next = [...existing, dataUrl];
  await storage.set({ [STORAGE_KEY]: next });
  return next.length;
}

export async function clearScreenshots(options = {}) {
  const storage = resolveStorage(options);
  await storage.remove(STORAGE_KEY);
}

function resolveStorage(options) {
  return options.storage ?? chrome.storage.session;
}
