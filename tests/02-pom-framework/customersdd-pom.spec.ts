// Import the core testing functions and assertion utilities from the Playwright Test runner library
import { test, expect } from '@playwright/test';

// Import our custom Page Object classes so the script knows how to interact with LoanApp UI
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { CustomersPage } from '../../pages/CustomersPage';
import { CustomerFormPage } from '../../pages/CustomerFormPage';

test.describe('SmartBank Application - Customer Management Workflows', () => {

    // 1. Define the arrays matching distinct customer input variables and Page Object buttons
    const customerTitles = ['Mr.', 'Mrs.', 'Miss', 'Ms.', 'Dr.'];
    const actionButtons = ['Save', 'Save & Add another', 'Cancel'];

    // 2. Outer Loop: Controls the Customer Title
    for (const title of customerTitles) {
        // 3. Inner Loop: Controls form buttons
        for (const buttonAction of actionButtons) {

            // Dynamically name the test case based on the parameters
            test(`Should handle workflow for Title: "${title}" using Button: "${buttonAction}" @regression`, async ({ page }) => {

                // ========================================================
                // INITIALIZE ALL PAGE OBJECT BLUEPRINTS
                // ========================================================
                const loginPage = new LoginPage(page);
                const dashboardPage = new DashboardPage(page);
                const customersPage = new CustomersPage(page);
                const customerFormPage = new CustomerFormPage(page);

                // 1. Generate a 7-digit random number
                const uniqueId = Math.floor(1000000 + Math.random() * 9000000);

                const newCustomerDetails = {
                    account: `${uniqueId}`,
                    title: title,
                    firstName: 'Dayana',
                    lastName: 'Brook',
                    street: '123 Empire Ave',
                    city: 'Woodstock',
                    province: 'Ontario',
                    postalcode: 'K1A 2A3',
                    phone: '4161234567',
                    email: 'dbrook@mail.com'
                };

                // ========================================================
                // STEP 1: Sign In and Navigate to Dashboard Page
                // ========================================================
                await loginPage.navigateTo();
                await loginPage.enterCredentials('Lancaster', 'admin', 'dsmirnov0819');
                await loginPage.clickSignIn();

                // Use your clean DashboardPage data providers
                const welcomeAdminProfile = await dashboardPage.getWelcomeProfile();
                const branchHeader = await dashboardPage.getBranchHeader();

                await expect(welcomeAdminProfile).toContainText('Welcome admin');
                await expect(branchHeader).toBeVisible();

                // ========================================================
                // STEP 2: Navigate to Customers Page
                // ========================================================

                // Click on the 'Customers' link in the side menu on Dashboard 
                // REMINDER: THIS GLOBAL SIDEBAR NAVIGATION METHOD IS NEUTRAL AND RETURNS VOID TO PREVENT CIRCULAR IMPORTS.
                await dashboardPage.goToCustomers();

                // Get Customers page header
                // NO INLINE DECLARATION NEEDED HERE! BECAUSE WE KEPT customersPage AT THE TOP, 
                // WE CAN REUSE IT SEAMLESSLY NOW THAT THE BROWSER IS ON THE CUSTOMERS SCREEN.
                const customersPageHeading = await customersPage.getCustomersHeader();
                await expect(customersPageHeading).toBeVisible();

                // This configures the grid to show all rows before starting form submission actions
                await customersPage.showAllRows();

                // ========================================================
                // STEP 3: Navigate to Add Customer Page
                // ========================================================

                // Explicitly use CustomersPage action to click the button
                await customersPage.clickAddCustomer();

                // Fetch the heading locator for Add Customer Page
                const formHeader = await customerFormPage.getPageHeader();

                // STEP 3 NAVIGATION ASSERTION: Verify the Add Customer window loaded by asserting the presence of the header "Add Customer"
                await expect(formHeader).toBeVisible();

                // ========================================================
                // DATA POPULATION & DYNAMIC FORM ACTION ROUTING
                // ========================================================
                // Run encapsulated workflows depending on the parameters loop
                if (buttonAction === 'Save') {
                    await customerFormPage.createCustomerAndSave(newCustomerDetails);

                } else if (buttonAction === 'Save & Add another') {
                    await customerFormPage.createCustomerAndAddAnother(newCustomerDetails);

                } else if (buttonAction === 'Cancel') {
                    await customerFormPage.createCustomerAndCancel(newCustomerDetails);
                }

                // ========================================================
                // CONDITIONAL ASSERTIONS BASED ON ACTIONS
                // ========================================================
                if (buttonAction === 'Save') {
                    // Redirected back to Customers grid automatically -> check table cell record
                    const newAccountLink = page.getByRole('link', { name: newCustomerDetails.account, exact: true });
                    await expect(newAccountLink).toBeVisible();

                } else if (buttonAction === 'Save & Add another') {
                    // Stays on 'Add Customer' page with fields cleared -> check visibility and blank values
                    await expect(formHeader).toBeVisible();
                    await expect(page.getByLabel('Account #:*')).toHaveValue('');

                    // Navigate to Customers page
                    await dashboardPage.goToCustomers();
                    const verifiedAccountLink = page.getByRole('link', { name: newCustomerDetails.account, exact: true });
                    await expect(verifiedAccountLink).toBeVisible();

                } else if (buttonAction === 'Cancel') {
                    // Bailed back to main table grid -> check table to make sure it is completely missing
                    await expect(customersPageHeading).toBeVisible();
                    const newAccountLink = page.getByRole('link', { name: newCustomerDetails.account, exact: true });
                    await expect(newAccountLink).not.toBeVisible();
                }

                // ========================================================
                // TEARDOWN AND CLEANUP
                // ========================================================
                // Ensure state is normalized before clicking log out
                await dashboardPage.goToDashboard();
                await expect(branchHeader).toBeVisible();

                await dashboardPage.clickLogout();
                await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

                // ======================================================== 
                // ⏳ ANTI-BRUTE FORCE PACING DELAY 
                // ======================================================== 

                // Pause for 3 seconds to let the SmartBank application firewall cool down 
                // before the next parallel or iterative loop attempts another login. 
                await page.waitForTimeout(3000);

            });

        }
    }

});