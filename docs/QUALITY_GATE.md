# 质量门禁

提交前执行 `npm run qa:full`；所有阶段必须 exit code 0。

- `qa:guard`：动画规格、稳定节点标识、reduced motion、测试与二维码资源。
- `lint` / `type-check` / `build`：代码质量、TypeScript 与生产构建。
- `test:coverage`：覆盖率最低 lines/functions 60%、branches 50%。
- `test:e2e`：Chromium 执行 15 项 Playwright 验收。

失败视为 FAIL，保留日志和 trace，修复后重跑受影响用例与全量门禁。
