import { expect, test } from '@playwright/test';

const open = async (page: import('@playwright/test').Page) => page.goto('/');

test('E2E-001 首屏空间预算与动画教学层', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await open(page);
  await expect(page.getByRole('heading', { name: /15\. 三数之和/ })).toBeVisible();
  await expect(page.locator('.operation-badge')).toBeVisible();
  await expect(page.locator('.step-description')).toBeVisible();
  await expect(page.locator('.canvas-legend')).toBeVisible();
  const layout = await page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    return { header: rect('.header').height, canvas: rect('.canvas-section').height, svg: rect('.canvas-container svg').height, canvasWidth: rect('.canvas-container').width, canvasCardWidth: rect('.canvas-section').width, codeDrawer: rect('.code-drawer').width, viewportWidth: window.innerWidth, chrome: rect('.header').height + rect('.data-input').height + rect('.controls').height };
  });
  expect(layout.header).toBeLessThanOrEqual(52);
  expect(layout.canvas / 768).toBeGreaterThanOrEqual(0.62);
  expect(layout.canvasWidth / layout.viewportWidth).toBeGreaterThanOrEqual(0.98);
  expect(layout.canvasCardWidth * layout.canvas / (layout.viewportWidth * 768)).toBeGreaterThanOrEqual(0.8);
  expect(layout.svg / 768).toBeGreaterThanOrEqual(0.5);
  expect(layout.chrome / 768).toBeLessThanOrEqual(0.26);
});

