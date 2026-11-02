import { Page, Locator } from '@playwright/test'; // Removed 'expect' from here
import { DashboardPage } from './DashboardPage'; // New: Required for Fluent Interface

export class LoginPage {
  // 1. PROPERTIES: The class remembers the page context and ALL UI elements
  private page: Page;
  private branchInput: Locator;
  private userInput: Locator;
  private passwordInput: Locator;
  private signInButton: Locator;
  private welcomeBanner: Locator;

  // 2. CONSTRUCTOR: The electrical breaker box that hooks up the 'page' ONCE
  constructor(page: Page) {
    this.page = page; // Store the main power line internally
    
    // Wire up all the individual appliance lines (Locators)
    this.branchInput = page.getByLabel('Branch Name*');
    this.userInput = page.getByLabel('User Name*');
    this.passwordInput = page.getByLabel('Password*');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.welcomeBanner = page.getByRole('main');
  }

  // 3. METHODS: Pure actions and data providers only. No assertions!
  async navigateTo() {
    await this.page.goto('login'); // Note: No leading slash!
  }

  async enterCredentials(branch: string, user: string, pass: string) {
    await this.branchInput.fill(branch);
    await this.userInput.fill(user);
    await this.passwordInput.fill(pass);
  }

  async clickSignIn() {
    await this.signInButton.click();

     // Instantiate and return the next page object, passing the live browser context 
  return new DashboardPage(this.page); // New: Required for Fluent Interface
  }

  // This method simply hands the locator over to the test file when asked
  async getWelcomeBanner() {
    return this.welcomeBanner;
  }
}