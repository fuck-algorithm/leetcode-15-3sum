# 验收报告（Round 1）

- 题目：LeetCode 15. 三数之和
- 仓库：git@github.com:fuck-algorithm/leetcode-15-3sum
- 日期：2026-11-03
- 阶段：M2（核心交互/渲染已有；M4 人工动效证据和 Rubric 未完成）

## B1–B7

| Gate | 结果 | 证据 |
|---|---|---|
| B1 | FAIL | 人工完整播放、820px 以下真实设备可读性及实际 1x/3x 节奏评估仍未完成 |
| B2 | PASS | qa:guard、lint、type-check、build、test:coverage、21 项 test:e2e 全部 exit code 0 |
| B3 | PASS | 原 15 项必过集合及新增回归全部通过；浏览器回归 21/21（含画布抽屉、独立题目/思路弹窗与 3000 元素虚拟滚动） |
| B4 | FAIL | 自动化 AC-001–022 通过；AC-023 自动证据已补，仍缺真实设备/全流程人工节奏复核 |
| B5 | PASS（自动测试范围） | 无已发现 P0/P1；仍需一次人工画面检查 |
| B6 | FAIL | 依据 references/04 量表完成暂定评分，需人工确认演示节奏与跨设备视觉项 |
| B7 | FAIL | 截图、1x/3x 视频、reduced-motion、虚拟数组 E2E 证据已齐；人工全程验收与远程 CI 输出仍缺 |

## 自动化验收结果

- `npm run qa:guard`：PASS
- `npm run lint`：PASS
- `npm run type-check`：PASS
- `npm run build`：PASS（Vite 7.3.0，636 modules）
- GitHub Pages 首页：HTTP 200，`text/html`
- 状态栏：`server-url.txt` 输出包含 GitHub Pages 超链接；文件已被 `.gitignore` 忽略
- `npm run test:unit`：PASS（10 tests）
- `npm run test:coverage`：PASS，lines 89.39%、functions 91.48%、branches 79.11%
- `npm run test:e2e -- --workers=4`：PASS（21/21，含题目描述与算法思路分离弹窗、画布代码抽屉、随机跳转、3 档视口及 3000 元素虚拟数组滑动验收）
- 桌面画布面积/视口（代码抽屉默认收起）：1366×768 为 82.59%，1920×1080 为 87.60%；画布宽度分别占 99.4%、99.6%。代码按需覆盖为抽屉，打开后画布几何边界不缩小。E2E-017 验证抽屉显示时画布边界不缩小。
- 3000 元素实测：每帧保留至多 96 个数组节点；鼠标平移按单次约 600 SVG px 增量移动，全局位置滑块可直接到末端；步骤快照限制在 40 帧内
- `git diff --check`：PASS

## 失败闭环记录

1. E2E-001 首轮顶部栏总占比 27.7%；压缩 header/input/control 后复测通过。
2. E2E-006 初始帧缺少当前焦点；增加初始化帧 current 状态后通过。
3. E2E-010 dialog 语义缺失；补 role/aria-label 后通过。
4. E2E-013 速度菜单受固定层覆盖；调整控件层级/菜单位置后单测与全量复测通过。
5. E2E-008 进度条事件目标被 controls-main 透明 flex 盒拦截；修正 pointer-events 后全量复测通过。

## 未闭环事项

- 已录制 1x 与 3x 完整播放视频；已保存 1366×768、1920×1080、相邻步骤及 reduced-motion 截图到被 git 忽略的 `artifacts/`。
- E2E 已执行 10 次非顺序进度跳转并确认样例节点不重叠；3000 元素输入每帧限制到 96 个 DOM 节点，虚拟窗口随镜头移动，拖动和平移滑块均可查看末端。
- 仍需人工完整播放复核指针轨迹、解说与画面同步，以及真实设备可读性；Pages 远程 CI workflow 尚未实跑。
- 部分源码仍超过技能建议的 250 行，Canvas renderer 需后续按层拆分。
- GitHub Actions 对完整 E2E 在 CI 的 Chromium 依赖安装和运行尚未实测。

## 暂定 Rubric（0–5）

| 项目 | 分数 | 备注 |
|---|---:|---|
| 首屏信息架构 | 5 | 默认 canvas area share 82.6%/87.6%（1366/1920）；代码抽屉不占用常驻布局 |
| 分镜清晰度 | 3 | 每步有语义字段，仍需精简事件帧 |
| 动效与运动语法 | 3 | keyed virtual array、显式状态符号、统一 motion token 与 reduced motion 已覆盖；需人工复核镜头节奏 |
| 代码同步准确性 | 3 | 行与快照绑定存在，少数 anchor 映射需人工核验 |
| 画布信息密度 | 3 | 核心数组、指针、结果、指标可读 |
| 交互可控性 | 4 | 快捷键、拖拽、缩放、速度通过 E2E |
| 多解法可比性 | N/A | 当前为单解法题目 |
| 稳定性 | 3 | 输入边界、覆盖率、E2E通过 |
| 工程发布质量 | 3 | Pages workflow 和 CI steps 已配置，远程 Pages 未发布验证 |
| 文档完整性 | 4 | 七份 docs 已补齐 |

最终结论：**FAIL**。自动化门禁、19 项浏览器回归与 3000 项虚拟化验证均通过，但人工全程播放/真实设备视觉复核、远程 CI workflow 验证尚未完成，不能宣称 PASS。
