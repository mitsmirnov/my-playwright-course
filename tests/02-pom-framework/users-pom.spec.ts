// Import the core testing functions and assertion utilities from the Playwright Test runner library
import { test, expect } from '@playwright/test';

// Import our custom Page Object classes so the script knows how to interact with LoanApp UI
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { UsersPage } from '../../pages/UsersPage';
import { UserFormPage } from '../../pages/UserFormPage';

// Create a logical test suite block to group all LoanApp user management test scenarios together
test.describe('SmartBank - User Management Workflows @smoke @regression', () => {
  // Every test inside this block now automatically inherits both tags!

  // test.describe.configure({ mode: 'serial' });

  // Shared Login Data
  const branchName = 'Lancaster';
  const loginUser = 'admin';
  const loginPass = 'dsmirnov0819';

  // User Lifecycle Data
  const createdUsername = 'tester_99';
  const updatedUsername = 'tester_100';

  const newUserDetails = {
    username: createdUsername, // Reuses our variable to keep things linked!
    password: 'SecurePass12',
    firstName: 'Alex',
    lastName: 'Smith',
    company: 'Hitek QA Solutions',
    phone: '(605)555-0199',
    email: 'alex.smith@example.com',
    role: 'Loan Officer'
  };

  // Define the end-to-end test case for adding new user
  test('Add User', async ({ page }) => {

    // ========================================================
    // 1. INITIALIZE PAGE OBJECT BLUEPRINTS
    // ========================================================

    // Instantiate the Login Page Object, passing the live browser 'page' instance into its constructor
    const loginPage = new LoginPage(page);

    // REMOVED FROM THE TOP: dashboardPage IS NO LONGER INSTANTIATED HERE. 
    // IT WILL BE BORN DYNAMICALLY AS A DIRECT RETURN VALUE FROM THE LOGIN METHOD.

    // KEPT AT THE TOP: WE INTENTIONALLY KEEP THE usersPage DECLARATION HERE!
    // SINCE SIDEBAR NAVIGATION LINKS ARE NEUTRAL (VOID), PRE-BUILDING THIS OBJECT 
    // AT THE TOP ALLOWS US TO USE IT IMMEDIATELY LATER WITHOUT INLINE CLUTTER.
    const usersPage = new UsersPage(page);

    // REMOVED FROM THE TOP: userFormPage IS NO LONGER INSTANTIATED HERE.
    // IT WILL BE GENERATED DYNAMICALLY WHEN WE CLICK THE "ADD USER" BUTTON.

    // ========================================================
    // STEP 1: Sign In and Navigate to Dashboard Page
    // ========================================================

    // Use the LoginPage action method to direct the browser to the exact LoanApp login page URL
    await loginPage.navigateTo();

    // Fill out the login form 
    await loginPage.enterCredentials(branchName, loginUser, loginPass);

    // CHANGED: CAPTURE THE RETURNED DashboardPage OBJECT HANDED OVER VIA THE FLUENT clickSignIn() METHOD.
    // WE DYNAMICALLY ASSIGN IT TO THE INITIAL VARIABLE 'dashboardPage' RIGHT HERE IN THE FLOW.
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
    // STEP 2: Navigate to Users Page
    // ========================================================

    // Click on the 'Users' link in the side menu on Dashboard 
    // REMINDER: THIS GLOBAL SIDEBAR NAVIGATION METHOD IS NEUTRAL AND RETURNS VOID TO PREVENT CIRCULAR IMPORTS.
    await dashboardPage.goToUsers();

    // Get Users page header
    // NO INLINE DECLARATION NEEDED HERE! BECAUSE WE KEPT usersPage AT THE TOP, 
    // WE CAN REUSE IT SEAMLESSLY NOW THAT THE BROWSER IS ON THE USERS SCREEN.
    const usersPageHeading = await usersPage.getUsersHeader();
    await expect(usersPageHeading).toBeVisible();

    // This configures the grid to show all rows before starting form submission actions
    await usersPage.showAllRows();

    // ========================================================
    // STEP 3: Navigate to Add User Page
    // ========================================================

    // Locate the blue "Add User" button and click it.
    // FLUENT HANDOFF: THE clickAddUser() METHOD DYNAMICALLY INSTANTIATES AND RETURNS THE NEXT PAGE BLUEPRINT.
    const userFormPage = await usersPage.clickAddUser();

    // Fetch the heading locator for Add User Page
    const formHeader = await userFormPage.getPageHeader();

    // STEP 3 NAVIGATION ASSERTION: Verify the Add User window loaded by asserting the presence of the header "Add User"
    await expect(formHeader).toBeVisible();

    // ========================================================
    // DATA CREATION: Populate Form and Submit Data
    // ========================================================

    // Call createUser method to populater all fields and click the 'Save' button
    await userFormPage.createUserAndSave(newUserDetails);

    // Verify the temporary confirmation message 'Created' appears in the top-right corner
    await expect(page.getByRole('status')).toContainText('Created');

    // 👇 INSERT THE NEW PAGINATION METHOD HERE 👇
    // This configures the grid to show all rows before starting form submission actions
    await usersPage.showAllRows();

    // DYNAMIC LOCATOR DECLARATION: Create a link locator specifically matching the username inside the table cell row
    const newUsernameLink = page.getByRole('link', { name: newUserDetails.username, exact: true });

    // FORM ACTION ASSERTION (Part B): Confirm the account (just created user) exists by locating its fresh live link inside the grid
    await expect(newUsernameLink).toBeVisible();

    // ========================================================
    // STEP 4: Navigate from Users Page to Dashboard
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

    // FINAL ASSERTION: Prove session termination by confirming that we are back to Logon screen.
    // We use a text search here to verify that the "Sign in" button is visible to the logged-out user.
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    // Pause for 3 seconds to let the SmartBank application firewall cool down 
    // before the next parallel or iterative loop attempts another login. 
    await page.waitForTimeout(3000);

  });



  test('Should edit the user', async ({ page }) => {
    // Instantiate all your Page Objects with the active page context
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const usersPage = new UsersPage(page);
    const userFormPage = new UserFormPage(page);

    // const oldUsername = 'tester_99';
    // const newUsername = 'tester_99_update';

    // 1. Navigate to the LoanApp login page
    await loginPage.navigateTo();

    // 2. Enter valid credentials and click the "Sign In" button
    // (Using placeholder data based on your dashboard class structure)
    await loginPage.enterCredentials(branchName, loginUser, loginPass);
    await loginPage.clickSignIn();

    // Verify successful login via your Dashboard components
    const welcomeProfile = await dashboardPage.getWelcomeProfile();
    await expect(welcomeProfile).toBeVisible();

    // 3. Navigate to the "Users" section via the Dashboard side menu
    await dashboardPage.goToUsers();

    // Verify we arrived safely on the Users List page
    const usersHeader = await usersPage.getUsersHeader();
    await expect(usersHeader).toBeVisible();

    // Configure the grid to show all rows (in case the target row is not on the first page)
    await usersPage.showAllRows();

    // 4. Click the "Edit" button associated with the specific user
    // Since UsersPage didn't have an explicit navigation method for editing a row, 
    // we safely target it using the unique username text context within the active page. 
    await usersPage.clickEditUserLink(createdUsername);

    // Verify the dynamic header element from UserFormPage is visible
    const formHeader = await userFormPage.getPageHeader();
    await expect(formHeader).toBeVisible();

    // 5. Modify the username on the Edit User page and click "Save Changes"
    // Using the dedicated update method built into your UserFormPage class
    await userFormPage.updateUserDetails({
      username: updatedUsername
    });

    // 6. Assert that the updated username appears correctly in the Users grid
    // Ensure the old username string is gone and the updated username row now shows
    const updatedRow = page.getByRole('row', { name: updatedUsername });
    await expect(updatedRow).toBeVisible();
    await expect(page.getByRole('row', { name: createdUsername, exact: true })).not.toBeVisible();

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
  test('Delete User from thegrid', async ({ page }) => {
    // Initialize the specialized Page Objects required for this scenario
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const usersPage = new UsersPage(page);

    // Provide the exact username target created during your previous data run
    // const targetUsername = 'tester_99_update';

    // Step 1: Handle authentication state entry
    await loginPage.navigateTo();
    await loginPage.enterCredentials(branchName, loginUser, loginPass);
    await loginPage.clickSignIn();

    // Extract the raw locator handle first so expect can watch it dynamically
    const welcomeProfile = await dashboardPage.getWelcomeProfile();
    await expect(welcomeProfile).toBeVisible();

    // Step 2: Route directly to the targeted user workspace grid
    await dashboardPage.goToUsers();

    // Verify the grid room is loaded securely via our header locator
    const usersHeader = await usersPage.getUsersHeader();
    await expect(usersHeader).toBeVisible();

    // Step 3: Expand the data viewport to prevent record-hidden pagination bugs
    await usersPage.showAllRows();

    // Step 4: Execute our new method to locate and delete the user
    await usersPage.deleteUser(updatedUsername);

    // Step 5: Framework Validation
    // Assert that the specific table row belonging to this user is fully unmounted from the layout tree
    const deletedRow = page.getByRole('row', { name: updatedUsername });
    await expect(deletedRow).not.toBeVisible();

    // Final Housekeeping: Return to the dashboard and securely exit the session
    await dashboardPage.goToDashboard();
    await dashboardPage.clickLogout();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

});