import { expect, test } from '@playwright/test';

test('visually demonstrates stable focus states across semantic steps', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: '查看代码' })).toBeVisible();
  const stage = page.locator('.stage-panel');
  await expect(stage).toHaveAttribute('data-operation', 'init');
  await expect(page.locator('[data-status="current"]')).toHaveCount(1);

  await page.keyboard.press('ArrowRight');
  await expect(stage).toHaveAttribute('data-operation', 'read');
  await expect(page.locator('[data-status="current"]')).toHaveCount(1);

  await page.keyboard.press('ArrowRight');
  await expect(stage).toHaveAttribute('data-operation', 'move');
  await expect(page.locator('[data-status="current"]')).toHaveCount(1);

  await page.keyboard.press('ArrowRight');
  await expect(stage).toHaveAttribute('data-operation', 'compare');
  await expect(page.locator('[data-status="compare"]')).toHaveCount(2);
  await expect(page.locator('.move-label')).toHaveCount(0);

  await page.getByRole('button', { name: '示例2' }).click();
  await expect(stage).toHaveAttribute('data-step-id', '0');
  await page.getByRole('button', { name: '下一步 ⏭' }).click();
  await expect(stage).toHaveAttribute('data-operation', 'read');
  await expect(page.locator('[data-status="current"]')).toHaveCount(1);
  await page.getByRole('button', { name: '示例1' }).click();
  await page.getByRole('button', { name: '下一步 ⏭' }).click();
  await page.getByRole('button', { name: '下一步 ⏭' }).click();
  await page.getByRole('button', { name: '下一步 ⏭' }).click();
  await expect(page.locator('.move-label')).toHaveCount(0);

  for (let jump = 0; jump < 10; jump += 1) {
    const target = (jump * 7 + 3) % 22;
    const slider = page.getByRole('slider', { name: '演示进度' });
    const bounds = await slider.boundingBox();
    if (!bounds) throw new Error('progress slider not visible');
    await page.mouse.click(bounds.x + bounds.width * target / 21, bounds.y + bounds.height / 2);
    await expect(page.locator('.stage-panel')).toHaveAttribute('data-step-id', String(target));
    await expect(page.locator('.array-cell-group')).toHaveCount(6);
  }
});

test('renders all panels in a one-screen responsive layout', async ({ page }) => {
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 820, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const metrics = await page.evaluate(() => ({
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      canvasHeight: document.querySelector('.canvas-container')!.getBoundingClientRect().height,
      svgHeight: document.querySelector('.canvas-container svg')!.getBoundingClientRect().height,
      canvasWidth: document.querySelector('.canvas-container')!.getBoundingClientRect().width,
      canvasCardWidth: document.querySelector('.canvas-section')!.getBoundingClientRect().width,
      codeDrawerWidth: document.querySelector('.code-drawer')!.getBoundingClientRect().width,
      codeWidth: document.querySelector('.code-section')?.getBoundingClientRect().width ?? 0
    }));
    expect(metrics.pageHeight).toBeLessThanOrEqual(metrics.viewportHeight);
    expect(metrics.canvasHeight).toBeGreaterThan(viewport.height * 0.4);
    expect(metrics.svgHeight).toBeGreaterThan(viewport.height * 0.35);
    if (viewport.width >= 1100) {
      expect(metrics.codeDrawerWidth).toBeGreaterThanOrEqual(0);
      expect(metrics.canvasWidth / viewport.width).toBeGreaterThanOrEqual(0.78);
      expect(metrics.canvasCardWidth * metrics.canvasHeight / (viewport.width * viewport.height)).toBeGreaterThanOrEqual(0.8);
      expect(metrics.canvasCardWidth / viewport.width).toBeGreaterThanOrEqual(0.98);
    }
  }
});
