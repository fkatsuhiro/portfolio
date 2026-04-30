import { test, expect } from '@playwright/test';

test.describe('Portfolio Pages Integrity', () => {
  test('Index page renders correctly', async ({ page }) => {
    // Using relative paths to respect the baseURL configured in playwright.config.ts
    await page.goto('.');
    
    await expect(page.locator('h1')).toContainText('Furuichi Katsuhiro');
    await expect(page.getByText('Frontend Developer')).toBeVisible();
    
    // Verify that the navigation links are present
    await expect(page.getByRole('link', { name: /About/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Works/i })).toBeVisible();
  });

  test('About page renders correctly', async ({ page }) => {
    await page.goto('./about');
    
    await expect(page.locator('h4')).toHaveText('Furuichi Katsuhiro');
    await expect(page.getByText('Webフロントエンドに興味があります。')).toBeVisible();
    await expect(page.getByText('東京大学大学院 工学系研究科バイオエンジニアリング専攻')).toBeVisible();
  });

  test('Works page renders correctly', async ({ page }) => {
    await page.goto('./works');
    
    await expect(page.locator('h1')).toHaveText('Works');
    await expect(page.getByText('My products and contributions.')).toBeVisible();
  });

  test('Talks page renders correctly', async ({ page }) => {
    await page.goto('./talks');
    
    await expect(page.getByText('TSKaigi Hokuriku 2025')).first().toBeVisible();
  });

  test('Blogs page renders correctly', async ({ page }) => {
    await page.goto('./blogs');
    
    await expect(page.getByText('SessionStorage を活用してトースト表示を制御する')).toBeVisible();
  });
});