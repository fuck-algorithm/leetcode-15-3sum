import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
for (const viewport of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }, { width: 820, height: 900 }]) {
  const page = await browser.newPage({ viewport });
  await page.goto('http://127.0.0.1:42437/leetcode-15-3sum/');
  await page.locator('.operation-badge').waitFor();
  const box = await page.locator('.canvas-container svg').boundingBox();
  await page.screenshot({ path: `/tmp/visual-${viewport.width}.png` });
  for (const i of [0, 1, 2, 3, 5, 10, 15, 21]) {
    const slider = page.getByRole('slider', { name: '演示进度' });
    const b = await slider.boundingBox();
    if (b) await page.mouse.click(b.x + b.width * i / 21, b.y + b.height / 2);
    const info = await page.locator('.stage-panel').getAttribute('data-step-id');
    const statuses = await page.locator('[data-status]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-status')));
    const overflows = await page.locator('.array-cell-group').evaluateAll(nodes => nodes.map(n => ({id:n.getAttribute('data-node-id'), r:n.getBoundingClientRect().toJSON()})));
    if (i === 0) console.log(viewport, 'svg', box);
    console.log('step', i, info, 'statuses', statuses, 'nodes', overflows.length, 'last-right', overflows.at(-1)?.r.right);
  }
  await page.close();
}
await browser.close();
