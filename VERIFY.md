---
created: 2026-09-08T20:22-07:00
model: gpt-6
harness: codex-desktop
author: ai
inputs:
  - tests/history.test.js
  - tests/controller.test.js
  - tests/previews.test.js
  - tests/browser-smoke.mjs
  - assets/browser-smoke-v0.1.2.json
  - Native Chrome UI validation on macOS
supersedes: VERIFY-v0.1.0.md
caveats:
  - The complete physical hold-Control, repeat-Q, release-Control gesture has not been verified by a person.
---

# Verification — v0.1.2

Version **0.1.2** renames the product and distribution folder to **Recent Tabs** / `recent-tabs`; switching behavior and the Control + Q shortcut are unchanged. All 37 logic tests and 10 browser scenarios were rerun successfully on **v0.1.2**. The native Chrome interaction checks below were recorded for **v0.1.1**, which changed the default shortcut from Control + E to **Control + Q**. This record distinguishes native Chrome UI checks from browser automation and untested behavior. The historical [v0.1.0 record](./VERIFY-v0.1.0.md) refers to the old E shortcut.

## Native Chrome UI checks on macOS

For **v0.1.2**, the existing Chrome installation was reloaded and the extension details showed **Recent Tabs**, version **0.1.2**, enabled and pinned. Its settings page showed the new name, the saved **Control + Q** shortcut, and previews still enabled. The earlier interaction checks below remain attributed to v0.1.1.

Desktop UI automation installed the production extension in ordinary Google Chrome and verified version **0.1.1**, the enabled state, **Control + Q / Control + Shift + Q** bindings scoped to **In Chrome**, the pinned toolbar action, and the optional website permission through Chrome's native prompt. No test hooks or mandatory all-sites permission were added to that installation.

Four dedicated local HTTP test pages established a visit order of **A → B → C → D**. The following results were observed:

- Three successive native Control + Q commands selected **C → B → A** while D stayed active.
- Control + Shift + Q moved the selection from A back to B.
- The panel displayed four actual cached page screenshots with the expected titles and selection marker.
- Esc dismissed the panel and preserved D. In a new session, Enter activated C.
- A native Control + Q command from `chrome://extensions` opened the real toolbar fallback popup; Enter activated the selected tab.

**Verification limit:** the desktop UI tool could send combined shortcut commands, but could not hold a modifier across multiple calls and then release it independently. These checks establish native command dispatch, selection order, previews, and explicit confirmation/cancellation. They do **not** establish the complete physical hold-and-release gesture. That gesture still needs a person to test it.

## Automated tests

`node --test tests/*.test.js`: **37 tests passed**. Coverage includes MRU history, a fixed selection order during each session, forward/reverse cycling, window isolation, tab closure/movement/navigation, worker wake-up, session authentication, queue recovery, and preview permissions, concurrency, cleanup, and capacity limits.

Browser tests in Chrome for Testing **149.0.7827.55**: **10 scenarios passed**, with **zero unexpected page or console errors**. The recorded output is in [assets/browser-smoke-v0.1.2.json](./assets/browser-smoke-v0.1.2.json); the rendered panel is shown in [assets/preview.png](./assets/preview.png).

The browser scenarios checked:

- Four visible pages produced cached JPEG thumbnails. All four desktop cards fit, and a 600-pixel viewport had no body overflow.
- Repeated commands selected C → B → A; a trusted browser-input Control release activated A.
- Reverse cycling, Esc cancellation, a successor selection after the selected tab closed, arrow-key navigation, and Enter confirmation worked.
- A webpage-generated synthetic Control release did not activate a tab. An extension iframe embedded by another tab could not retrieve the selection session's titles or screenshots.
- Restricted Chrome pages opened the actual action popup. The toolbar entry worked, popup dismissal cleared the session, and the popup could open again.

### Browser-test method

On macOS, DevTools keyboard input does not fully reproduce native Chrome extension command dispatch. The browser test therefore exposes the same queued command controller in a **temporary extension copy** and grants website access in that fixture. Control release, arrow keys, Enter, and Esc use browser input events.

The production extension contains no test entry point and still requests website access as an optional permission. Its native command dispatch and permission prompt were checked separately through the Chrome UI as described above.

## Remaining limits

- A person has not yet checked the complete physical gesture: hold Control, press Q repeatedly, then release Control.
- A very quick Control release can occur before the panel receives focus, especially when starting from the address bar or other browser UI. Enter confirms and Esc cancels if the panel stays open.
- Windows, Linux, other input methods, and operating-system shortcut conflicts have not been tested.
- The optional macOS Control + Tab → Control + Q Karabiner mapping has only received static checks; it has not been installed and tested with a physical keyboard. Default Control + Q does not require Karabiner.
- Incognito windows are not supported. Preview availability depends on Chrome's page-access and capture restrictions.

## Reproduce the tests

Extension installation requires no development dependencies. Logic tests need **Node.js 20+**. Browser tests additionally need an existing Playwright installation and a complete Chromium or Chrome for Testing executable:

```sh
node --test tests/*.test.js
PLAYWRIGHT_PATH=/path/to/playwright \
CHROME_PATH=/path/to/chrome \
node tests/browser-smoke.mjs
```

The browser runner uses a temporary profile and extension copy, cleans them up afterwards, and does not connect to a personal Chrome profile. Set `ARTIFACT_DIR` to choose an output directory.

## 中文摘要

v0.1.2 将产品与发行文件夹改名为 **Recent Tabs** / `recent-tabs`，切换行为和 Control + Q 快捷键保持不变。v0.1.2 已重新通过 37 项逻辑测试和 10 项浏览器场景；下述原生交互记录来自 v0.1.1。

v0.1.1 的 **37 项逻辑测试和 10 项 Chrome 浏览器测试通过**。普通 Chrome 原生界面验证了安装、两项 Q 快捷键、预览权限、C → B → A 选择顺序、反向选择、截图以及 Enter／Esc 和受限页面备用弹窗。

**还没有人手实测完整的“按住 Control、连续按 Q、最后松开”手势。** 浏览器输入测试已验证松键切换逻辑，但原生界面工具无法单独模拟持续按住和松开修饰键，因此不能把这两种测试等同于完整物理键盘验收。Windows、Linux 和可选的 Karabiner 映射也尚未实测。
