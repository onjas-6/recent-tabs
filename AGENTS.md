---
created: 2026-09-08T18:44-07:00
updated: 2026-09-08T21:01-07:00
model: gpt-6
harness: codex-desktop
author: ai
inputs:
  - User request for Control + Q and a complete portable project with agent installation instructions
  - extension/manifest.json
  - extension/controller.js
  - README.md
---

# Recent Tabs: installation agent instructions / 安装 agent 指令

[English](#english) · [中文](#中文)

## English

This is a Chrome extension project that can be installed directly. See [README.md](./README.md) for user documentation and [INSTALL_WITH_AGENT.md](./INSTALL_WITH_AGENT.md) for a ready-to-paste installation request. These instructions apply to the entire project. The English and Chinese sections describe the same installation procedure.

### Goal and authorization

When the user asks to install this project, install, configure, and verify it in the Chrome profile they actually use on this computer. Do not stop after providing instructions. The default forward shortcut is **Control + Q**; reverse is **Control + Shift + Q**. Both use the **In Chrome** scope.

Installation needs no Node.js, Python, npm, build, or development server. Chrome loads `extension/` directly. Read the version from `extension/manifest.json`; this delivery targets **0.1.3** from the current `main` branch. The published v0.1.2 ZIP predates the Control-release fixes; do not represent it as v0.1.3 or offer a nonexistent release download. If the actual version differs, check the package and report it accurately. Never claim to have installed a version you have not read.

Website previews request optional website access only for local screenshot capture. Normal HTTP(S) pages still open in-page title cards and switch on Control release when previews are off. When the user explicitly authorizes previews, click **Enable website previews** in the extension settings and grant access through **Chrome's native permission prompt**. Do not edit browser profile files or use hidden interfaces to bypass that prompt. The companion installation request explicitly authorizes previews. Without that authorization, complete the base installation, preserve the current preview setting, and explain its status.

### Installation procedure

1. **Confirm the environment.** Read this file and the README. Identify the operating system, Google Chrome version (127 or later), and the user's active Chrome window and profile, preferably through the browser interface. Installing into a separate test profile does not count as installing for the user. If multiple profiles make the target unclear, ask only for the missing profile information while completing independent preparation.
2. **Choose a permanent location.** Extract the entire project to a stable local directory owned by the user, such as a `recent-tabs` folder on this computer's Desktop. Use the existing location if it is already suitable. Do not load from inside a ZIP, a temporary directory, a download cache, or a temporarily mounted volume. Do not assume the source computer's username, Desktop path, operating system, or extension ID. Do not use a directory that will be automatically cleaned up or create directory symlinks.
3. **Install or update.** Open `chrome://extensions` in the user's actual Chrome profile and enable Developer mode. For a first installation, click **Load unpacked** and select the project's **`extension/` subfolder**, not the project root. If Recent Tabs is already installed, inspect its details and loaded path. Reload after updating files at the same path. If paths differ, preserve the working installation and identify the intended update target before proceeding; avoid duplicate installations or moving a directory still in use. Verify the extension is enabled, read its actual version, and check for errors.
4. **Verify the saved shortcuts manually.** Open `chrome://extensions/shortcuts`. Set “Select the next most recent tab” to Control + Q and “Select the previous recent tab” to Control + Shift + Q, both scoped to In Chrome. **Chrome may preserve old shortcuts after an update or reload; changing the manifest does not prove the user's bindings changed.** Read both actual saved bindings in the interface. If the user has requested these two shortcuts for this extension, you may transfer a conflicting binding from another extension to Recent Tabs through this native shortcuts page. Clear or replace only the conflicting shortcut, preserve the other extension's enabled state and other settings, and report the transfer. Distinguish an extension shortcut conflict from a system-reserved key.
5. **Pin the extension and configure previews.** Pin Recent Tabs using the toolbar's Extensions menu. Open its settings and confirm the visible version matches the loaded extension. When authorized, enable website previews, complete the native permission prompt, and verify the enabled state. Visit ordinary HTTP(S) pages and pause briefly so screenshots can be cached. After an update, refresh existing test pages before checking the physical gesture. Preview permission is not required for the normal keyboard hold-and-release check.
6. **Verify and deliver.** Run the acceptance checks below. Preserve the user's existing tabs, unrelated settings, and other extensions, except for the authorized conflicting shortcut changes above. Close only test tabs created for this installation that are no longer needed. Report the permanent installation path and remind the user not to delete or move that directory.

### Operating system and browser constraints

- **macOS uses physical Control (⌃), not Command (⌘).** The manifest's macOS bindings should be `MacCtrl+Q` and `MacCtrl+Shift+Q`. Do not assign or test Command + Q; it quits Chrome.
- On Windows / Linux, the intended bindings are Ctrl + Q and Ctrl + Shift + Q. The operating system, desktop environment, or Chrome may reserve a combination, especially Ctrl + Shift + Q. Rely on what the shortcuts interface accepts and what works on this computer. A macOS test does not establish that Windows / Linux passed. If a conflict appears, avoid repeated attempts that could close the user's windows. Do not change system bindings without authorization; explain the conflict and possible alternatives, and ask the user to choose when necessary.
- Control + Q **does not require Karabiner**. Consider the optional mapping in [macos/README.md](./macos/README.md) only if the user separately requests the original Control + Tab shortcut.
- Install through Chrome's normal graphical interface or an available UI automation tool. Do not force automation by restarting the personal browser, enabling or adding CDP / remote debugging, editing Chrome `Preferences` / `Secure Preferences`, changing management policies, or disabling other extensions.
- If the available tools cannot operate a native file chooser, permission prompt, shortcut field, or physical key sequence, complete the possible steps, identify the exact step the user must perform, and then verify it. Do not report a tool limitation as a successful installation or test.
- Do not copy the old computer's Chrome profile, credentials, browsing history, or session data. The package includes all required code and static assets. Extension IDs may change with the loaded path; read the ID on this computer. Do not reuse `chrome-extension://<id>` links from the old computer's records.

### Minimum manual acceptance checks

Use four public HTTP(S) test tabs in the same normal Chrome window. Visit them in order **A → B → C → D**, pausing briefly on each. Finish on D with focus in the page body. Previews are cached screenshots from the local browser session, not live background views; an initial placeholder does not necessarily indicate a fault.

| Check | Action and expected result |
| --- | --- |
| Step through recent tabs | Hold Control and tap Q three times. Selection moves through C, B, A while the actual page remains on D. Release Control to activate A. |
| Reverse selection | Reestablish A → B → C → D. Hold Control and tap Q twice to select B, then add Shift and tap Q once to return to C. Release Control to activate C. |
| Cancel | Reestablish the same order. From D, hold Control, tap Q, then press Esc. Releasing Control leaves D active. |
| Previews | First verify ordinary pages show centered title cards and complete on Control release with previews disabled or absent. On the first invocation after the temporary listener injects, retry if an exceptionally fast release is missed. When authorized, then enable previews: visited cached pages can show screenshots. Verify screenshots remain local and require no external service login. |
| Restricted pages | Test the fallback popup from a `chrome://extensions` tab created for this installation. An in-page overlay is not required on restricted pages. The shortcut or toolbar entry should open a title list and allow a selection. If focus transfer prevents modifier release from being captured, verify Enter to confirm and Esc to cancel, and report the observed behavior. |

The physical keyboard check must cover **holding Control continuously, tapping Q multiple times, and finally releasing Control**. Sending one key combination, calling internal functions, or running automated tests alone does not replace this check. If the tools cannot hold a key, explicitly leave this item for the user to test; do not overstate completion.

### Final report

Briefly report the actual version, permanent project path and loaded `extension/` path, target Chrome profile, both saved shortcuts and their scope, any conflicting shortcut transferred and its source extension, pinned state, preview permission state, and completed acceptance checks with observed results. For anything unfinished, state the precise blocker and the user's next step. Do not simply claim “all tests passed.” Link to the local [README.md](./README.md) and this file.

---

## 中文

本目录是可直接安装的 Chrome 扩展项目。面向使用者的说明见 [README.md](./README.md)，可复制的安装请求见 [INSTALL_WITH_AGENT.md](./INSTALL_WITH_AGENT.md)。本文件适用于整个项目。

### 目标与授权

用户提出“安装这个项目”时，完成当前电脑实际使用的 Chrome 配置文件中的安装、快捷键设置和验证；不要仅给出操作说明后结束。默认向前快捷键为 **Control + Q**，反向为 **Control + Shift + Q**，范围为 **In Chrome / 在 Chrome 中**。

安装不需要 Node.js、Python、npm、构建或开发服务器。Chrome 直接读取 `extension/`。以 `extension/manifest.json` 中的版本为准；当前 `main` 分支交付目标为 **0.1.3**。已发布的 v0.1.2 ZIP 早于 Control 松键修复；不要把它说成 0.1.3，也不要编造不存在的 release 下载。若实际版本不同，核对包内容并如实报告，不要声称安装了未读取的版本。

网站预览只为保存本地截图而请求可选的网站访问权限。即使关闭预览，普通 HTTP(S) 网页仍可打开页面内标题卡片，并在松开 Control 时切换。用户明确要求启用预览时，在扩展设置中点击 **Enable website previews**，并通过 **Chrome 原生权限界面**完成授权；不要修改浏览器配置文件或调用隐藏接口绕过权限界面。下述配套安装请求已明确授权启用预览。没有这种授权时，基础安装仍可完成，保留预览当前状态并说明。

### 安装步骤

1. **核对环境。** 读取本文件和 README，确认操作系统、Google Chrome 版本（至少 127）、用户正在使用的 Chrome 窗口与配置文件。优先通过浏览器界面确认；不要把另开一个测试配置文件当作给用户安装完成。多配置文件无法判断时，只询问所需的配置文件信息，并先完成其他不依赖此信息的准备。
2. **确定永久位置。** 先解压整个项目到用户拥有的稳定本地目录，例如该电脑的桌面 `recent-tabs` 文件夹；若项目已经在那里，直接使用。不要从 ZIP 内部、临时目录、下载缓存或临时挂载卷加载。不要假定源电脑的用户名、桌面路径、操作系统或扩展 ID。不要把项目放入会清理的临时目录，也不要建立目录符号链接。
3. **安装或更新。** 在用户实际 Chrome 配置文件打开 `chrome://extensions`，开启开发者模式。首次安装点击 **Load unpacked / 加载已解压的扩展程序**，选择项目的 **`extension/` 子文件夹**（不是项目根目录）。已有 Recent Tabs 时，检查其详情和加载位置：相同路径更新后使用重新加载；若路径不同，保留有效安装并核对待更新对象，避免重复安装或移走仍在使用的目录。页面必须显示扩展已启用以及实际版本，检查是否有错误。
4. **手动核验快捷键。** 打开 `chrome://extensions/shortcuts`，将 “Select the next most recent tab” 设为 Control + Q，将 “Select the previous recent tab” 设为 Control + Shift + Q，两项范围均为 In Chrome。**Chrome 更新或重新加载扩展时可能保留旧快捷键，修改 manifest 不代表已改好用户的绑定。** 必须读取界面中实际保存的两项快捷键。用户已要求把这两个组合键用于本扩展时，可以在该原生快捷键页面把被其他扩展占用的对应绑定转给 Recent Tabs；只清除/替换发生冲突的那一项快捷键，保留原扩展的启用状态和其他设置，并在交付中说明转移情况。不要把普通扩展快捷键冲突与系统保留键混为一谈。
5. **固定入口。** 在工具栏扩展拼图菜单固定 Recent Tabs。打开扩展设置并核对可见版本与加载版本一致；已获授权时启用网站预览并完成原生权限提示，核对设置显示已启用。浏览普通 HTTP(S) 网页并稍作停留以产生截图。更新后先刷新已打开的测试网页，再验收物理按键。普通网页的按住／松键验收不依赖预览权限。
6. **完成下方验收并交付。** 保留用户原有标签、无关设置和其他扩展；上述已授权的冲突快捷键调整除外。只清理本次自己创建且不再需要的测试标签。告知用户永久安装路径，提醒不要删除或移动该目录。

### 操作系统与浏览器约束

- **macOS：使用物理 Control（⌃），不是 Command（⌘）。** manifest 的 macOS 绑定应为 `MacCtrl+Q`、`MacCtrl+Shift+Q`。不要误设或测试 Command + Q，它会退出 Chrome。
- Windows / Linux 的目标绑定为 Ctrl + Q、Ctrl + Shift + Q；系统、桌面环境或 Chrome 可能占用组合键，尤其 Ctrl + Shift + Q。以快捷键界面的可保存状态和本机行为为准，不能把 macOS 的验收结果写成这些系统也已通过。发现冲突时不要执行可能关闭用户窗口的重复尝试，不要擅自改系统绑定；说明冲突及可选替代方案，必要时请用户选择。
- Control + Q **不需要 Karabiner**。只有用户另行要求原始 Control + Tab 才考虑 [macos/README.md](./macos/README.md) 中的可选映射。
- 使用普通 Chrome 图形界面或已有的界面操作工具安装。不要为了强行自动化安装而重启个人浏览器、启用或新增 CDP/远程调试入口、编辑 Chrome `Preferences` / `Secure Preferences`、更改管理策略或禁用其他扩展。
- 若当前工具无法操作原生文件选择器、权限提示、快捷键录入或物理按键，完成可做部分，再明确请用户完成那个具体步骤；随后核验。不得把工具限制写成已成功安装或测试。
- 不复制旧电脑的 Chrome 配置文件、凭据、浏览历史或会话数据。本项目安装包已包含所需代码与静态资源；扩展 ID 可能随加载路径变化，必须在本机读取。不要使用旧电脑记录中的 `chrome-extension://<id>` 链接。

### 最小人工验收

使用同一普通 Chrome 窗口内四个公开 HTTP(S) 测试标签，按 **A → B → C → D** 依次访问，每页稍作停留，最后留在 D 并让焦点位于网页正文。预览是本机浏览器会话中的缓存截图，不是后台实时画面；首次出现占位图不等于故障。

| 检查 | 操作与应有结果 |
| --- | --- |
| 连续回退 | 按住 Control，依次点按 Q 三次，选择顺序为 C、B、A；选取期间实际页面仍停在 D。松开 Control 后才激活 A。 |
| 反向选择 | 重新按 A → B → C → D 建立顺序。按住 Control，点 Q 两次选到 B，再加 Shift 点 Q 一次应回到 C；松开 Control 激活 C。 |
| 取消 | 重新建立上述访问顺序，从 D 按住 Control 点 Q，再按 Esc；松开 Control 后仍停在 D。 |
| 预览 | 先在未启用或未授权预览时，验证普通网页显示居中标题卡片并在松开 Control 后切换。临时监听页面首次注入时若极快松键丢失，重试该手势。已授权时，再验证访问并缓存后的页面可出现截图。核实截图留在本机，无需登录外部服务。 |
| 受限页面 | 在本次创建的 `chrome://extensions` 标签测试备用弹窗；受限页不要求出现页面内覆盖层。快捷键或工具栏入口应能打开标题列表并完成一次选择。松键因焦点交接未捕获时，验证 Enter 确认和 Esc 取消，并在交付中注明实际表现。 |

真实按键验收必须涵盖“持续按住 Control、多次 Q、最后松开”。只发送一次组合键、只调用内部函数或只运行自动测试，不能替代这项验证。当前工具不能持续按住按键时，将此项明确列为待用户实测，不夸大完成度。

### 最终报告

简短报告：实际版本、永久项目路径与 `extension/` 加载路径、目标 Chrome 配置文件、两项实际保存的快捷键及范围、任何冲突快捷键从哪个扩展转移、固定状态、预览权限状态、已完成的验收项目及观察结果。存在未完成项时给出准确阻碍和用户下一步；不要笼统说“全都测试通过”。附上本机 [README.md](./README.md) 和本文件入口。
