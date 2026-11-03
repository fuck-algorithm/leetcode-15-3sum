import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto('http://127.0.0.1:42437/leetcode-15-3sum/');
await page.locator('.operation-badge').waitFor();

const runStep = async (index) => {
  const slider = page.getByRole('slider', { name: '演示进度' });
  const bounds = await slider.boundingBox();
  if (!bounds) throw new Error('进度条不可见');
  const lastStep = Number(await slider.getAttribute('aria-valuemax')) - 1;
  const target = Math.min(index, lastStep);
  await page.locator('.stage-panel').evaluate(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', bubbles: true })); });
  for (let position = 0; position < target; position += 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(30);
  }
  await page.waitForFunction(expected => document.querySelector('.stage-panel')?.getAttribute('data-step-id') === String(expected), target, { timeout: 3000 });
  await page.waitForTimeout(220);
  return page.evaluate(() => {
    const svg = document.querySelector('.canvas-container svg').getBoundingClientRect();
    const nodes = [...document.querySelectorAll('.array-cell-group')].map(node => {
      const box = node.getBoundingClientRect();
      return { id: node.getAttribute('data-node-id'), status: node.getAttribute('data-status'), x: box.x, y: box.y, width: box.width, height: box.height };
    }).filter(node => node.width && node.height);
    const legend = document.querySelector('.canvas-legend').getBoundingClientRect();
    const metrics = [...document.querySelectorAll('.canvas-metric')].map(node => node.textContent);
    const overlap = [];
    for (let i = 0; i < nodes.length; i += 1) for (let j = i + 1; j < nodes.length; j += 1) {
      if (nodes[i].status !== 'idle' || nodes[j].status !== 'idle') continue;
      if (nodes[i].x < nodes[j].x + nodes[j].width && nodes[j].x < nodes[i].x + nodes[i].width && nodes[i].y < nodes[j].y + nodes[j].height && nodes[j].y < nodes[i].y + nodes[i].height) overlap.push([nodes[i].id, nodes[j].id]);
    }
    return { svg: { x: svg.x, y: svg.y, width: svg.width, height: svg.height }, legend: { x: legend.x, y: legend.y, width: legend.width, height: legend.height }, nodes, overlap, metrics };
  });
};

await page.getByRole('button', { name: '示例1' }).click();
const sample = await page.locator('.input-field').inputValue();
const results = [];
for (const index of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 18, 21]) results.push({ index, ...(await runStep(index)) });
const longInput = JSON.stringify(Array.from({ length: 3000 }, (_, index) => index % 31 - 15));
await page.locator('.input-field').fill(longInput);
await page.getByRole('button', { name: '应用' }).click();
const longResult = await runStep(0);
console.log(JSON.stringify({ sample, sampleSteps: results, longArray: longResult }, null, 2));
await browser.close();
