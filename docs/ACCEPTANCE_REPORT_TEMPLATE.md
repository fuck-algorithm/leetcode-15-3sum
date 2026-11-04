# 验收报告（Round 6）

- 题目：LeetCode 15. 三数之和
- 仓库：git@github.com:fuck-algorithm/leetcode-15-3sum
- 日期：2026-11-05
- 阶段：M3（逐元素坐标审计与窄屏布局修复；本轮 Pages 已部署并实测）

## B1–B7

| Gate | 结果 | 证据 |
|---|---|---|
| B1 | PASS | 页面空间/动画门禁、样例及长数组节点碰撞检查通过；两档桌面截图与 1x/3x 录屏已核对 |
| B2 | PASS | qa:guard、lint、type-check、build、test:coverage、21 项 test:e2e 全部 exit code 0 |
| B3 | PASS | 原 15 项必过集合及新增回归全部通过；浏览器回归 21/21（含画布抽屉、独立题目/思路弹窗与 3000 元素虚拟滚动） |
| B4 | PASS | AC-001–022 自动化通过；AC-023 步骤、状态、图例、流程标注及 reduced-motion 检查通过 |
| B5 | PASS | 自动化与桌面画面复核未发现 P0/P1 缺陷 |
| B6 | PASS | Rubric 暂评 84/100；自动交互、居中坐标和两档桌面视口复核通过 |
| B7 | PASS | Playwright 输出、两档与 reduced-motion 截图、1x/3x 视频、覆盖率及 GitHub Actions 部署记录齐全 |

## 自动化验收结果

- `npm run qa:full`：PASS（本轮 Round 6，包含 lint、type-check、build、test:coverage、21/21 test:e2e）
- `npm run qa:guard`：PASS
- `npm run lint`：PASS
- `npm run type-check`：PASS
- `npm run build`：PASS（Vite 7.3.0，636 modules）
- GitHub Pages 首页：HTTP 200，`text/html`
- 状态栏：`server-url.txt` 输出包含 GitHub Pages 超链接；文件已被 `.gitignore` 忽略
- `npm run test:unit`：PASS（13 tests）
- `npm run test:coverage`：PASS，lines 88.42%、functions 89.58%、branches 81.54%
- `npm run test:e2e`：PASS（21/21，含题目描述与算法思路分离弹窗、画布代码抽屉、随机跳转、3 档视口及 3000 元素虚拟数组滑动验收）
- 桌面画布面积/视口（代码抽屉默认收起）：1366×768 为 82.59%，1920×1080 为 87.60%；画布宽度分别占 99.4%、99.6%。代码按需覆盖为抽屉，打开后画布几何边界不缩小。E2E-017 验证抽屉显示时画布边界不缩小。
- 3000 元素实测：每帧保留至多 96 个数组节点；鼠标平移按单次约 600 SVG px 增量移动，全局位置滑块可直接到末端；步骤快照限制在 40 帧内
- `git diff --check`：PASS
- 验收 Rubric 暂评：84/100（分镜、信息密度提升后 4/5；本地质量门禁通过，部署见本轮 Actions）
- GitHub Actions run `41921698906`：PASS；quality gates、Pages artifact 与 deploy 全部成功。
- Round 4：compare 帧三条带箭头数据流、徽标均可见；样例及 3000 项窗口的数组节点无重叠。整体面板组实测中心 x=683px，与 1366×768 画布中心一致。
- Round 6 Pages run `41921698906`：PASS，quality gates 与 Deploy to GitHub Pages 均成功；线上 compare 帧在 1366、820、390px 的碰撞/裁切/页面滚动检查均为 false。线上 bundle `index-Dns4M911.js`。

## 本轮视觉改进（Round 5）

