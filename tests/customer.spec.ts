import { test, expect } from '@playwright/test';

// // Go up one folder, then look inside the functions folder 
import { loginToLoanApp, logout, fillAddCustomerFields } from '../functions/authFunctions';

// Define an array of test data set  
const testCases = [ 
  { account: '1234567', firstName: 'Good', lastName: 'Will', title: 'Mr.' },
  { account: '2345678', firstName: 'June', lastName: 'Smith', title: 'Mrs.' }, 
  { account: '3456790', firstName: 'Johanna', lastName: 'Carpenter', title: 'Miss' }, 
  { account: '4567901', firstName: 'Linda', lastName: 'Johnson', title: 'Ms.' }, 
  { account: '5679012', firstName: 'Olga', lastName: 'Steveston', title: 'Dr.' }
];

// Loop through each data set to generate parameterized tests dynamically 
testCases.forEach(({ account, firstName, lastName, title }) => {

test(`Add Customer valid input - Title: ${title}`, async ({ page }) => {

// Call the reusable login function 
await loginToLoanApp(page, 'Lancaster', 'admin', 'dsmirnov0819');

// Click Customers link
await page.getByRole('link', { name: 'Customers' }).click();
// Click Add Customer button
await page.getByRole('link', { name: 'Add Customer' }).click();

// // Call the resusable fillAddCustomerFields function
fillAddCustomerFields(page, account, firstName, lastName, title)

// Verify that a new customer created
await expect(page.locator('tbody')).toContainText(account);

// Click to Dashboard link
await page.getByRole('link', { name: 'Dashboard' }).click();
// Call the reusable logout function 
await logout(page);
    });
});

testCases.forEach(({ account, title }) => {

test(`Delete customer workflow - Title: ${title}`, async ({ page }) => {

//Call the reusable login function
await loginToLoanApp(page, 'Lancaster', 'admin', 'dsmirnov0819');

// Click Customers link
await page.getByRole('link', { name: 'Customers' }).click();

// Click the Delete button in the customer's row
await page.getByRole('row', { name: account }).getByRole('button', { name:'Delete'}).click();

// Confirm the deleteion
await page.getByRole('button', { name: 'Yes, delete it' }).click();

// Verify that the link matching the deleted customer's account is no longer in the Customers table
await expect(page.getByRole('link', { name: account })).not.toBeVisible();

// Click to Dashboard link
await page.getByRole('link', { name: 'Dashboard' }).click();
// Call the reusable logout function 
await logout(page);

    });
});