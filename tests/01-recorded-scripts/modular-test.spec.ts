import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Navigate to the Login Application Area
  await page.goto('https://qa.hitekschool.com/lms/3108/login');
  // Locate Branch text box and enter branch name
  await page.getByLabel('Branch Name*').fill('Lancaster');

  await page.getByRole('textbox', { name: 'User Name*' }).fill('admin');
  await page.getByRole('textbox', { name: 'Password*' }).fill('dsmirnov0819');
   // Click Sign in button 
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Assertion to validate successful navigation to Dashboard page 
  await expect(page.getByRole('main')).toContainText('Welcome admin');

   // Click Logout button 
  await page.getByRole('button', { name: 'Log out' }).click();

  // Assertion to validate successful logout
  await expect(page.getByRole('heading')).toContainText('Sign in to your Branch account');
});