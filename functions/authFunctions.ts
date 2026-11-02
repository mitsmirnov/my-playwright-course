import { Page, expect } from '@playwright/test';

// --- REUSABLE LOGIN FUNCTION --
export async function loginToLoanApp(page: Page, branch: string, user: string, pass: string) {

  // Navigate to the Login Application Area
  await page.goto('https://qa.hitekschool.com/lms/3108/login');

  // Enter credentials 
  await page.getByLabel('Branch Name*').fill(branch);
  await page.getByRole('textbox', { name: 'User Name*' }).fill(user);
  await page.getByRole('textbox', { name: 'Password*' }).fill(pass);

   // Click Sign in button 
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Assertion to validate successful navigation to Dashboard page 
  await expect(page.getByRole('main')).toContainText(`Welcome ${user}`);
}

// --- REUSABLE LOGOUT FUNCTION --- 
export async function logout(page: Page) { 
  
 // Click Logout button 
  await page.getByRole('button', { name: 'Log out' }).click();

  // Assertion to validate successful logout
  await expect(page.getByRole('heading')).toContainText('Sign in to your Branch account');

}

// --- REUSABLE Fill Add User fields FUNCTION --- 
export async function fillAddUserFields (page: Page, username: string, password: string, branchRole: string) { 

// Enter the username
await page.getByLabel('Username*').fill(username);
// Enter the password
await page.getByLabel('Password*').fill(password);
// Select Loan Manager for Branch Drop Down List Box 
await page.getByLabel('Branch Role:*').selectOption(branchRole);

// Click the 'Save' button
await page.getByRole('button', { name: 'Save', exact: true }).click();

}

// --- REUSABLE Fill Add Customer fields FUNCTION --- 
export async function fillAddCustomerFields (page: Page, account: string, firstName: string, lastName: string, title: string) {

// Create a new customer with a title
await page.getByLabel('Account #:*').fill(account);
await page.getByLabel('First Name:*').fill(firstName);
await page.getByLabel('Last Name:*').fill(lastName);
await page.getByLabel('Title:').selectOption(title);
await page.getByRole('button', { name: 'Save', exact: true }).click();

}