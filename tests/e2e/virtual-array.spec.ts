import { expect, test } from '@playwright/test';

test('virtualizes 3000 array cells and pans to the end', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: '查看代码' })).toBeVisible();
  const values = Array.from({ length: 3000 }, (_, index) => index % 31 - 15);
  await page.getByRole('textbox').fill(JSON.stringify(values));
  await page.getByRole('button', { name: '应用' }).click();
  await expect(page.locator('.array-cell-group')).toHaveCount(96);

  const svg = page.locator('.canvas-container svg');
  const bounds = await svg.boundingBox();
  if (!bounds) throw new Error('canvas svg not visible');
  await page.getByRole('slider', { name: '数组全局位置' }).evaluate(element => {
    const slider = element as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(slider, '1');
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect.poll(async () => page.locator('.canvas-content').getAttribute('transform')).toContain('scale(1)');
  await expect(page.locator('.array-cell-group')).toHaveCount(96);
  const visible = await page.locator('.array-cell-group').evaluateAll(nodes => nodes.map(node => Number(node.getAttribute('data-node-id')!.slice('array-'.length))).sort((a, b) => a - b));
  expect(visible[0]).toBeGreaterThan(0);
  expect(visible.at(-1)).toBeGreaterThan(100);
  expect(await page.locator(`[data-node-id="array-${values.length - 1}"]`).count()).toBe(0);
});
