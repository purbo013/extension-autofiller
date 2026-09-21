import contentScriptUrl from "../content/index.ts?script";

export async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("Tab aktif tidak ditemukan.");
  }
  return tab.id;
}

export async function sendToActiveTab<T>(action: string): Promise<T> {
  const tabId = await getActiveTabId();

  try {
    return await chrome.tabs.sendMessage(tabId, { action });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [contentScriptUrl],
    });
    return chrome.tabs.sendMessage(tabId, { action });
  }
}
