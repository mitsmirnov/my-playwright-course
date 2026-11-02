import { test, expect } from '@playwright/test';

// Go up one folder, then look inside the functions folder 
import { loginToLoanApp, logout, fillAddUserFields } from '../../functions/authFunctions';

// Define an array of test data set 
const testCases = [ 
  { username: 'MaanagerUser1', password: 'password2', branchRole: 'manager' },
  { username: 'AdminUser2', password: 'securePass1', branchRole: 'admin' }, 
  { username: 'ClerkUser3', password: 'clerkPass9', branchRole: 'clerk' } 
];

// Loop through each data set to generate parameterized tests dynamically 
testCases.forEach(({ username, password, branchRole }) => {

test(`Add User valid input - Role: ${branchRole}`, async ({ page }) => { 

 
// Call the reusable login function 
await loginToLoanApp(page, 'Lancaster', 'admin', 'dsmirnov0819');

// Click the 'Users' link
await page.getByRole('link', { name: 'Users' }).click();
// Click the 'Add user' button
await page.getByRole('link', { name: 'Add User' }).click();

// Call the resusable fillAddUserFields function 
fillAddUserFields(page, username, password, branchRole);

// Validate that the new username appears in the Users table on Users page 
await expect(page.locator('tbody')).toContainText(username)

// Click the 'Dashboard' link
await page.getByRole('link', { name: 'Dashboard' }).click();

  // Call the reusable logout function 
  await logout(page); 

    });
});

testCases.forEach(({ username, branchRole }) => {

test(`Delete user workflow - Role: ${branchRole}`, async ({ page }) => {

//Call the reusable login function
await loginToLoanApp(page, 'Lancaster', 'admin', 'dsmirnov0819');

await page.getByRole('link', { name: 'Users' }).click();
await page.getByRole('link', { name: username }).click();
await page.getByRole('button', { name: 'Delete' }).click();
await page.getByRole('button', { name: 'Yes, delete it' }).click();

// Verify 'Deleted' message appears on the screen
await expect(page.getByRole('status')).toContainText('Deleted');

// Verify that the link matching the deleted user's username is no longer in the Users table
await expect(page.getByRole('link', { name: username })).not.toBeVisible();

await page.getByRole('link', { name: 'Dashboard' }).click();

// Call the reusable logout function
await logout(page);

    });
});