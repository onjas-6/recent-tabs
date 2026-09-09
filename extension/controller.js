// Created by GPT-6, Codex desktop, 2026-09-08.
import { reconcileHistory, recordActivation, removeTab, createSelection,
  stepSelection, removeFromSelection, selectedId } from './history.js';
import { trimPreviews, previewBytes, shrinkScreenshot } from './previews.js';

const webPage = (url) => /^https?:\/\//.test(url || '');
const ignore = (promise) => promise?.catch(() => {});

export class Controller {
  constructor(api) {
    this.api = api;
    this.history = {};
    this.cache = {};
    this.session = null;
    this.enabled = false;
    this.tail = Promise.resolve();
    this.captureTimers = new Map();
    this.navigationVersions = new Map();
    this.lastCaptureAt = 0;
    this.captureBusy = false;
    this.captureGeneration = 0;
    this.ready = this.initialize();
  }

  async initialize() {
    const [saved, settings, tabs] = await Promise.all([
      this.api.storage.session.get(['history', 'previewCache', 'selectionSession']),
      this.api.storage.local.get('previewsEnabled'),
      this.api.tabs.query({ windowType: 'normal' })
    ]);
    this.history = reconcileHistory(saved.history || {}, tabs);
    const live = new Map(tabs.map(tab => [tab.id, tab]));
    this.cache = trimPreviews(Object.fromEntries(Object.entries(saved.previewCache || {})
      .filter(([id, image]) => live.get(Number(id))?.url === image.url)));
    // Selection belongs to a live UI. Never resurrect an invisible popup after
    // worker restart; only durable visit order and session-local previews restore.
    this.enabled = settings.previewsEnabled === true &&
      await this.api.permissions.contains({ origins: ['<all_urls>'] });
    if (!this.enabled) this.cache = {};
    await this.save();
    await this.saveCache();
    await this.syncScripts();
  }

  enqueue(task) {
    const result = this.tail.then(() => this.ready).then(task);
    this.tail = result.catch(error => console.warn('Recent Tabs:', error.message));
    return result;
  }

  async save() {
    await this.api.storage.session.set({ history: this.history, selectionSession: this.session });
  }

  async saveCache() {
    this.cache = trimPreviews(this.cache);
    await this.api.storage.session.set({ previewCache: this.cache });
  }

  async syncScripts() {
    const scripts = await this.api.scripting.getRegisteredContentScripts();
    const registered = scripts.some(script => script.id === 'arc-overlay');
    if (this.enabled && !registered) await this.api.scripting.registerContentScripts([{
      id: 'arc-overlay', matches: ['http://*/*', 'https://*/*'], js: ['overlay.js'],
      runAt: 'document_start', persistAcrossSessions: true
    }]);
    if (!this.enabled && registered)
      await this.api.scripting.unregisterContentScripts({ ids: ['arc-overlay'] });
  }

  async settings() {
    const commands = await this.api.commands.getAll();
    return { enabled: this.enabled,
      shortcut: commands.find(command => command.name === 'next-recent')?.shortcut || '',
      cacheCount: Object.keys(this.cache).length, cacheBytes: previewBytes(this.cache) };
  }

  async payload() {
    if (!this.session) return { ok: false, error: 'No active tab switcher. Open it again.' };
    const current = this.session;
    const tabs = await this.api.tabs.query({ windowId: current.windowId });
    const byId = new Map(tabs.map(tab => [tab.id, tab]));
    for (const id of [...current.selection.ids]) {
      if (!byId.has(id)) current.selection = removeFromSelection(current.selection, id);
    }
    if (!current.selection) {
      await this.cancel();
      return { ok: false, error: 'No tabs remain in this window.' };
    }
    const settings = await this.settings();
    return { ok: true, session: structuredClone(current), settings, shortcut: settings.shortcut,
      tabs: current.selection.ids.map(id => {
        const tab = byId.get(id);
        const snapshot = this.cache[id];
        return { id, title: tab.title || tab.url || 'Untitled tab', url: tab.url || '',
          thumbnail: this.enabled && snapshot?.url === tab.url ? snapshot.data : undefined };
      }) };
  }

  async render() {
    const data = await this.payload();
    // Web-accessible panel documents must fetch their data through the validated
    // handshake. A broadcast must never contain browsing metadata or screenshots.
    if (data.ok) ignore(this.api.runtime.sendMessage({ type: 'render', sessionId: data.session.id }));
  }

  async activeTab(windowId) {
    const query = Number.isInteger(windowId) ? { windowId, active: true } :
      { lastFocusedWindow: true, active: true };
    return (await this.api.tabs.query(query))[0];
  }