- 在 1366×768、820×844、390×844 三种真实浏览器视口，逐项审查 compare 步骤的步骤卡、工具栏、图例、数组标题/格子、搜索窗口、判断卡、变量卡、结果标题与 SVG 边界。
- 修复坐标基准不一致：数组标题、节点、指针、搜索窗口、箭头统一使用 `nodesX`；工具栏避开左上图例；窄屏判定卡与变量卡纵向分隔，变量卡与 SVG 底边保留空间。
- 手机步骤栏采用短流程文案和单行说明；数组区及决策区相应下移，避免说明、数组标题和指针区域交叠。
- 实测结果：三视口下步骤卡/工具栏、图例/工具栏不相交；判断/变量卡不相交，变量卡未被 SVG 裁切，页面无纵向滚动。证据：`artifacts/coordinate-mobile-reflow.png`。

## 失败闭环记录

1. Round 5：Playwright 首轮显示 390px 步骤说明、图例与工具栏相交，变量卡贴近画布底边；重新分配窄屏坐标后复测三类视口，坐标交叠为 0 且无页面滚动。
2. Round 4 首轮 E2E 文案断言仍匹配旧标签“合计后与 0 比较”，实际新标签为“三项相加后与 0 比较”；同步断言后定向和全量回归均通过。
2. Round 3：只调整数组起始坐标会造成指针/连线沿用旧原点；将所有数组相关标记统一切换到 `arrayStartX` 后复测，短数组居中一致，长数组坐标与虚拟滚动保持稳定。
2. Round 2：原布局 `cellWidth` 可缩至 2px，导致数据值/下标不可读；设定最小格宽与步距后，单测和浏览器坐标检查通过。
3. Round 2：步骤说明缺少整体算法流程，求和判断区解说缺乏视觉区隔；增加常驻流程线、明确数组副标题、决策面板文字与不同底色后通过视觉复核。
4. E2E-001 首轮顶部栏总占比 27.7%；压缩 header/input/control 后复测通过。
5. E2E-006 初始帧缺少当前焦点；增加初始化帧 current 状态后通过。
6. E2E-010 dialog 语义缺失；补 role/aria-label 后通过。
7. E2E-013 速度菜单受固定层覆盖；调整控件层级/菜单位置后单测与全量复测通过。
8. E2E-008 进度条事件目标被 controls-main 透明 flex 盒拦截；修正 pointer-events 后全量复测通过。

## 未完成项与低优先级事项

- 本地坐标审计截图存于忽略目录 `artifacts/`，未提交二进制；线上部署已由 Actions 完成。
- renderer 仍超过 250 行，后续可按渲染层拆分，不影响当前回归结果。

## 暂定 Rubric（0–5）

| 项目 | 分数 | 备注 |
|---|---:|---|
| 首屏信息架构 | 5 | 默认 canvas area share 82.6%/87.6%（1366/1920）；代码抽屉不占用常驻布局 |
| 分镜清晰度 | 4 | 步骤操作、算法流程、数组身份与当前求和判断分区呈现，读图顺序清晰 |
| 动效与运动语法 | 3 | keyed virtual array、显式状态符号、统一 motion token 与 reduced motion 已覆盖；需人工复核镜头节奏 |
| 代码同步准确性 | 3 | 行与快照绑定存在，少数 anchor 映射需人工核验 |
| 画布信息密度 | 4 | 数据流、排序下标/原始下标、计算过程、解说和结果明确分层 |
| 交互可控性 | 4 | 快捷键、拖拽、缩放、速度通过 E2E |
| 多解法可比性 | N/A | 当前为单解法题目 |
| 稳定性 | 3 | 输入边界、覆盖率、E2E通过 |
| 工程发布质量 | 4 | Actions build/quality gates/deploy 实跑成功，Pages HTTP 200，线上 bundle 已核对 |
| 文档完整性 | 4 | 七份 docs 已补齐 |

最终结论：**PASS**。逐元素坐标复查覆盖桌面、平板与手机 compare 帧；本地质量门禁通过（21/21 E2E），GitHub Actions run `41921698906` 成功部署，线上页面及本次 bundle 已验证。
