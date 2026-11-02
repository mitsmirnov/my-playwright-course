import { Page, Locator } from '@playwright/test';
import { LoginPage } from './LoginPage'; // New: Required for Fluent Interface
// NOTE: No internal application pages (like UsersPage) are imported here!

export class DashboardPage {
  // 1. PROPERTIES: Elements we actually need to interact with or verify
  private page: Page;
  private branchHeader: Locator;
  private welcomeProfile: Locator;
  private dashboardNav: Locator;
  private usersNav: Locator;
  private customersNav: Locator;
  private loansNav: Locator;
  private logoutButton: Locator;

  // 2. CONSTRUCTOR: Wiring up only our targeted elements
  constructor(page: Page) {
    this.page = page;

    // Headings & Text for Verification
    this.branchHeader = page.getByRole('heading', { name: "SmartBank Dashboard - 'Lancaster' branch" });
    this.welcomeProfile = page.getByText('Welcome admin');

    // Navigation Links (Left Menu) - Customers removed for student practice!
    this.dashboardNav = page.getByRole('link', { name: 'Dashboard' });
    this.usersNav = page.getByRole('link', { name: 'Users' });
    this.customersNav = page.getByRole('link', { name: 'Customers' });
    this.loansNav = page.getByRole('link', { name: 'Loans' });

    // Buttons
    this.logoutButton = page.getByRole('button', { name: 'Log out' });
  }

  // 3. METHODS: The exact actions our test script needs to perform

  // Navigation click actions
  async goToDashboard() {
    await this.dashboardNav.click();
  }

  //async goToUsers() {
  //  await this.usersNav.click();
  //}

  async goToUsers() {
    await this.usersNav.click({ noWaitAfter: true });
    await this.page.waitForURL(/\/users/);
}

  // async goToCustomers() {
  //  await this.customersNav.click();
  //}

  async goToCustomers() {
    await this.customersNav.click({ noWaitAfter: true });
    await this.page.waitForURL(/\/customers/);
}

  async goToLoans() {
    await this.loansNav.click();
  }

  // Logout action
  async clickLogout(): Promise<LoginPage> {
    await this.logoutButton.click();

    // Instantiate and return the login page object, passing the live browser context 
    return new LoginPage(this.page); // New: Required for Fluent Interface
  }

  // Data Providers: Handing elements to the test file for validation scanners (expect)
  async getBranchHeader() {
    return this.branchHeader;
  }

  async getWelcomeProfile() {
    return this.welcomeProfile;
  }
}

