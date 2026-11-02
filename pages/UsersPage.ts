// Import the necessary building blocks (types) from the Playwright testing framework
import { Page, Locator } from '@playwright/test';
import { UserFormPage } from './UserFormPage'; // New: Required for Fluent Interface


// Define and export our blueprint class so our test files can use it
export class UsersPage {
  
  // ==========================================
  // 1. PROPERTIES (The Blueprint Dimensions)
  // ==========================================
  
  // Holds the reference to the active browser window/tab instance
  private page: Page;
  
  // Declares the variable for the main page header text element
  private usersHeader: Locator;
  
  // Declares the variable for the blue "Add User" action button
  private addUserButton: Locator;

  // Declares the variable for the pagination selection dropdown menu
  private paginationDropdown: Locator;

  // ==========================================
  // 2. CONSTRUCTOR (The Electrical Wiring)
  // ==========================================
  
  // Runs automatically the moment a test script creates a 'new UsersPage(page)' instance
  constructor(page: Page) {
    
    // Saves the active browser window to our internal property for future actions
    this.page = page;

    // Locates the specific text heading on the page to confirm we are in the right room (match only headings that BEGIN with 'Users')
    this.usersHeader = page.getByRole('heading', { name: /^Users/ });

    // Locates the physical "Add User" link using its role and text label
    this.addUserButton = page.getByRole('link', { name: 'Add User' });

    // Locates the pagination dropdown menu exactly as captured by the recorder's accessibility label
    this.paginationDropdown = page.getByLabel('Per page 5 10 25 50 All');
  }

  // ==========================================
  // 3. METHODS (The Homeowner Actions)
  // ==========================================

  // Click the Add User button  
  async clickAddUser(): Promise<UserFormPage> {  
  // Command the browser to wait for and click our pre-wired "Add User" button  
  await this.addUserButton.click();  

  // Instantiate and return the new page object, passing the live browser context 
  return new UserFormPage(this.page); // New: Required for Fluent Interface
}

  // A data provider method that hands the header element back to the main test script
  async getUsersHeader() {
    
    // Returns the raw locator block so the test script can verify its visibility on screen
    return this.usersHeader;
  }

  // An action method that forces the table display settings to reveal all record rows
  async showAllRows() {
    // Check if the dropdown is visible on the screen before trying to interact with it
    if (await this.paginationDropdown.isVisible()) {
      // Selects the option using its technical lowercase value attribute captured during recording
      await this.paginationDropdown.selectOption('all');
    } else {
      // Log a message to the console for easier debugging if it's skipped
      console.log('Pagination dropdown not visible (Empty state table). Skipping "Show All" configuration.');
    }
  }

  // An action method that safely locates a user row by username and clicks its edit link
  async clickEditUserLink(username: string) {
    // 1. Target the specific row containing the unique username text
    const targetRow = this.page.getByRole('row', { name: username });

    // 2. Search strictly within that isolated row to find its specific delete button, then click it
    await targetRow.getByRole('link', { name: 'Edit' }).click();

  }

  // An action method that safely locates a user row by username and clicks its delete button
  async deleteUser(username: string) {
    // 1. Target the specific row containing the unique username text
    const targetRow = this.page.getByRole('row', { name: username });

    // 2. Search strictly within that isolated row to find its specific delete button, then click it
    await targetRow.getByRole('button', { name: 'Delete' }).click();

    // 3. Confirm the action in the delete confirmation message
    await this.page.getByRole('button', { name: 'Yes, delete it' }).click(); 
  
    // 4. This is a good practice
    await this.page.getByRole('status').filter({ hasText: 'Deleted' }).waitFor({ state: 'visible', timeout: 10000 }); 

  }

}