  async begin(direction = 1, manual = false, sourceTab, requestedAt = Date.now()) {
    this.captureGeneration++;
    const tab = sourceTab?.id ? await this.api.tabs.get(sourceTab.id) : await this.activeTab();
    if (!tab || tab.incognito || (await this.api.windows.get(tab.windowId)).type !== 'normal')
      return { ok: false, error: 'Open a normal Chrome window first.' };
    if (this.session && this.session.windowId === tab.windowId &&
        this.session.sourceTabId === tab.id && !manual) {
      this.session.selection = stepSelection(this.session.selection, direction);
      await this.save();
      await this.render();
      return { ok: true };
    }
    await this.cancel();
    const tabs = await this.api.tabs.query({ windowType: 'normal' });
    this.history = reconcileHistory(this.history, tabs);
    const ids = this.history[tab.windowId] || [tab.id];
    this.session = { id: crypto.randomUUID(), windowId: tab.windowId, sourceTabId: tab.id,
      mode: manual ? 'manual' : 'hold', selection: createSelection(ids, direction),
      createdAt: requestedAt, surface: manual ? 'popup' : 'pending' };
    await this.save();
    if (manual) return this.payload();
    if (this.enabled && webPage(tab.url)) {
      try {
        await this.api.scripting.executeScript({ target: { tabId: tab.id }, files: ['overlay.js'] });
        this.session.surface = 'overlay';
        const response = await this.api.tabs.sendMessage(tab.id,
          { type: 'show-overlay', sessionId: this.session.id }, { frameId: 0 });
        if (!response?.ok) throw new Error('Overlay did not open');
        await this.save();
        if (response.releasedAt >= requestedAt && this.session) await this.commit();
        return { ok: true };
      } catch {
        if (this.session) ignore(this.api.tabs.sendMessage(tab.id,
          { type: 'hide-overlay', sessionId: this.session.id }, { frameId: 0 }));
      }
    }
    if (!this.session) return { ok: true };
    this.session.surface = 'popup';
    await this.save();
    try { await this.api.action.openPopup({ windowId: tab.windowId }); }
    catch (error) {
      await this.cancel();
      throw new Error('Could not open preview. Pin the extension and click its icon. ' + error.message);
    }
    return { ok: true };
  }

  async cancel() {
    const current = this.session;
    if (!current) return;
    this.session = null;
    await this.save();
    ignore(this.api.tabs.sendMessage(current.sourceTabId,
      { type: 'hide-overlay', sessionId: current.id }, { frameId: 0 }));
    ignore(this.api.runtime.sendMessage({ type: 'close', sessionId: current.id }));
  }

  async commit(tabId) {
    const current = this.session;
    if (!current) return { ok: true };
    const id = tabId ?? selectedId(current.selection);
    if (!current.selection.ids.includes(id)) return { ok: false, error: 'Tab is not in this selection.' };
    let target;
    try { target = await this.api.tabs.get(id); } catch { /* closed while choosing */ }
    if (!target || target.windowId !== current.windowId) {
      current.selection = removeFromSelection(current.selection, id);
      if (current.selection) await this.render(); else await this.cancel();
      return { ok: false, error: 'That tab was closed. Choose another tab.' };
    }
    await this.cancel();
    await this.api.tabs.update(id, { active: true });
    this.history = recordActivation(this.history, target.windowId, id);
    await this.save();
    this.scheduleCapture(id);
    return { ok: true };
  }

  // Only our own extension-origin UI can retrieve cross-tab titles or screenshots.
  trustedUI(sender) {
    return sender.id === this.api.runtime.id && ['panel.html', 'popup.html', 'options.html']
      .some(path => sender.url?.split('?')[0] === this.api.runtime.getURL(path));
  }

  sameSession(message, sender) {
    if (!this.session || message.sessionId !== this.session.id) return false;
    if (this.trustedUI(sender)) {
      return !sender.tab || sender.tab.id === this.session.sourceTabId;
    }
    return sender.id === this.api.runtime.id && sender.tab?.id === this.session.sourceTabId && sender.frameId === 0;
  }