test('E2E-002 题目链接新标签打开', async ({ page }) => { await open(page); await expect(page.locator('.title-link')).toHaveAttribute('target', '_blank'); await expect(page.locator('.title-link')).toHaveAttribute('href', /leetcode\.cn\/problems\/3sum/); });
test('E2E-003 非法输入不更新步骤，合法输入重置', async ({ page }) => { await open(page); await page.getByRole('textbox').fill('[1,2]'); await page.getByRole('button', { name: '应用' }).click(); await expect(page.locator('.error-message')).toBeVisible(); await page.getByRole('textbox').fill('[0,0,0]'); await page.getByRole('button', { name: '应用' }).click(); await expect(page.getByText('步骤 1 /')).toBeVisible(); });
test('E2E-004 示例和随机输入可用', async ({ page }) => { await open(page); await page.getByRole('button', { name: '示例2' }).click(); await expect(page.getByRole('textbox')).toHaveValue('[0,1,1]'); await page.getByRole('button', { name: /随机/ }).click(); await expect(page.getByRole('textbox')).not.toHaveValue('[0,1,1]'); });
test('E2E-005 语言偏好刷新后保留', async ({ page }) => { await open(page); await page.getByRole('button', { name: '查看代码' }).click(); await page.getByRole('button', { name: 'Python' }).click(); await page.reload(); await page.getByRole('button', { name: '查看代码' }).click(); await expect(page.getByRole('button', { name: 'Python' })).toHaveClass(/active/); });
test('E2E-006 步骤驱动代码与画布同步', async ({ page }) => { await open(page); await page.getByRole('button', { name: '查看代码' }).click(); const before = await page.locator('.stage-panel').getAttribute('data-step-id'); await page.keyboard.press('ArrowRight'); await expect(page.locator('.stage-panel')).not.toHaveAttribute('data-step-id', before ?? ''); await expect(page.locator('[data-status="current"]')).toHaveCount(1); await expect(page.locator('.code-line.highlighted')).toHaveCount(1); });
test('E2E-007 快捷键控制播放', async ({ page }) => { await open(page); await expect(page.getByRole('button', { name: '查看代码' })).toBeVisible(); await page.keyboard.press('ArrowRight'); await expect(page.getByText(/步骤 2 \/ /)).toBeVisible(); await page.keyboard.press('ArrowLeft'); await expect(page.getByText(/步骤 1 \/ /)).toBeVisible(); await page.keyboard.press('Space'); await expect(page.getByRole('button', { name: /暂停/ })).toBeVisible(); await page.keyboard.press('r'); await expect(page.getByRole('button', { name: /播放/ })).toBeVisible(); });
test('E2E-008 进度条可拖动到末尾', async ({ page }) => { await open(page); await expect(page.getByRole('button', { name: '查看代码' })).toBeVisible(); const slider = page.getByRole('slider', { name: '演示进度' }); const box = await slider.boundingBox(); if (!box) throw new Error('progress slider not visible'); await page.mouse.click(box.x + box.width - 2, box.y + box.height / 2); await expect(slider).toHaveAttribute('aria-valuenow', await slider.getAttribute('aria-valuemax') ?? ''); });
test('E2E-009 画布缩放控制更新缩放值', async ({ page }) => { await open(page); await expect(page.getByRole('button', { name: '查看代码' })).toBeVisible(); const zoom = page.locator('.canvas-toolbar span'); const before = await zoom.textContent(); await page.getByRole('button', { name: '放大画布' }).click(); await expect(zoom).not.toHaveText(before ?? ''); });
test('E2E-017 默认画布占屏，代码可按需抽屉打开', async ({ page }) => { await page.setViewportSize({ width: 1920, height: 1080 }); await open(page); const before = await page.locator('.canvas-section').boundingBox(); expect(before!.width / 1920).toBeGreaterThanOrEqual(0.82); await expect(page.locator('.code-drawer')).toHaveAttribute('aria-hidden', 'true'); await page.getByRole('button', { name: '查看代码' }).click(); await expect(page.locator('.code-drawer .code-panel')).toBeVisible(); await expect(page.locator('.code-drawer')).toHaveAttribute('aria-hidden', 'false'); const after = await page.locator('.canvas-section').boundingBox(); expect(after!.width).toBe(before!.width); await page.getByRole('button', { name: '关闭代码面板' }).click(); await expect(page.locator('.code-drawer')).toHaveAttribute('aria-hidden', 'true'); });
test('E2E-010 思路弹窗可打开关闭', async ({ page }) => { await open(page); await page.getByRole('button', { name: /算法思路/ }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.locator('.modal-close').click(); await expect(page.getByRole('dialog')).toBeHidden(); });
test('E2E-016 课本式题目描述弹窗可访问并可关闭', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: /题目描述/ }).click();
  const dialog = page.getByRole('dialog', { name: '题目描述' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: '三数之和' })).toBeVisible();
  await expect(dialog.getByText('3 <= nums.length <= 3000')).toBeVisible();
  await expect(dialog.getByRole('link', { name: '在 LeetCode 打开' })).toHaveAttribute('href', /leetcode\.cn\/problems\/3sum/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('E2E-018 题目描述与算法思路是独立弹窗', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: /题目描述/ }).click();
  const problemDialog = page.getByRole('dialog', { name: '题目描述' });
  await expect(problemDialog).toBeVisible();
  await expect(problemDialog.getByText('示例 1')).toBeVisible();
  await page.locator('.problem-modal .modal-close').click();
  await expect(problemDialog).toBeHidden();

  await page.getByRole('button', { name: /算法思路/ }).click();
  const ideaDialog = page.getByRole('dialog', { name: /算法思路/ });
  await expect(ideaDialog).toBeVisible();
  await expect(ideaDialog.getByRole('heading', { name: '解题思路：排序 + 双指针' })).toBeVisible();
  await expect(ideaDialog.getByText(/复杂度分析/)).toBeVisible();
  await expect(ideaDialog.getByText('示例 1')).toHaveCount(0);
});
test('E2E-011 单解法界面清晰呈现', async ({ page }) => { await open(page); await expect(page.locator('.canvas-section')).toBeVisible(); await expect(page.locator('.canvas-section')).toContainText('查看代码'); await expect(page.locator('.code-drawer')).toHaveAttribute('aria-hidden', 'true'); });
test('E2E-012 悬浮球展示二维码原比例', async ({ page }) => { await open(page); await page.locator('.floating-ball').hover(); const image = page.getByAltText('微信交流群'); await expect(image).toBeVisible(); await expect(image).toHaveAttribute('src', /assets\/qrcode-community\.png/); });
test('E2E-013 速度偏好刷新后保留', async ({ page }) => { await open(page); await expect(page.getByRole('button', { name: '查看代码' })).toBeVisible(); await page.getByRole('button', { name: /速度/ }).click(); await page.getByRole('button', { name: '2x' }).click(); await page.reload(); await expect(page.getByRole('button', { name: /2x 速度/ })).toBeVisible(); });
test('E2E-014 GitHub 链接及星标数字展示', async ({ page }) => { await open(page); await expect(page.locator('.github-link')).toHaveAttribute('target', '_blank'); await expect(page.locator('.star-count')).toContainText(/\d+/); });
test('E2E-015 样式不使用紫色主题', async ({ page }) => { await open(page); const css = await page.locator('body').evaluate(() => [...document.styleSheets].map(sheet => { try { return [...sheet.cssRules].map(rule => rule.cssText).join(' '); } catch { return ''; } }).join(' ')); expect(css.toLowerCase()).not.toMatch(/purple|violet|#8b5cf6|#a855f7/); });
