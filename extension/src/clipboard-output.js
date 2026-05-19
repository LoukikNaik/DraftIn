export async function copyMessageToClipboard(message, options = {}) {
  const clipboard = options.clipboard ?? globalThis.navigator?.clipboard;

  try {
    await clipboard.writeText(message);
    return { copied: true, message };
  } catch (error) {
    return {
      copied: false,
      message,
      error: error.message,
    };
  }
}
