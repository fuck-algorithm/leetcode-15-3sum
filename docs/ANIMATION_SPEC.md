# 三数之和动画规格说明（AC-023）

## 1. 本题结构与焦点

| 项目 | 内容 |
|---|---|
| 主数据结构 | 带原始索引的排序数组 |
| 辅助结构 | 结果三元组列表 |
| 必须画出的标量 | `i`、`left`、`right`、`sum`、`target`、解的数量 |
| 每步焦点上限 | 一个当前状态焦点；`compare` 时最多两个待比较指针 |
| 步骤总数 | 示例输入按每个算法事件生成，数据量上限 40 步为教学合并目标（当前事件式快照尚未压缩） |

## 2. 步骤规划表

| step | operation | 焦点元素 | 状态变化 | 解说要点 | 代码锚点 |
|---|---|---|---|---|---|
| 初始化 | init | nums[0] | 首元素 current，其余 idle | 读取数组并准备排序 | step-0 |
| 排序 | read | 排序后的数组 | 保持原始身份 ID | 排序建立单调移动条件 | step-1 |
| 固定 i | move | nums[i] | 固定值 current | 固定首项后在右侧寻找相反数 | 稳定 step ID |
| 求和 | compare | left/right | 两指针 compare | 根据总和与零的大小决定移动方向 | 稳定 step ID |
| 命中 | match | 三元组 | 命中节点 done | 记录解并去除重复值 | 稳定 step ID |
| 完成 | done | result | 最终解保持 done | 结束扫描并返回去重结果 | 稳定 step ID |

数组节点以原始输入位置 `array-{originalIndex}` 标识；排序后其显示坐标随排序索引变化，同一帧全部数组元素保持稳定 ID。

## 3. 运动语法

| 变化 | 实现 | 时长（1x） | 缓动 |
|---|---|---|---|
| 状态/位置 | D3 keyed join 复用节点，CSS 状态过渡 | ≤240ms | ease |
| 退场 | exit selection 淡出后回调清除 | 160ms | ease |
| 跳步 | 先 interrupt 再立即同步快照 | 0ms | 线性 |
| reduced motion | JS 退场归零、CSS transition/animation 关闭 | 0ms | — |

位移、箭头、退场动画使用 `src/components/Canvas/motion.ts` 的 MOTION token；跳步时先 interrupt 当前 transition。播放速率中的 3x 提供快速节奏验收。

## 4. 状态图例

| 状态 | 含义 | 使用 |
|---|---|---|
| current | 当前扫描焦点 | 是 |
| compare | 双指针比较 | 是 |
| visited | 已跳过重复值 | 是 |
| done | 命中答案 | 是 |
| path | 最终路径 | 否 |
| error | 冲突/剪枝 | 否 |

图例固定展示固定值、left、right、命中答案；以颜色、轮廓及索引/指针标签共同传达状态。

## 5. 辅助结构容器

本题不使用栈或队列；结果使用固定语义的三元组卡片展示。

## 6. 箭头与标注规范

数据流使用标记 `i/left/right`、求和曲线及“参与本次求和”文字表达；指针移动轨迹包含指针名和起止索引。当前 renderer 仍有部分辅助线未实现 keyed join，待完善。

## 7. 布局、空间预算与坐标

- CSS 工作区优先让画布占据余量，代码栏 `clamp(320px, 24vw, 400px)`。
- 数组节点位置：`x = startX + sortedIndex × (cellWidth + gap)`，`y = max(188, 0.34 × 绘图区高度)`。
- 稳定 ID：`array-{originalIndex}`；同元素排序阶段位置允许按新排序索引迁移。
- 摄像机默认轻微左上留白，支持拖动/缩放，播放步骤不主动重置。

## 8. 教学层

- 画布提供阶段标题、`operation-badge`、步骤解说、固定图例、求和/指针指标面板。
- 每个 `AlgorithmStep` 包含 operation、narration、至少一个稳定 `anchorIds`。
- 代码面板按当前快照高亮行，并展示高亮变量旁注。

## 9. 无障碍

`prefers-reduced-motion` 下关闭 CSS transition/animation，并将退场时间设为零；操作状态、解说和代码仍更新。

## 10. 验收清单

- [x] 固定 ID 数组节点使用 keyed join，快速跳步前先中断过渡。
- [x] 数组节点退场经 `fadeOutAndRemove`，并有 canvas keyed join 单测；容器/全部边层缺全面测试。
- [ ] 所有辅助箭头/标注均 keyed join，检查无重叠。
- [x] 1x/3x 连续播放录屏与两档 viewport/相邻步骤截图保存到 `artifacts/`。
- [x] reduced motion 下保留状态与解说，并保存截图。
- [x] 截图与录屏证据保存到 `artifacts/`（本地忽略，不提交二进制）。
- [ ] 手动随机跳步 10 次、检查过渡中同 ID 节点重入和画面重叠。
