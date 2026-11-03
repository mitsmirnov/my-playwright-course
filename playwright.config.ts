import { defineConfig, devices } from '@playwright/test';

/* ========================================================================== */
/* 🏢 CENTRALIZED FRAMEWORK VARIABLES                                         */
/* ========================================================================== */
/**
 * BUILD_NUMBER: Change this version variable when a new build is deployed to QA.
 * Centralizing this at the top of your configuration prevents you from having to
 * manually hunt down and change URLs across dozens of different individual test files.
 */
const BUILD_NUMBER = '3108';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

/**
 * Playwright Configuration File: Local Timing & Execution Control Blueprint
 * This file serves as the basis for Chapter 13.3, establishing the core timing 
 * properties required to run stable automation suites locally.
 */
export default defineConfig({

  /* ========================================================================== */
  /* 1. STRUCTURAL & DIRECTORY MANAGEMENT                                       */
  /* ========================================================================== */

  /**
   * testDir: Maps the primary location where Playwright scans for test files.
   * Enforces code organization by separating test scripts from Page Objects.
   */
  testDir: './tests',

  /* Run tests in files in parallel across available local CPU cores */
  fullyParallel: true,

  /**
   * forbidOnly: Fails the build if 'test.only' is accidentally left in code.
   * On CI, this ensures developers don't accidentally skip the entire suite.
   */
  forbidOnly: !!process.env.CI,

  /* ========================================================================== */
  /* 2. TIMING, TIMEOUTS, AND RETRIES (CORE CHAPTER 13.3)                       */
  /* ========================================================================== */

  /**
   * timeout: The Global Test Timeout (The Outer Box).
   * Sets the absolute maximum limit for an entire single test block (in milliseconds).
   * If exceeded, the test runner triggers a hard kill switch.
   */
  timeout: 30000, // 30 seconds

  /**
   * retries: Aggressive retry tracking.
   * If on CI, retry 2 times to filter out cloud network drops.
   * If running locally, retry only 1 time for rapid debugging.
   */
  retries: process.env.CI ? 2 : 1,

  /**
   * workers: Concurrency and memory bottleneck management.
   * If on CI, force a single worker (1) to prevent Out-Of-Memory server crashes.
   * If running locally, use 'undefined' to exploit all computer CPU cores.
   */
  workers: process.env.CI ? 1 : undefined,

  /* ========================================================================== */
  /* 3. ASSERTION LEVEL TIMEOUTS                                                */
  /* ========================================================================== */
  expect: {
    /**
     * timeout: Expect Assertion Timeout.
     * The maximum time a Web-First Assertion (e.g., expect(locator).toBeVisible())
     * will poll the DOM before throwing an error. Uses intelligent micro-polling.
     */
    timeout: 5000, // 5 seconds (Default value, explicitly declared for student clarity)
  },

  /* Reporter to use. Generates a local interactive browser dashboard. */
  reporter: 'html',

  /* ========================================================================== */
  /* 4. ACTION & INTERACTION TIMEOUTS                                           */
  /* ========================================================================== */

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* 🗺️ DYNAMIC baseURL MAPPING:
      Using backticks (``) allows us to inject the BUILD_NUMBER variable dynamically.
      This will seamlessly resolve to 'https://qa.hitekschool.com/lms/3108/'. */
    baseURL: `https://qa.hitekschool.com/lms/${BUILD_NUMBER}/`,

    /**
     * actionTimeout: Maximum time allowed for individual explicit browser steps.
     * Examples: await page.click(), await page.fill(), await page.hover().
     * If an element is blocked or slow to render, the step waits up to this limit.
     */
    actionTimeout: 10000, // 10 seconds (Upgraded from the default '0' no-limit boundary)

    /**
     * navigationTimeout: Maximum time allowed for explicit page loading events.
     * Examples: await page.goto(), await page.waitForURL().
     */
    navigationTimeout: 15000, // 15 seconds

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
