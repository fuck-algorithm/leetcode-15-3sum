import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const baseURL = 'http://127.0.0.1:42437/leetcode-15-3sum/';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const viewport of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
  const page = await browser.newPage({ viewport });
  await page.goto(baseURL);
  await page.locator('.stage-panel').waitFor();
  await page.locator('.array-cell-group').first().waitFor();
  await page.waitForTimeout(240);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `artifacts/initial-${viewport.width}x${viewport.height}.png`, fullPage: true });
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(240);
  await page.screenshot({ path: `artifacts/adjacent-step-${viewport.width}x${viewport.height}.png`, fullPage: true });
  await page.close();
}

const reduced = await browser.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
await reduced.goto(baseURL);
await reduced.locator('.operation-badge').waitFor();
await reduced.keyboard.press('ArrowRight');
await reduced.waitForTimeout(240);
await reduced.screenshot({ path: 'artifacts/reduced-motion-1366x768.png', fullPage: true });
await reduced.close();

for (const speed of ['1x', '3x']) {
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: { dir: 'artifacts', size: { width: 1366, height: 768 } }
  });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.locator('.stage-panel').waitFor();
  await page.locator('.array-cell-group').first().waitFor();
  await page.waitForTimeout(240);
  if (speed === '3x') {
    await page.getByRole('button', { name: /速度/ }).click();
    await page.getByRole('button', { name: '3x' }).click();
  }
  await page.getByRole('button', { name: /播放/ }).click();
  await page.waitForFunction(() => {
    const label = document.querySelector('.step-info')?.textContent ?? '';
    const match = label.match(/步骤\s+(\d+)\s+\/\s+(\d+)/);
    return match && match[1] === match[2];
  }, { timeout: 60_000 });
  await context.close();
  const videos = await import('node:fs/promises').then(fs => fs.readdir('artifacts'));
  const latestVideo = videos.filter(file => file.endsWith('.webm')).sort().at(-1);
  if (latestVideo) {
    const fs = await import('node:fs/promises');
    await fs.rename(`artifacts/${latestVideo}`, `artifacts/playback-${speed}.webm`);
  }
}

await browser.close();
console.log('截图与 1x/3x 播放录屏已保存到 artifacts/');
