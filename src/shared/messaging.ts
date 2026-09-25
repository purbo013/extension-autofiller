import contentScriptUrl from "../content/index.ts?script";
import { delay } from "./utils";

function isRestrictedTabUrl(url: string | undefined): boolean {
  if (!url) return true;
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("view-source:") ||
    url.startsWith("devtools://")
  );
}

export async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("Tab aktif tidak ditemukan.");
  }
  if (isRestrictedTabUrl(tab.url)) {
    throw new Error(
      "Extension tidak bisa berjalan di halaman ini. Buka situs form biasa (http/https), lalu coba lagi.",
    );
  }
  return tab.id;
}

async function trySendMessage<T>(tabId: number, action: string): Promise<T> {
  return chrome.tabs.sendMessage(tabId, { action }) as Promise<T>;
}

async function waitForContentScript<T>(tabId: number, action: string, attempts = 10): Promise<T | null> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await trySendMessage<T>(tabId, action);
    } catch {
      await delay(150);
    }
  }
  return null;
}

async function injectContentScript(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [contentScriptUrl],
    });
  } catch {
    // Loader may already be present, or the tab blocks injection (PDF viewer, etc.).
  }
}

export async function sendToActiveTab<T>(action: string): Promise<T> {
  const tabId = await getActiveTabId();

  const early = await waitForContentScript<T>(tabId, action, 6);
  if (early) return early;

  await injectContentScript(tabId);

  const afterInject = await waitForContentScript<T>(tabId, action, 12);
  if (afterInject) return afterInject;

  throw new Error(
    "Gagal memuat script di halaman ini. Di chrome://extensions klik Reload pada extension, refresh tab form, lalu coba lagi. Pastikan folder yang di-load adalah hasil build (subfolder extension/).",
  );
}
