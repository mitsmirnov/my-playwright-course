// Import the core testing functions and assertion utilities from the Playwright Test runner library
import { test, expect } from '@playwright/test';

// Import our custom Page Object classes so the script knows how to interact with LoanApp UI
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { CustomersPage } from '../../pages/CustomersPage';
import { CustomerFormPage } from '../../pages/CustomerFormPage';

// Create a logical test suite block to group all LoanApp customer management test scenarios together
test.describe('SmartBank - Customer Management Workflows @smoke @regression', () => {

    // test.describe.configure({ mode: 'serial' });

    // Shared Login Data
    const branchName = 'Lancaster';
    const loginUser = 'admin';
    const loginPass = 'dsmirnov0819';

    // Customer Lifecycle Data
    const createdAccount = '1234567';
    const updatedAccount = '1234098';

    const newCustomerDetails = {
        account: createdAccount,
        title: 'Miss',
        firstName: 'Dayana',
        lastName: 'Brook',
        street: '123 Empire Ave',
        city: 'Woodstock',
        province: 'Ontario',
        postalcode: 'K1A 2A3',
        phone: '4161234567',
        email: 'dbrook@mail.com'
    };

    // Define the end-to-end test case for adding new customer
    test('Add Customer', async ({ page }) => {

        // ========================================================
        // 1. INITIALIZE PAGE OBJECT BLUEPRINTS
        // ========================================================

        // Instantiate the Login Page Object, passing the live browser 'page' instance into its constructor
        const loginPage = new LoginPage(page);

        // Instantiate the Customers Page Object to interact with the Customers list after navigating from the Dashboard
        const customersPage = new CustomersPage(page);

        // ========================================================
        // STEP 1: Sign In and Navigate to Dashboard Page
        // ========================================================

        // Use the LoginPage action method to direct the browser to the exact LoanApp login page URL
        await loginPage.navigateTo();

        // Fill out the login form 
        await loginPage.enterCredentials(branchName, loginUser, loginPass);

        // Click Sign In and capture the returned Dashboard Page Object
        const dashboardPage = await loginPage.clickSignIn();

        // Fetch the welcome profile element locator from the dashboard page object
        const welcomeAdminProfile = await dashboardPage.getWelcomeProfile();

        // Fetch the specific branch header locator instance from the dashboard page
        const branchHeader = await dashboardPage.getBranchHeader();

        // STEP 1 NAVIGATION ASSERTIONS: Verify the profile element contains the text string "Welcome admin" 
        await expect(welcomeAdminProfile).toContainText(`Welcome ${loginUser}`);

        // Verify the header "SmartBank Dashboard-'Lancaster' branch" is visible
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

        // Locate the blue "Add Customer" button and click it.
        // FLUENT HANDOFF: THE clickAddCustomer() METHOD DYNAMICALLY INSTANTIATES AND RETURNS THE NEXT PAGE BLUEPRINT.
        const customerFormPage = await customersPage.clickAddCustomer();

        // Fetch the heading locator for Add Customer Page
        const formHeader = await customerFormPage.getPageHeader();

        // STEP 3 NAVIGATION ASSERTION: Verify the Add Customer window loaded by asserting the presence of the header "Add Customer"
        await expect(formHeader).toBeVisible();

        // ========================================================
        // DATA CREATION: Populate Form and Submit Data
        // ========================================================

        // Call createCustomer method to populater all fields and click the 'Save' button
        await customerFormPage.createCustomerAndSave(newCustomerDetails);

        // Verify the temporary confirmation message 'Created' appears in the top-right corner
        await expect(page.getByRole('status')).toContainText('Created');


        // This configures the grid to show all rows before starting form submission actions
        await customersPage.showAllRows();

        // DYNAMIC LOCATOR DECLARATION: Create a link locator specifically matching the account # inside the table cell row
        const newAccountLink = page.getByRole('link', { name: newCustomerDetails.account, exact: true });

        // FORM ACTION ASSERTION (Part B): Confirm the just created customer exists by locating its fresh live link inside the grid
        await expect(newAccountLink).toBeVisible();

        // ========================================================
        // STEP 4: Navigate from Customers Page to Dashboard
        // ========================================================

        // Click the 'Dashboard' link in the sidebar menu 
        // REMINDER: THIS SIDEBAR LINK IS NEUTRAL AND RETURNS VOID TO PREVENT CIRCULAR IMPORTS. 
        await dashboardPage.goToDashboard();

        // REUSING CONTEXT: WE REUSE THE DYNAMIC dashboardPage VARIABLE WE CREATED IN STEP 1 
        // TO ACCESS THE MAIN WORKSPACE ELEMENTS WITHOUT HAVING TO RE-DECLARE ANYTHING INLINE.
        const currentBranchHeader = await dashboardPage.getBranchHeader();
        await expect(currentBranchHeader).toBeVisible();

        // ========================================================
        // STEP 5: Securely Log Out of the Session
        // ========================================================

        // FLUENT TERMINATION: WE REUSE OUR dashboardPage VARIABLE TO TARGET THE LOGOUT BUTTON.
        // CALLING THE FLUENT clickLogout() METHOD EXITS THE APP WORKSPACE AND RETURNS THE LoginPage
        const finalLoginPage = await dashboardPage.clickLogout();

        // FINAL ASSERTION: Prove session termination by confirming that we are back to Login screen.
        // We use a text search here to verify that the "Sign in" button is visible to the logged-out user.
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

        // Pause for 3 seconds to let the SmartBank application firewall cool down 
        // before the next parallel or iterative loop attempts another login. 
        await page.waitForTimeout(3000);

    });

    test('Edit Customer', async ({ page }) => {
        // Instantiate all your Page Objects with the active page context
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const customersPage = new CustomersPage(page);
        const customerFormPage = new CustomerFormPage(page);

        // 1. Navigate to the LoanApp login page
        await loginPage.navigateTo();

        // 2. Enter valid credentials and click the "Sign In" button
        // (Using placeholder data based on your dashboard class structure)
        await loginPage.enterCredentials(branchName, loginUser, loginPass);
        await loginPage.clickSignIn();

        // Verify successful login via your Dashboard components
        const welcomeProfile = await dashboardPage.getWelcomeProfile();
        await expect(welcomeProfile).toBeVisible();

        // 3. Navigate to the "Customers" section via the Dashboard side menu
        await dashboardPage.goToCustomers();

        // Verify we arrived safely on the Customers List page
        const customersHeader = await customersPage.getCustomersHeader();
        await expect(customersHeader).toBeVisible();

        // Configure the grid to show all rows (in case the target row is not on the first page)
        await customersPage.showAllRows();

        // 4. Click the "Edit" button associated with the specific customer
        // Since CustomersPage didn't have an explicit navigation method for editing a row, 
        // we safely target it using the unique account number within the active page. 
        await customersPage.clickEditCustomerLink(createdAccount);

        // Verify the dynamic header element from CustomerFormPage is visible
        const formHeader = await customerFormPage.getPageHeader();
        await expect(formHeader).toBeVisible();

        // 5. Modify the account # on the Edit Customer page and click "Save Changes"
        // Using the dedicated update method built into your CustomerFormPage class
        await customerFormPage.updateCustomerDetails({
            account: updatedAccount
        });

        // 6. Assert that the updated account # appears correctly in the Customers grid
        // Ensure the old account # string is gone and the updated account # row now shows
        const updatedRow = page.getByRole('row', { name: updatedAccount });
        await expect(updatedRow).toBeVisible();
        await expect(page.getByRole('row', { name: createdAccount, exact: true })).not.toBeVisible();

        // 7. Navigate back to the Dashboard
        await dashboardPage.goToDashboard();
        const branchHeader = await dashboardPage.getBranchHeader();
        await expect(branchHeader).toBeVisible();

        // 8. Click the "Log out" button to clear the session
        await dashboardPage.clickLogout();

        // Final Assertion: Verify the user was returned to the Login View
        const welcomeBanner = await loginPage.getWelcomeBanner();
        await expect(welcomeBanner).toBeVisible();

        // Pause for 3 seconds to let the SmartBank application firewall cool down 
        // before the next parallel or iterative loop attempts another login. 
        await page.waitForTimeout(3000);

    });

    // =========================================================================
    // 🚀 CLEANUP WORKFLOW: LOCATOR CHAINING DELETION
    // =========================================================================
    test('Delete Customer from the grid', async ({ page }) => {
        // Initialize the specialized Page Objects required for this scenario
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const customersPage = new CustomersPage(page);

        // Step 1: Handle authentication state entry
        await loginPage.navigateTo();
        await loginPage.enterCredentials(branchName, loginUser, loginPass);
        await loginPage.clickSignIn();

        // Extract the raw locator handle first so expect can watch it dynamically
        const welcomeProfile = await dashboardPage.getWelcomeProfile();
        await expect(welcomeProfile).toBeVisible();

        // Step 2: Route directly to the targeted customer workspace grid
        await dashboardPage.goToCustomers();

        // Verify the grid room is loaded securely via our header locator
        const customersHeader = await customersPage.getCustomersHeader();
        await expect(customersHeader).toBeVisible();

        // Step 3: Expand the data viewport to prevent record-hidden pagination bugs
        await customersPage.showAllRows();

        // Step 4: Execute our new method to locate and delete the customer
        await customersPage.deleteCustomer(updatedAccount);

        // Step 5: Framework Validation
        // Assert that the specific table row belonging to this customer is fully unmounted from the layout tree
        const deletedRow = page.getByRole('row', { name: updatedAccount });
        await expect(deletedRow).not.toBeVisible();

        // Final Housekeeping: Return to the dashboard and securely exit the session
        await dashboardPage.goToDashboard();
        await dashboardPage.clickLogout();
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    });

});
