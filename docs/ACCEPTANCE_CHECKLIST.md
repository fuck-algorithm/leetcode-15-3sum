# 验收清单

> 结论按运行证据填写；静态检查/E2E 通过不替代人工视觉验收。

| AC | 核对项 | 本轮状态 |
|---|---|---|
| AC-001 | 单屏与空间预算 | PASS：1366×768 E2E 空间预算通过 |
| AC-002 | 标题与题目新标签链接、原题弹窗 | PASS：E2E-002 / E2E-016 / E2E-018；独立课本式弹窗支持桌面双页、窄屏单页、Esc/遮罩关闭、原题外链 |
| AC-003 | Hot100 新标签链接 | PASS：实现位于 Header |
| AC-004 | GitHub 仓库新标签链接 | PASS：E2E-014 |
| AC-005 | Star 1 小时缓存与失败回退 | PASS：IndexedDB 缓存读取与 fetch fallback 已实现 |
| AC-006 | 多解法隔离 | N/A：此应用只展示双指针一种解法 |
| AC-007 | 输入校验、样例、随机合法数据 | PASS：单元测试、E2E-003/004 |
| AC-008 | 四语言、Java 默认、持久化与变量旁注 | PASS：组件支持四语言，默认 Java；E2E-005/006 |
| AC-009 | 画布平移缩放与数据流 | PASS：D3 zoom/global array range navigator、long-array virtual window 与 E2E-009/新增 AC-virtual-array |
| AC-010 | 数组/指针状态联动 | PASS：稳定 keyed array join、状态留痕、指针轨迹与固定 DOM 图例/指标 |
| AC-011 | 快捷键与可拖进度 | PASS：E2E-007/008 |
| AC-012 | 速度偏好持久化 | PASS：E2E-013 |
| AC-013 | 悬浮球、二维码比例与路径 | PASS：E2E-012，资源在 `public/assets/qrcode-community.png` |
| AC-014 | 禁止紫色主题 | PASS：E2E-015 |
| AC-015 | Pages 部署配置与质量工作流 | PASS：`.github/workflows/deploy.yml` 含安装、检查和 Pages 部署任务 |
| AC-016 | lint/type-check/build | PASS：全量命令退出码 0 |
| AC-017 | 15 条 Playwright 必过集与扩展回归 | PASS：21/21（包含课本原题弹窗、布局、状态跳转与 3000 元素虚拟窗口） |
| AC-018 | 极简 README | PASS：标题、一句话、线上链接 |
| AC-019 | 覆盖率门槛 | PASS：lines 89.39%、functions 91.48%、branches 79.11% |
| AC-020 | 单元测试目录 | PASS：`tests/unit/` |
| AC-021 | Vitest 配置 | PASS：`vitest.config.ts` |
| AC-022 | `validateInput` 正负向测试 | PASS：`tests/unit/algorithms/threeSum.test.ts` |
| AC-023 | 语义步骤与动画教学层 | 部分 PASS：焦点状态、固定 DOM 图例/指标、reduced motion 与 keyed virtual array 已实现；1x/3x 录像、截图在 `artifacts/`；E2E 覆盖随机跳转及 3000 元素窗口；人工播放节奏与跨设备遮挡仍需复核 |
