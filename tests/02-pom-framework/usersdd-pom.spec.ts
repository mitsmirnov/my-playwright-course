// Import the core testing functions and assertion utilities from the Playwright Test runner library
import { test, expect } from '@playwright/test';

// Import our custom Page Object classes so the script knows how to interact with the UI
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { UsersPage } from '../../pages/UsersPage';
import { UserFormPage } from '../../pages/UserFormPage';

test.describe('SmartBank Application - User Management Workflows', () => {

  // 1. Define the arrays matching your exact roles values and Page Object buttons
  const userRoles = ['Branch Admin', 'Loan Officer', 'Loan Manager'];
  const actionButtons = ['Save', 'Save & Add another', 'Cancel'];

  // 2. Outer Loop: Controls the User Roles
  for (const role of userRoles) {
    // 3. Inner Loop: Controls form buttons
    for (const buttonAction of actionButtons) {

      // Dynamically name the test case based on the parameters
      test(`Should handle workflow for Role: "${role}" using Button: "${buttonAction}" @regression`, async ({ page }) => {

        // ========================================================
        // INITIALIZE ALL PAGE OBJECT BLUEPRINTS
        // ========================================================
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const usersPage = new UsersPage(page);
        const userFormPage = new UserFormPage(page);

        // Sanitize strings to avoid username and data collisions across parallel runs 
        // 1. Get the first 3 letters of the role (e.g., "Loan Manager" -> "Loa")
        const shortRole = role.substring(0, 3);

        // 2. Generate a 4-digit random number (e.g., 7842)
        const uniqueId = Math.floor(1000 + Math.random() * 9000);

        const newUserDetails = {
          username: `tester_${shortRole}_${uniqueId}`, // to keep it no longer thatn 16 char
          password: 'SecurePassword123!',
          firstName: 'Alex',
          lastName: 'Smith',
          company: 'Hitek QA Solutions',
          phone: '(605)555-0199',
          email: `alex.${uniqueId}@example.com`,
          role: role
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
        // STEP 2: Navigate to Users Page & Verify Room Entry
        // ========================================================
        // Explicitly use DashboardPage action to jump screens
        await dashboardPage.goToUsers();

        // Explicitly use UsersPage provider to verify heading
        const usersPageHeading = await usersPage.getUsersHeader();
        await expect(usersPageHeading).toBeVisible();

        // 👇 INSERT THE NEW PAGINATION METHOD HERE 👇
        // This configures the grid to show all rows before starting form submission actions
        await usersPage.showAllRows();

        // ========================================================
        // STEP 3: Click Add User and Verify Form Entry
        // ========================================================
        // Explicitly use UsersPage action to click the button
        await usersPage.clickAddUser();

        // Explicitly use userFormPage provider to scan form header
        const formHeader = await userFormPage.getPageHeader();
        await expect(formHeader).toBeVisible();

        // ========================================================
        // DATA POPULATION & DYNAMIC FORM ACTION ROUTING
        // ========================================================
        // Run encapsulated workflows depending on the parameters loop
        if (buttonAction === 'Save') {
          await userFormPage.createUserAndSave(newUserDetails);

        } else if (buttonAction === 'Save & Add another') {
          await userFormPage.createUserAndAddAnother(newUserDetails);

        } else if (buttonAction === 'Cancel') {
          await userFormPage.createUserAndCancel(newUserDetails);
        }

        // ========================================================
        // CONDITIONAL ASSERTIONS BASED ON ACTIONS
        // ========================================================
        if (buttonAction === 'Save') {
          // Redirected back to Users grid automatically -> check table cell record
          const newUsernameLink = page.getByRole('link', { name: newUserDetails.username, exact: true });
          await expect(newUsernameLink).toBeVisible();

        } else if (buttonAction === 'Save & Add another') {
          // Stays on 'Add User' page with fields cleared -> check visibility and blank values
          await expect(formHeader).toBeVisible();
          await expect(page.getByLabel('Username*')).toHaveValue('');

          // Navigate to Users page
          await dashboardPage.goToUsers();
          const verifiedUsernameLink = page.getByRole('link', { name: newUserDetails.username, exact: true });
          await expect(verifiedUsernameLink).toBeVisible();

        } else if (buttonAction === 'Cancel') {
          // Bailed back to main table grid -> check table to make sure it is completely missing
          await expect(usersPageHeading).toBeVisible();
          const newUsernameLink = page.getByRole('link', { name: newUserDetails.username, exact: true });
          await expect(newUsernameLink).not.toBeVisible();
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