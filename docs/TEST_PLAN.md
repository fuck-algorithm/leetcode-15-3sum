# 测试计划

## 单元测试

- `tests/unit/algorithms/threeSum.test.ts`：输入边界、随机输入、算法结果、步骤 operation/anchor/稳定 ID。
- `tests/unit/components/Canvas.test.tsx`：D3 分层、节点 keyed 更新、教学徽标/图例及缩放入口。
- `tests/unit/components/motion.test.ts`：时长 token、倍速缩放与 reduced-motion。

## 浏览器验收

`tests/e2e/acceptance.spec.ts` 覆盖首屏布局、输入、语言、代码同步、快捷键、拖拽进度、画布、模态框、二维码、速度、外链与配色。

## 执行顺序

`npm run test:unit` → `npm run test:coverage` → `npm run test:e2e`。E2E 使用 Chromium 和 42437 高位端口；失败记录 trace 到 `test-results/`。