  async message(message, sender) {
    if (!message || typeof message.type !== 'string') return { ok: false };
    const trusted = this.trustedUI(sender);
    if (message.type === 'get-settings' && trusted) return this.settings();
    if (message.type === 'clear-previews' && trusted) {
      this.captureGeneration++;
      this.cache = {}; await this.saveCache(); await this.render(); return { ok: true };
    }
    if (message.type === 'set-previews' && trusted) {
      this.captureGeneration++;
      this.enabled = message.enabled === true && await this.api.permissions.contains({ origins: ['<all_urls>'] });
      await this.api.storage.local.set({ previewsEnabled: this.enabled });
      if (!this.enabled) { await this.cancel(); this.cache = {}; await this.saveCache(); }
      await this.syncScripts();
      if (this.enabled) {
        const tabs = await this.api.tabs.query({ windowType: 'normal' });
        for (const tab of tabs.filter(tab => webPage(tab.url) && !tab.discarded)) {
          ignore(this.api.scripting.executeScript({ target: { tabId: tab.id }, files: ['overlay.js'] }));
          if (tab.active) this.scheduleCapture(tab.id);
        }
      }
      return { ok: true, enabled: this.enabled };
    }
    if (message.type === 'ui-ready' && trusted) {
      const isPopup = sender.url?.split('?')[0] === this.api.runtime.getURL('popup.html');
      if ((message.surface === 'popup' && !isPopup) ||
          (message.surface === 'overlay' && !message.sessionId)) return { ok: false, error: 'Invalid switcher.' };
      if (!this.session && message.surface === 'popup' && !message.sessionId) {
        await this.begin(1, true);
      }
      if (!this.session || (message.sessionId && message.sessionId !== this.session.id) ||
          (sender.tab && sender.tab.id !== this.session.sourceTabId))
        return { ok: false, error: 'This switcher is no longer active.' };
      return this.payload();
    }
    if (message.type === 'modifier-released' && sender.id === this.api.runtime.id &&
        ((sender.frameId === 0 && sender.tab?.id === this.session?.sourceTabId) ||
          (trusted && this.sameSession(message, sender))) &&
        this.session.mode === 'hold' && message.at >= this.session.createdAt) return this.commit();
    if (!this.sameSession(message, sender)) return { ok: false, error: 'Selection expired.' };
    if (message.type === 'step') {
      this.session.selection = stepSelection(this.session.selection, message.direction < 0 ? -1 : 1);
      await this.save(); await this.render(); return { ok: true };
    }
    if (message.type === 'commit') return this.commit(message.tabId);
    if (message.type === 'cancel' || message.type === 'ui-disconnected') {
      await this.cancel(); return { ok: true };
    }
    return { ok: false, error: 'Unknown request.' };
  }

  async activated({ tabId, windowId }) {
    if (this.session && (this.session.windowId !== windowId || this.session.sourceTabId !== tabId))
      await this.cancel();
    this.history = recordActivation(this.history, windowId, tabId);
    await this.save();
    this.scheduleCapture(tabId);
  }

  async removed(tabId) {
    this.history = removeTab(this.history, tabId);
    delete this.cache[tabId];
    this.navigationVersions.delete(tabId);
    clearTimeout(this.captureTimers.get(tabId));
    this.captureTimers.delete(tabId);
    if (this.session?.sourceTabId === tabId) await this.cancel();
    else if (this.session) {
      this.session.selection = removeFromSelection(this.session.selection, tabId);
      if (!this.session.selection) await this.cancel(); else await this.render();
    }
    await this.save(); await this.saveCache();
  }

  async updated(tabId, changes, tab) {
    if (changes.url || changes.status === 'loading') {
      this.navigationVersions.set(tabId, (this.navigationVersions.get(tabId) || 0) + 1);
      if (this.cache[tabId]) { delete this.cache[tabId]; await this.saveCache(); }
      if (this.session?.sourceTabId === tabId) await this.cancel();
    }
    if (tab.active && (changes.status === 'complete' || changes.url)) this.scheduleCapture(tabId);
    if (this.session && (changes.title || changes.url)) await this.render();
  }

  scheduleCapture(tabId) {
    clearTimeout(this.captureTimers.get(tabId));
    if (!this.enabled) return;
    this.captureTimers.set(tabId, setTimeout(() => {
      this.captureTimers.delete(tabId);
      ignore(this.capture(tabId));
    }, 900));
  }

  async capture(tabId) {
    if (!this.enabled || this.session || this.captureBusy) return;
    if (Date.now() - this.lastCaptureAt < 600) { this.scheduleCapture(tabId); return; }
    this.captureBusy = true;
    const generation = this.captureGeneration;
    try {
      const tab = await this.api.tabs.get(tabId);
      if (!tab.active || tab.incognito || tab.discarded || tab.status !== 'complete' || !webPage(tab.url)) return;
      // Only the focused window is captured, never a background window.
      if (!(await this.api.windows.get(tab.windowId)).focused) return;
      if (this.captureGeneration !== generation) return;
      const version = this.navigationVersions.get(tabId) || 0;
      this.lastCaptureAt = Date.now();
      let captureTimeout;
      let data;
      try {
        data = await Promise.race([
          this.api.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 55 }),
          new Promise((_, reject) => {
            captureTimeout = setTimeout(() => reject(new Error('Screenshot timed out')), 3000);
          })
        ]);
      } finally { clearTimeout(captureTimeout); }
      const small = await shrinkScreenshot(data);
      const after = await this.api.tabs.get(tabId);
      if (this.captureGeneration !== generation || !this.enabled || this.session || !after.active || after.url !== tab.url ||
          (this.navigationVersions.get(tabId) || 0) !== version) return;
      await this.enqueue(async () => {
        if (this.captureGeneration !== generation || !this.enabled || this.session || (this.navigationVersions.get(tabId) || 0) !== version) return;
        this.cache[tabId] = { data: small, at: Date.now(), url: tab.url };
        await this.saveCache();
      });
    } catch { /* Unsupported pages and transient tab changes get title-only cards. */ }
    finally { this.captureBusy = false; }
  }
}
