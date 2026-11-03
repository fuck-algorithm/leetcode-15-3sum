import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const failures = [];
if (!existsSync('docs/ANIMATION_SPEC.md')) failures.push('缺少 docs/ANIMATION_SPEC.md');
if (!existsSync('tests/unit')) failures.push('缺少单元测试目录');
if (!existsSync('tests/e2e/acceptance.spec.ts')) failures.push('缺少 Playwright 验收用例');
if (!existsSync('public/assets/qrcode-community.png')) failures.push('缺少标准二维码资源');
const sourceFiles = [];
function walk(path) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const target = join(path, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.(tsx?|css)$/.test(entry.name)) sourceFiles.push(target);
  }
}
walk('src');
const source = sourceFiles.map(path => readFileSync(path, 'utf8')).join('\n');
if (/selectAll\(['"]\*['"]\)\.remove\(\)/.test(source) && !source.includes('data-node-id')) failures.push('检测到整屏删除重建反模式');
if (!source.includes('prefers-reduced-motion')) failures.push('缺少 reduced motion 支持');
if (!source.includes('data-node-id')) failures.push('缺少稳定节点 ID');
if (failures.length) {
  console.error(failures.map(failure => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log(`qa:guard PASS (${sourceFiles.length} source files inspected)`);
