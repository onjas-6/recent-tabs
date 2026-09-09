// Created by GPT-6, Codex desktop, 2026-09-08.
import { Controller } from './controller.js';
const controller = new Controller(chrome);
const run = task => controller.enqueue(task).catch(error => console.warn(error.message));
const uiPorts = new Map();

chrome.runtime.onConnect.addListener(port => {
  if (!port.name.startsWith('switcher:') || !controller.trustedUI(port.sender)) return;
  const id = port.name.slice('switcher:'.length);
  if (!controller.sameSession({ sessionId: id }, port.sender)) { port.disconnect(); return; }
  const clients = uiPorts.get(id) || new Set();
  clients.add(port);
  uiPorts.set(id, clients);
  port.onMessage.addListener(() => {});
  port.onDisconnect.addListener(() => {
    clients.delete(port);
    if (!clients.size) {
      uiPorts.delete(id);
      run(async () => { if (controller.session?.id === id) await controller.cancel(); });
    }
  });
});

chrome.commands.onCommand.addListener((command, tab) => {
  const requestedAt = Date.now();
  if (command === 'next-recent' || command === 'previous-recent')
    controller.shortcut(command === 'next-recent' ? 1 : -1, tab, requestedAt)
      .catch(error => console.warn(error.message));
});
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  // Ignore our own outbound render/close notifications.
  if (message?.type === 'render' || message?.type === 'close') return false;
  controller.enqueue(() => controller.message(message, sender))
    .then(respond, error => respond({ ok: false, error: error.message }));
  return true;
});
chrome.tabs.onActivated.addListener(info => {
  controller.captureGeneration++;
  run(() => controller.activated(info));
});
chrome.tabs.onRemoved.addListener(id => {
  controller.captureGeneration++;
  run(() => controller.removed(id));
});
chrome.tabs.onUpdated.addListener((id, changes, tab) => {
  if (changes.url || changes.status === 'loading') controller.captureGeneration++;
  run(() => controller.updated(id, changes, tab));
});
chrome.tabs.onDetached.addListener(id => {
  controller.captureGeneration++;
  run(() => controller.removed(id));
});
chrome.tabs.onAttached.addListener((id, info) => run(async () => {
  const tab = await chrome.tabs.get(id);
  if (tab.active) await controller.activated({ tabId: id, windowId: info.newWindowId });
}));
chrome.tabs.onReplaced.addListener((added, removed) => {
  controller.captureGeneration++;
  run(async () => {
  await controller.removed(removed);
  const tab = await chrome.tabs.get(added);
  if (tab.active) await controller.activated({ tabId: added, windowId: tab.windowId });
  });
});
chrome.windows.onFocusChanged.addListener(id => {
  controller.captureGeneration++;
  run(async () => {
  if (controller.session && id !== controller.session.windowId) await controller.cancel();
  if (id !== chrome.windows.WINDOW_ID_NONE) {
    const tab = await controller.activeTab(id);
    if (tab) controller.scheduleCapture(tab.id);
  }
  });
});
chrome.windows.onRemoved.addListener(id => run(async () => {
  delete controller.history[id];
  if (controller.session?.windowId === id) await controller.cancel();
  await controller.save();
}));
chrome.permissions.onRemoved.addListener(() => run(async () => {
  if (!(await chrome.permissions.contains({ origins: ['<all_urls>'] }))) {
    controller.enabled = false;
    controller.cache = {};
    await chrome.storage.local.set({ previewsEnabled: false });
    await controller.cancel();
    await controller.saveCache();
    await controller.syncScripts();
  }
}));
chrome.runtime.onInstalled.addListener(details => run(async () => {
  if (details.reason === 'install') await chrome.runtime.openOptionsPage();
}));
