---
created: 2026-09-08T16:42-07:00
model: gpt-6
harness: codex-desktop
author: ai+human
status: approved
inputs:
  - 本次对话：桌面新项目、Arc 最近标签切换、预览窗口、先审批计划
  - https://developer.chrome.com/docs/extensions/reference/api/commands
  - https://developer.chrome.com/docs/extensions/reference/api/tabs
  - https://developer.chrome.com/docs/extensions/develop/ui/add-popup
---

# Recent Tabs — 实施计划（已批准）

项目放在 `~/Desktop/recent-tabs/`。本计划在只创建目录、尚未开始实现时写成，随后由用户在对话中回复 `approve` 批准。实现和验证状态见 README.md 与 VERIFY.md。

> 后续变更：用户于 2026-09-08 要求将默认键改为 Control + Q，并安装到当前 Chrome；v0.1.1 按此要求交付，v0.1.2 将产品及目录改名为 Recent Tabs / `recent-tabs`。本文名称与目录引用已同步更新，下面保留最初批准的功能计划和版本记录。

## 目标体验

假设依次访问 A → B → C → D，现在停在 D：

1. 按住 Control，第一次按 Tab，弹出最近标签预览面板，选中 C。
2. 继续按 Tab，依次选中 B、A；按 Shift 可以反向选择。
3. 松开 Control，才真正切换到选中的标签；Esc 取消并留在 D。
4. 一轮切换中固定最近访问顺序，避免多按几次只在两个标签之间来回跳。
5. 每轮松开 Control 后结束选择；下一轮重新计算最近顺序。默认只遍历当前 Chrome 窗口中仍打开的标签。

## 技术边界与拟采用方案

### Control + Tab

Chrome Commands API 支持的按键不包括 Tab，因此扩展本身无法直接注册 Control + Tab。macOS 的物理 Control 必须用 `MacCtrl` 声明。[官方文档](https://developer.chrome.com/docs/extensions/reference/api/commands)

- 扩展先提供原生可绑定的快捷键，暂定 Control + E，最终以冲突和原型验证结果为准。
- 提供仅针对 Chrome 生效的 Karabiner-Elements 映射配置，将 Control + Tab 转成扩展快捷键，保留按住 Control 和 Shift 反向选择的语义。
- 当前未发现 Karabiner-Elements。使用原始 Control + Tab 需要安装映射工具，并在 macOS 中完成它要求的系统授权；交付包含配置和设置说明。
- 第一阶段优先实测按键重复、松键事件和弹窗焦点。只有整条链路验证通过，才将原始 Control + Tab 标为可用。

### 预览面板

普通网页采用居中的半透明背景和卡片面板，显示最近约 6 张卡片，其余可继续循环；每张包含页面缩略图、网站图标、标题和域名。选中卡片突出显示，支持鼠标点选、Enter 确认和 Esc 取消。

`chrome://` 设置页、新标签页以及其他无法注入内容的页面，退回工具栏扩展弹窗，保持可切换；该弹窗位置与 Arc 居中面板不同。工具栏 popup 会在失去焦点时自动关闭，因此要分别验证两种界面的焦点行为。[官方 popup 文档](https://developer.chrome.com/docs/extensions/develop/ui/add-popup)

### 页面缩略图

预览采用“上次浏览这个标签时缓存的截图”。Chrome 的 `captureVisibleTab` 只能截取当前活动标签，无法直接获取任意后台标签的实时画面；截图调用也有每秒最多 2 次的限制。[官方截图 API](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-captureVisibleTab)

- 在普通网页可见且加载稳定后更新压缩截图，切换面板只读取缓存。
- 不通过偷偷激活后台标签来获取截图；浏览期间的声音、焦点和最近顺序应保持正常。
- 自动截图和网页居中面板涉及网站权限；使用明确的启用入口请求所需权限。未授权时仍提供标题、图标和工具栏弹窗切换。
- 未浏览过、受限、休眠或截图失败的页面，显示网站图标与标题占位卡。
- 截图仅保留在本机浏览器会话中，设置容量上限和清除入口；关闭标签时清理对应缓存。页面跳转后旧截图失效。默认不启用无痕窗口。

## 实施步骤与时间估计

| 阶段 | 工作 | 粗略时间 |
|---|---|---|
| 1. 交互原型 | 验证扩展快捷键、连续按键、Control 松开确认、网页浮层与扩展 popup；验证映射方案 | 20–40 分钟 |
| 2. 最近访问逻辑 | Manifest V3 后台服务、每窗口历史、冻结选择顺序、关闭/移动标签清理、服务唤醒恢复 | 30–50 分钟 |
| 3. 预览 UI | 居中卡片面板、受限页面 popup、截图缓存、权限未开启时的降级界面 | 40–70 分钟 |
| 4. 验证与交付 | 快速连按/松键、Shift/Esc、多个窗口、受限页面、安装说明和映射配置 | 30–60 分钟 |

只有最近标签切换的简单版大约 30–60 分钟；包含预览、降级处理和 macOS 映射的这一版属于中等复杂度，预计约 2–4 小时。这是范围估计，系统授权或键盘焦点兼容问题可能增加时间。

## 项目结构与交付

原生 JavaScript、HTML、CSS，Chrome Manifest V3，无后端，不要求构建框架。

```text
recent-tabs/
  PLAN.md
  extension/          # Chrome「加载已解压的扩展程序」选择这里
    manifest.json
    background.js
    history.js
    overlay.js
    overlay.css
    popup.html
    popup.js
    popup.css
    options.html
    options.js
    icons/
  macos/              # Chrome 专用快捷键映射配置
  tests/              # 历史顺序、选择会话等关键逻辑测试
  README.md           # 安装、权限、快捷键和已知限制
```

交付标准：A → B → C → D 后可在一次按住 Control 的过程中选择 C、B、A；释放确认；Esc 取消；多次循环顺序稳定；失效标签会被跳过；未授权截图时切换仍能使用。自动测试验证核心逻辑，真实 Chrome 验证 UI 和键盘交互。原始 Control + Tab 的系统映射是否完成实测单独记录。

本次批准范围为以上本地扩展、预览 UI、测试和可导入映射配置。商店发布和后台标签实时视频预览不在本版范围内。

**用户已批准本方案。实际交付与验证结果以 README.md 和 VERIFY.md 为准。**
