---
created: 2026-09-08T18:44-07:00
model: gpt-6
harness: codex-desktop
author: ai
inputs:
  - 用户要求提供可在另一台电脑安装的完整文件夹与 agent instruction
  - AGENTS.md
  - README.md
---

# 在另一台电脑让 agent 安装

把**整个 `arc-recent-tabs` 文件夹**复制到另一台电脑的稳定本地位置；如果传的是 ZIP，先完整解压。可以放桌面，安装后不要删除或移动这个文件夹。无需安装 Node.js、Python 或 npm。

在那台电脑打开支持读取本地文件、操作 Chrome 界面的 agent，把项目文件夹设为工作目录，粘贴以下内容即可：

```text
请在这台电脑上安装当前文件夹里的 Arc Recent Tabs Chrome 扩展，并实际完成设置和验证。

先读取项目根目录的 AGENTS.md 和 README.md，严格按安装指令执行。以 extension/manifest.json 的实际版本为准，本次交付目标为 0.1.1。

请识别当前操作系统以及我实际在用的 Chrome 配置文件，把完整项目放在稳定、永久的本地位置，再通过 chrome://extensions 加载 extension/ 子文件夹。若已经安装同一扩展，优先更新并重新加载，不要重复安装。安装无需构建，不要安装 npm、Node.js 或 Python。

默认快捷键设成 Control + Q，反向设成 Control + Shift + Q，范围都为 In Chrome。请在 chrome://extensions/shortcuts 手动检查实际保存的绑定：升级会保留旧快捷键，不能只修改 manifest。如果这些快捷键已被其他扩展占用，我授权你通过这个原生页面把相应快捷键转给 Arc Recent Tabs，保留原扩展的启用状态及其他设置，并告诉我转移了哪一项。macOS 使用物理 Control（⌃ / MacCtrl），不是 Command（⌘），不要触发 Command + Q。其他系统若遇到系统/Chrome 保留组合键，请准确说明，并在需要替代绑定时让我选择。

我授权你固定扩展图标，并在扩展设置中启用 website previews，通过 Chrome 的原生权限界面授予所需的网站访问权限。预览截图应保留在本机扩展会话中，不复制旧电脑的浏览数据或凭据。Control + Q 不需要 Karabiner，不要安装它。

请用四个公开网页按 A → B → C → D 建立访问顺序，验证持续按住 Control 连按 Q 的 C、B、A 顺序、松开才切换、Shift 反向、Esc 取消、截图预览，以及 Chrome 内置页的备用弹窗。除上述授权的快捷键调整外，保留我原有的标签、浏览器设置和其他扩展，不要重启个人 Chrome、开启远程调试或编辑 Chrome 配置文件来强行安装。

如果界面工具不能完成某个原生步骤或不能模拟持续按键，请先做完其他步骤，再准确告诉我需要亲自操作的那一步，不要把未测试的行为报告为通过。

完成后告诉我实际版本、永久安装路径、Chrome 配置文件、两项实际快捷键和范围、预览是否启用、哪些验收已通过以及剩余阻碍，并给出 README.md 的本机链接。
```

如果 agent 没有操作浏览器界面的能力，可按 [README.md](./README.md) 中的步骤手动加载。**首次安装与另一台电脑都需要分别授予权限和确认快捷键**；只复制这个项目不会复制旧电脑的 Chrome 设置或截图。
