---
created: 2026-09-08T17:12-07:00
model: gpt-6
harness: codex-desktop
author: ai
inputs:
  - tests/history.test.js
  - tests/controller.test.js
  - tests/previews.test.js
  - tests/browser-smoke.mjs
  - 本次独立 Chrome for Testing 配置中的人工与自动验证
---

# 验证记录 — v0.1.0

> 历史记录；当前交付请看 [VERIFY.md](./VERIFY.md)。

运行环境：macOS；Chrome for Testing **149.0.7827.55**；Node.js；Playwright **1.62.1**。使用独立的临时浏览器配置和本机 HTTP 测试页，没有读取日常 Chrome 配置或个人浏览内容。

## 自动化逻辑测试

`npm test` / `node --test tests/*.test.js`：**37 项通过**。

- 最近访问顺序、冻结选择列表、正反向循环、多窗口分离。
- 关闭／移动标签、导航、服务唤醒、失效会话、队列错误恢复。
- UI 身份、标签来源和会话标识校验；广播消息不携带其他标签的数据。
- 网站权限开关、会话截图清理、缩略图压缩与缓存容量。
- 截图过程中切换／导航／清缓存时丢弃失效截图，避免将其他标签画面记到错误标签。

## 实际 Chrome 验证

原始发布用 manifest 在独立可见窗口中加载成功；快捷键注册为物理 **⌃E**。设置页发起 Chrome 原生网站权限提示，允许后设置成功启用。在真实浏览器快捷键路径中，一次 Control + E／松键从 D 返回了 C。

无界面 Chrome 的完整浏览器测试已通过，测试包含真实扩展 iframe、真实 Chrome tabs/storage/scripting/capture/action API 和页面键盘事件：

| 检查 | 结果 |
|---|---|
| 本机 A、B、C、D 四页分别生成 JPEG 缓存 | 通过 |
| 面板显示四张真实截图 | 通过 |
| 桌面宽度四张卡片完整可见，600px 窄视口没有页面溢出 | 通过 |
| 连续选择 C → B → A，松开 Control 后激活 A | 通过 |
| 反向循环及 Esc 保留原标签 | 通过 |
| 选中标签关闭后选择后继，方向键与 Enter 确认 | 通过 |
| 网页伪造 Control 松键不触发切换 | 通过 |
| 其他标签嵌入同一扩展 iframe，即使拿到会话 ID 仍无法读取数据 | 通过 |
| `chrome://settings` 打开真实工具栏备用 popup | 通过 |
| 工具栏手动 popup、真正关闭 popup target 后清理会话并重新打开 | 通过 |
| 浏览器页面及控制台错误 | 0 |

预览效果见 [实际测试截图](./assets/preview.png)。截图内容来自本机测试页。

### 浏览器测试方法的边界

macOS 上的 DevTools 键盘输入不能完整模拟 Chrome 的原生快捷键分发。为准确覆盖扩展逻辑，`tests/browser-smoke.mjs` 在临时扩展副本中暴露同一个命令控制器，调用其真实队列入口；Control 松键、方向键、Enter 和 Esc 使用浏览器输入事件。该副本还预先授予网站权限，避免自动运行时需要用户处理权限弹窗。

**发布目录没有测试入口，也没有预先授予网站权限。** 原始 manifest 和设置页授权流程另外进行了上述可见窗口验证。这套测试证明扩展选择与预览链路，不等于所有物理键盘、输入法和系统映射都经过验证。

## 尚未实测的环境边界

- **Karabiner-Elements 未安装**；可导入配置已完成静态匹配检查，但原始 Control + Tab → Control + E → 松开确认的物理链路仍需安装后验证。
- 地址栏、首次注入、系统忙碌时，极快松键可能在面板建立之前发生。面板仍开着时按 Enter 确认或 Esc 取消。
- 当前可见窗口的自动截图接口在这个自动化环境中曾长时间不返回；无界面 Chrome 截图正常。实现已给单次截图加 3 秒超时，失败时保留标题卡片。
- 其他操作系统、第三方输入法、无障碍工具组合没有逐一测试。无痕模式不支持。

## 复跑浏览器测试

浏览器测试可选，需要已有的 Playwright 和完整 Chromium / Chrome for Testing。默认会尝试这台机器已有的测试运行时；其他机器可通过环境变量指定，不会自动下载依赖。

```sh
PLAYWRIGHT_PATH=/path/to/playwright \
CHROME_PATH=/path/to/chrome \
node tests/browser-smoke.mjs
```

测试使用系统临时目录保存配置和扩展副本，完成后清理；截图与 JSON 结果的位置会在输出末尾显示。可通过 `ARTIFACT_DIR` 指定结果目录。
