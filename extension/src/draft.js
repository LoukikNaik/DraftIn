export async function handleAddScreenshot({ tab, capture, buffer, setBadge }) {
  const dataUrl = await capture(tab);
  const count = await buffer.append(dataUrl);
  setBadge(String(count));
}

export async function handleClearBuffer({ buffer, setBadge }) {
  await buffer.clear();
  setBadge("");
}

export async function handleDraft({ tab, capture, buffer, setBadge, sendDraft }) {
  const buffered = await buffer.get();
  const screenshots = buffered.length > 0 ? buffered : [await capture(tab)];
  await sendDraft({ tab, screenshots });
  await buffer.clear();
  setBadge("");
}
