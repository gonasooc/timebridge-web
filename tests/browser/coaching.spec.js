import { expect, test } from '@playwright/test';

const radio = (page, name, value) => page.locator(`input[name="${name}"][value="${value}"]`);

async function chooseDirection(page, topic = 'work') {
  await radio(page, 'target', 'mother').check();
  await page.locator('input[name="birthEra"]:not([value="unknown"])').first().check();
  await radio(page, 'topic', topic).check();
}

async function openSample(page, topic = 'work') {
  await page.goto('/#direction');
  await chooseDirection(page, topic);
  await page.getByTestId('direction-submit').click();
  await expect(page).toHaveURL(/#sample$/);
}

async function fillConsult(page, { name = '브라우저 검증', email = 'preview-only@example.test' } = {}) {
  await page.getByLabel('이름 또는 별칭', { exact: true }).fill(name);
  await page.getByLabel('이메일', { exact: true }).fill(email);
  for (const field of ['timing', 'interviewMethod', 'parentReadiness']) {
    await page.locator(`input[name="${field}"]`).first().check();
  }
}

async function expectNoOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
}

async function expectSampleQuestions(page) {
  await expect(page.getByTestId('sample-question-list')).toBeVisible();
  const count = await page.getByTestId('sample-question-list').locator('li').count();
  expect(count).toBeGreaterThanOrEqual(5);
  expect(count).toBeLessThanOrEqual(8);
}

