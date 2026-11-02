// Import the necessary building blocks (types) from the Playwright testing framework
import { Page, Locator } from '@playwright/test';
import { CustomerFormPage } from './CustomerFormPage';


// Define and export our blueprint class so our test files can use it
export class CustomersPage {

    // ==========================================
    // 1. PROPERTIES (The Blueprint Dimensions)
    // ==========================================

    // Holds the reference to the active browser window/tab instance
    private page: Page;

    // Declares the variable for the main page header text element
    private customersHeader: Locator;

    // Declares the variable for the blue "Add Customer" action button
    private addCustomerButton: Locator;

    // Declares the variable for the pagination selection dropdown menu
    private paginationDropdown: Locator;

    // ==========================================
    // 2. CONSTRUCTOR (The Electrical Wiring)
    // ==========================================

    // Runs automatically the moment a test script creates a 'new CustomersPage(page)' instance
    constructor(page: Page) {

        // Saves the active browser window to our internal property for future actions
        this.page = page;

        // Locates the specific text heading on the page to confirm we are in the right room (match only headings that BEGIN with 'Customers')
        this.customersHeader = page.getByRole('heading', { name: /^Customers/ });

        // Locates the physical "Add Customer" link using its role and text label
        this.addCustomerButton = page.getByRole('link', { name: 'Add Customer' });

        // Locates the pagination dropdown menu exactly as captured by the recorder's accessibility label
        this.paginationDropdown = page.getByLabel('Per page 5 10 25 50 All');
    }

    // ==========================================
    // 3. METHODS (The Homeowner Actions)
    // ==========================================

    // Click the Add Customer button  
    async clickAddCustomer(): Promise<CustomerFormPage> {
        // Command the browser to wait for and click our pre-wired "Add Customer" button  
        await this.addCustomerButton.click();

        // Instantiate and return the new page object, passing the live browser context 
        return new CustomerFormPage(this.page); // New: Required for Fluent Interface

    }

    // A data provider method that hands the header element back to the main test script
    async getCustomersHeader() {

        // Returns the raw locator block so the test script can verify its visibility on screen
        return this.customersHeader;
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

    // An action method that safely locates a customer row by account # and clicks its edit link
    async clickEditCustomerLink(account: string) {
        // 1. Target the specific row containing the unique account number
        const targetRow = this.page.getByRole('row', { name: account });

        // 2. Search strictly within that isolated row to find its specific delete button, then click it
        await targetRow.getByRole('link', { name: 'Edit' }).click();

    }

    // An action method that safely locates a customer row by account # and clicks its delete button
    async deleteCustomer(account: string) {
        // 1. Target the specific row containing the unique account number
        const targetRow = this.page.getByRole('row', { name: account });

        // 2. Search strictly within that isolated row to find its specific delete button, then click it
        await targetRow.getByRole('button', { name: 'Delete' }).click();

        // 3. Confirm the action in the delete confirmation message
        await this.page.getByRole('button', { name: 'Yes, delete it' }).click();

        // 4. This is a good practice
        await this.page.getByRole('status').filter({ hasText: 'Deleted' }).waitFor({ state: 'visible', timeout: 10000 });

    }

}