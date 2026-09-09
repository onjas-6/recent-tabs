---
created: 2026-09-08T16:49-07:00
model: gpt-6
harness: codex-desktop
author: ai
inputs:
  - ../PLAN.md
  - https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/from/modifiers/
  - https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/to/modifiers/
  - https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/to/
caveats:
  - 配置已作 JSON 和映射逻辑检查；当前机器未安装 Karabiner，物理按键链路尚未实测。
---

# 在 macOS 用 Control + Tab

扩展本身使用 **Control + Q**。这里的可选配置把 Google Chrome 内的 **Control + Tab** 转成它，**Control + Shift + Tab** 转成 **Control + Shift + Q**。按住 Control 连续按 Tab 来选择，松开 Control 确认；Esc 取消。

配置只匹配稳定版 Google Chrome（`com.google.Chrome`），该标识已从本机 Chrome 的 `Info.plist` 核对。其他浏览器、Chrome Beta/Dev/Canary 和 Chrome for Testing 不匹配。

## 手动启用

1. 先按[项目安装说明](../README.md)加载扩展。在 Chrome 地址栏打开 `chrome://extensions/shortcuts`，确认扩展的前进/后退快捷键分别是 **Control + Q**、**Control + Shift + Q**（`⌃`，不是 `⌘`），作用范围为 Chrome 内。先直接试用 Control + Q。
2. 从 [Karabiner-Elements 官网](https://karabiner-elements.pqrs.org/)安装 Karabiner，按它的引导完成 macOS 要求的授权。当前交付没有安装 Karabiner，也没有修改系统设置。
3. 将本目录的 [arc-recent-tabs.json](./arc-recent-tabs.json) 复制到 `~/.config/karabiner/assets/complex_modifications/`。没有这个目录时新建它。可以在 Terminal 中执行下面三行；这是**手动安装步骤**：

   ```sh
   cd ~/Desktop/arc-recent-tabs
   mkdir -p "$HOME/.config/karabiner/assets/complex_modifications"
   cp -i macos/arc-recent-tabs.json "$HOME/.config/karabiner/assets/complex_modifications/arc-recent-tabs.json"
   ```

4. 打开 Karabiner-Elements → **Complex Modifications** → **Add predefined rule**（旧版可能叫 **Add rule**），找到 **Arc Recent Tabs** 并启用这一条规则。现有个人规则无需替换。[官方自定义规则说明](https://karabiner-elements.pqrs.org/docs/manual/configuration/add-your-own-complex-modifications/)
5. Chrome 内按住 Control，再多次点按 Tab，检查下面的验收步骤。

停用时，在 Karabiner 的 Complex Modifications 中移除/停用 **Arc Recent Tabs** 规则，即恢复 Chrome 自带的 Control + Tab。只删除复制的 JSON 文件不等于停用已经启用的规则。

## 按键语义

左右 Control 分别映射回原本的同一侧 Control，Tab 只变成 Q；Shift 作为可选修饰键原样保留，所以可以在一次选择过程中随时按住/松开 Shift。没有按键宏、延迟确认或粘滞 Control。Karabiner 的必需修饰键会在输出中移除，故配置在输出中显式加回同一侧 Control；可选修饰键会保留。[修饰键规则](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/from/modifiers/)

不要把右侧规则的输出改成通用 `control`：该名称是 `left_control` 的别名，可能产生多余的左右修饰键切换。[输出修饰键说明](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/to/modifiers/)

`repeat: true` 保留正常按下/抬起语义：Tab 按下对应 Q 按下，Tab 抬起对应 Q 抬起；保持 Control 物理按下，直至完成选择。文档和源代码支持这一设计，但物理 Control 的最终松键事件是否按预期到达 Chrome，仍须在安装 Karabiner 后实测。[输出事件说明](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/to/)、[官方事件处理实现](https://github.com/pqrs-org/Karabiner-Elements/blob/main/src/share/manipulator/manipulators/basic/event_sender.hpp)

规则接受额外的 Shift/Caps Lock；同时按 Command、Option、Fn 或两个 Control 时不匹配，避免拦截其他组合键。

## 安装后验收（物理键盘）

打开 A、B、C、D 四个标签，按 A → B → C → D 访问，停在 D。确认：

| 操作 | 应有结果 |
| --- | --- |
| 按住 Control，Tab 点按 1、2、3 次 | 面板依次选中 C、B、A；网页仍是 D |
| 每次只抬起 Tab，继续按住 Control | 面板保持打开，不提前确认 |
| 第 3 次后松开 Control | 切换到 A |
| 再开一轮，在 Control 按住时用 Shift + Tab | 反向移动选中项 |
| 松开 Shift，继续按住 Control | 面板保持打开，Tab 恢复正向 |
| 面板打开时按 Esc，再松开 Control | 取消并留在原标签 |
| 很快按下并松开 Control + Tab | 不留下卡住的面板；若焦点交接丢失松键，可用 Enter 确认或 Esc 退出 |
| 用右侧 Control 重复以上操作（如键盘有） | 同样有效 |
| 切换到 Finder，再按 Control + Tab | 不触发扩展映射 |
| 从 `chrome://settings` 发起切换 | 使用扩展的备用面板，并能用 Enter/Esc 完成操作 |

如果 Tab 一抬起就确认，先检查是否有其他 Karabiner 规则重映射了 Control；暂时停用冲突规则，再测试直接 Control + Q。若直接组合键正常、映射组合键异常，可以用 Karabiner-EventViewer 对照实际事件；只有 Control 真正释放时才应结束本轮。

**验证状态：**已检查 JSON 格式、Chrome 限定、左右 Control/Shift/Caps Lock 的匹配与输出。当前环境没有安装 Karabiner，上表尚未在物理键盘上完成；不能把这份配置视为已经实测的系统集成。
