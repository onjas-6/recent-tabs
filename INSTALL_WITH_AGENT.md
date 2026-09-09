---
created: 2026-09-08T18:44-07:00
updated: 2026-09-08T20:33-07:00
model: gpt-6
harness: codex-desktop
author: ai
inputs:
  - Request for English and Chinese installation instructions
  - AGENTS.md
  - README.md
---

# Install with an agent · 使用 agent 安装

[English](#english) · [中文](#中文)

Choose **one** of the equivalent prompts below and paste it into your agent. Both prompts request installation, shortcut setup, preview permissions, and verification.

选择下面任意一种语言的指令交给 agent 即可；两版都包含安装、快捷键配置、预览授权和验证。

## English

Copy the **entire `recent-tabs` folder** to a permanent local location on the other computer. If you downloaded a ZIP, extract it first. The desktop is fine; do not move or delete the folder after Chrome loads it. You need Chrome 127 or later. Installation requires **no Node.js, Python, npm, or build step**.

Open an agent that can read local files and operate Chrome's interface. Set the project folder as its working directory, then copy and send this prompt:

```text
Please install the Recent Tabs Chrome extension from the current folder on this computer, and complete its setup and verification.

First read AGENTS.md and README.md in the project root and follow their installation instructions. Read the actual version from extension/manifest.json; this release is expected to be 0.1.2.

Identify this computer's operating system and the Chrome profile I actually use. Place the complete project in a stable, permanent local directory, then open chrome://extensions and load the extension/ subfolder. If this extension is already installed, prefer updating and reloading the existing installation rather than creating a duplicate. Installation needs no build step; do not install npm, Node.js, or Python.

Set Control + Q to select the next recent tab and Control + Shift + Q to reverse direction. Scope both shortcuts to In Chrome. Check the actual saved bindings at chrome://extensions/shortcuts: Chrome may retain old shortcuts after an update, so checking the manifest alone is insufficient. If another extension already uses either shortcut, I authorize you to transfer that specific binding to Recent Tabs through this native shortcut page. Preserve the other extension's enabled state and unrelated settings, and tell me which binding you reassigned. On macOS, use physical Control (⌃ / MacCtrl), not Command (⌘); do not trigger Command + Q. If the operating system or Chrome reserves a combination, explain the conflict and let me choose any replacement shortcut.

I authorize you to pin the extension icon and enable website previews in its settings, granting the required website-access permission through Chrome's native permission prompt. Preview screenshots must remain in this device's extension session storage. Do not copy the old computer's browsing data or credentials. Control + Q does not require Karabiner; do not install it.

Use four public web pages in one normal Chrome window to establish the visit order A → B → C → D. Verify that holding Control and pressing Q repeatedly selects C, B, then A; the active page must remain D until Control is released. Also verify Shift for reverse selection, Esc to cancel, screenshot previews, and the toolbar popup fallback on Chrome's internal pages. Except for the shortcut changes authorized above, preserve my existing tabs, browser settings, and other extensions. Do not restart my personal Chrome, enable remote debugging, or edit Chrome profile files to force installation.

If your interface tools cannot perform a native step or cannot simulate holding and independently releasing a modifier key, complete the other steps first, then tell me exactly which step I need to perform myself. Do not report untested behavior as passing.

When finished, report the actual version, permanent installation path, Chrome profile, both saved shortcuts and their scopes, whether previews are enabled, the checks that passed, and any remaining blockers. Include a local link to README.md.
```

If your agent cannot operate the browser interface, follow the manual steps in [README.md](./README.md). **Each computer needs its own installation, permission grants, and shortcut checks.** Copying the project does not copy Chrome settings or saved screenshots from another computer.

## 中文

把**整个 `recent-tabs` 文件夹**复制到另一台电脑的稳定本地位置；如果传的是 ZIP，先完整解压。可以放桌面，安装后不要删除或移动这个文件夹。需要 Chrome 127 或更新版本；无需安装 Node.js、Python、npm，也不需要构建。

在那台电脑打开支持读取本地文件、操作 Chrome 界面的 agent，把项目文件夹设为工作目录，粘贴以下内容即可：

```text
请在这台电脑上安装当前文件夹里的 Recent Tabs Chrome 扩展，并实际完成设置和验证。

先读取项目根目录的 AGENTS.md 和 README.md，严格按安装指令执行。以 extension/manifest.json 的实际版本为准，本次交付目标为 0.1.2。

请识别当前操作系统以及我实际在用的 Chrome 配置文件，把完整项目放在稳定、永久的本地位置，再通过 chrome://extensions 加载 extension/ 子文件夹。若已经安装同一扩展，优先更新并重新加载，不要重复安装。安装无需构建，不要安装 npm、Node.js 或 Python。

默认快捷键设成 Control + Q，反向设成 Control + Shift + Q，范围都为 In Chrome。请在 chrome://extensions/shortcuts 手动检查实际保存的绑定：升级会保留旧快捷键，不能只修改 manifest。如果这些快捷键已被其他扩展占用，我授权你通过这个原生页面把相应快捷键转给 Recent Tabs，保留原扩展的启用状态及其他设置，并告诉我转移了哪一项。macOS 使用物理 Control（⌃ / MacCtrl），不是 Command（⌘），不要触发 Command + Q。其他系统若遇到系统/Chrome 保留组合键，请准确说明，并在需要替代绑定时让我选择。

我授权你固定扩展图标，并在扩展设置中启用 website previews，通过 Chrome 的原生权限界面授予所需的网站访问权限。预览截图应保留在本机扩展会话中，不复制旧电脑的浏览数据或凭据。Control + Q 不需要 Karabiner，不要安装它。

请用同一普通 Chrome 窗口中的四个公开网页按 A → B → C → D 建立访问顺序，验证持续按住 Control 连按 Q 的 C、B、A 顺序，松开 Control 前实际页面仍停在 D，松开后才切换。还要验证 Shift 反向、Esc 取消、截图预览，以及 Chrome 内置页的备用弹窗。除上述授权的快捷键调整外，保留我原有的标签、浏览器设置和其他扩展，不要重启个人 Chrome、开启远程调试或编辑 Chrome 配置文件来强行安装。

如果界面工具不能完成某个原生步骤，或不能模拟持续按住并单独松开修饰键，请先做完其他步骤，再准确告诉我需要亲自操作的那一步，不要把未测试的行为报告为通过。

完成后告诉我实际版本、永久安装路径、Chrome 配置文件、两项实际快捷键和范围、预览是否启用、哪些验收已通过以及剩余阻碍，并给出 README.md 的本机链接。
```

如果 agent 没有操作浏览器界面的能力，可按 [README.md](./README.md) 中的步骤手动加载。**首次安装与另一台电脑都需要分别授予权限和确认快捷键**；只复制这个项目不会复制旧电脑的 Chrome 设置或截图。