test('소개에서 상담 초안까지 네 화면을 확인할 수 있다', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByTestId('demo-notice')).toBeVisible();
  await expectNoOverflow(page);
  await page.getByRole('link', { name: '우리 부모님 인터뷰 미리보기', exact: true }).first().click();
  await expect(page).toHaveURL(/#direction$/);
  await expectNoOverflow(page);
  await chooseDirection(page);
  await page.getByTestId('direction-submit').click();
  await expect(page).toHaveURL(/#sample$/);
  await expect(page.getByTestId('sample-heading')).toBeVisible();
  await expectSampleQuestions(page);
  await expect(page.getByTestId('sample-disclosure')).toContainText('가상');
  await expect(page.getByTestId('sample-coach-note')).toBeVisible();
  await expectNoOverflow(page);
  await page.getByTestId('sample-to-consult').click();
  await expect(page).toHaveURL(/#consult$/);
  await fillConsult(page);
  await page.getByTestId('consult-preview-button').click();
  await expect(page.getByTestId('consult-summary')).toBeVisible();
  await expect(page.getByTestId('consult-summary')).toContainText('preview-only@example.test');
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test('방향의 필수 항목을 빠뜨리면 다음 단계로 이동하지 않는다', async ({ page }) => {
  await page.goto('/#direction');
  const submit = page.getByTestId('direction-submit');
  await submit.click();
  await expect(page).toHaveURL(/#direction$/);
  await radio(page, 'target', 'father').check();
  await submit.click();
  await expect(page).toHaveURL(/#direction$/);
  await radio(page, 'birthEra', 'unknown').check();
  await submit.click();
  await expect(page).toHaveURL(/#direction$/);
  await radio(page, 'topic', 'unknown').check();
  await submit.click();
  await expect(page).toHaveURL(/#sample$/);
  await expectSampleQuestions(page);
  await expect(page.getByTestId('sample-heading')).not.toContainText(/undefined|null/);
});

test('뒤로 가기와 방향 수정 후에도 선택이 유지되고 주제에 따라 질문이 바뀐다', async ({ page }) => {
  await openSample(page);
  const firstQuestions = await page.getByTestId('sample-question-list').innerText();
  await page.getByTestId('sample-edit').click();
  await expect(page).toHaveURL(/#direction$/);
  await expect(radio(page, 'target', 'mother')).toBeChecked();
  await expect(radio(page, 'topic', 'work')).toBeChecked();
  await radio(page, 'topic', 'childhood').check();
  await page.getByTestId('direction-submit').click();
  await expect(page.getByTestId('sample-question-list')).not.toHaveText(firstQuestions);
  await page.getByTestId('sample-to-consult').click();
  await page.goBack();
  await expect(page).toHaveURL(/#sample$/);
  await page.getByTestId('sample-edit').click();
  await expect(radio(page, 'topic', 'childhood')).toBeChecked();
  await page.reload();
  await expect(radio(page, 'topic', 'childhood')).toBeChecked();
});

for (const route of ['sample', 'consult']) {
  test(`방향 선택 없이 ${route} 주소에 접근하면 방향 선택으로 안내한다`, async ({ page }) => {
    await page.goto(`/#${route}`);
    await expect(page).toHaveURL(/#direction$/);
    await expect(page.getByTestId('direction-submit')).toBeVisible();
  });
}

test('상담 초안은 연락처를 전송하거나 영구 저장하지 않고 새로고침하면 비워진다', async ({ page, context }) => {
  await openSample(page);
  await page.getByTestId('sample-to-consult').click();
  const requests = [];
  const consoleMessages = [];
  const name = '<b>비공개 검증</b>';
  const email = 'private-draft@example.test';
  context.on('request', (request) => requests.push(`${request.method()} ${request.url()} ${request.postData() || ''}`));
  page.on('console', (message) => consoleMessages.push(message.text()));
  await fillConsult(page, { name, email });
  await page.getByTestId('consult-preview-button').click();
  await expect(page.getByTestId('consult-summary')).toContainText(name);
  await expect(page.getByTestId('consult-summary').locator('b').filter({ hasText: '비공개 검증' })).toHaveCount(0);
  await expect(page.getByTestId('consult-summary')).toContainText(email);
  expect(page.url()).not.toContain(email);
  const stored = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(stored).not.toContain(email);
  expect(stored).not.toContain(name);
  expect(requests.join('\n')).not.toContain(email);
  expect(requests.join('\n')).not.toContain(name);
  expect(consoleMessages.join('\n')).not.toContain(email);
  expect(consoleMessages.join('\n')).not.toContain(name);
  expect(requests.filter((request) => /^(POST|PUT|PATCH) /.test(request))).toEqual([]);
  await page.reload();
  await expect(page.getByLabel('이메일', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('이름 또는 별칭', { exact: true })).toHaveValue('');
});

test('올바른 이메일을 입력하기 전에는 상담 초안을 보여주지 않는다', async ({ page }) => {
  await openSample(page);
  await page.getByTestId('sample-to-consult').click();
  await fillConsult(page, { email: 'not-an-email' });
  await page.getByTestId('consult-preview-button').click();
  await expect(page.getByTestId('consult-summary')).not.toBeVisible();
  expect(await page.getByLabel('이메일', { exact: true }).evaluate((input) => input.validity.typeMismatch)).toBe(true);
});

test('키보드로 선택하고 샘플로 이동하면 제목에 초점이 옮겨진다', async ({ page }) => {
  await page.goto('/#direction');
  for (const [field, value] of [['target', 'mother'], ['birthEra', 'unknown'], ['topic', 'unknown']]) {
    await radio(page, field, value).focus();
    await page.keyboard.press('Space');
    await expect(radio(page, field, value)).toBeChecked();
  }
  await page.getByTestId('direction-submit').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#sample$/);
  await expect(page.getByTestId('sample-heading')).toBeFocused();
});

test('본문 건너뛰기가 현재 단계를 유지하고 본문으로 초점을 옮긴다', async ({ page }) => {
  await openSample(page);
  for (const route of ['direction', 'sample']) {
    await page.goto(`/#${route}`);
    await page.getByRole('link', { name: '본문으로 건너뛰기' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`#${route}$`));
    await expect(page.locator('#main')).toBeFocused();
    await expect(page.locator(`[data-page="${route}"]`)).toBeVisible();
  }
});

test('좁은 모바일과 태블릿에서도 네 화면이 가로로 넘치지 않는다', async ({ page }) => {
  await openSample(page);
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['home', 'direction', 'sample', 'consult']) {
      await page.goto(`/#${route}`);
      await expect(page.locator(`[data-page="${route}"]`)).toBeVisible();
      await expectNoOverflow(page);
    }
  }
});

test('동작 줄이기를 따르고 기기의 다크 설정에서도 읽기 쉬운 밝은 테마를 유지한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.goto('/');
  const lightBackground = await page.locator('body').evaluate((body) => getComputedStyle(body).backgroundColor);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('body')).toHaveCSS('background-color', lightBackground);
  await expect(page.locator('body')).toHaveCSS('color-scheme', 'light');
  await expect(page.locator('.hero-copy')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.story-scene')).toHaveCSS('animation-name', 'none');
});
