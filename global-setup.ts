import { FullConfig, chromium } from "@playwright/test";
import { removeFilesInDirectory } from "@utils/functions/file";
import fs from "fs";
import path from "path";
import { initConfig } from "./config.init";

export const projects = async (config: any) => {
  const projectArg = process.argv.find((arg) => arg.includes("project")) || '';
  const projectName = projectArg.split("=")[1];
};

/**
 * Joins URL parts correctly, avoiding double slashes
 * @param base The base URL (e.g., "https://example.com/")
 * @param path The path to append (e.g., "admin")
 * @returns A properly joined URL (e.g., "https://example.com/admin")
 */
function joinUrl(base: string, path: string): string {
  // Remove trailing slash from base if present
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Join with a single slash
  return `${cleanBase}/${cleanPath}`;
}

/**
 * Authenticate admin user and save storage state for a specific worker
 * This allows each worker to have its own authenticated session
 */
async function authenticateAdmin(workerId: number) {
  console.log(`Authenticating admin for worker ${workerId}`);

  // Launch browser
  const browser = await chromium.launch();

  // Create a new context with ignoreHTTPSErrors
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    recordVideo: {
      dir: path.join(__dirname, 'test-results', 'videos'),
      size: { width: 1280, height: 720 }
    }
  });

  // Create a new page
  const page = await context.newPage();

  // Create test-results directory if it doesn't exist
  const testResultsDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(testResultsDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Create videos directory if it doesn't exist
  const videosDir = path.join(testResultsDir, 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  // Get admin URL and credentials from environment variables or config files
  // First try to get from environment variables
  let adminUrl = process.env.url ? joinUrl(process.env.url, process.env.admin_path || 'admin') : null;
  let adminUser = process.env.admin_user;
  let adminPassword = process.env.admin_password;

  // Verify we have all required values
  if (!adminUrl || !adminUser || !adminPassword) {
    throw new Error('Missing admin credentials. Please set them in config.private.json files.');
  }

  try {
    // Navigate to admin page
    await page.goto(adminUrl);
    console.log(`Navigated to admin page for worker ${adminUrl}`);

    // Take a screenshot of the login page
    await page.screenshot({
      path: path.join(screenshotsDir, `admin-login-page-worker${workerId}.png`),
      fullPage: true
    });

    // Login
    await page.fill('#username', adminUser);
    await page.fill('#login', adminPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for login to complete
    await page.waitForSelector('.page-title');

    // Create auth directory if it doesn't exist
    let authDir = '/tmp/auth';
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Save storage state to a file specific to this worker
    const storageStatePath = path.join(authDir, `adminAuth${workerId}.json`);
    await context.storageState({ path: storageStatePath });

    console.log(`Saved admin auth state on for worker ${workerId} to ${storageStatePath}`);
  } catch (error) {
    console.error(`Admin login failed for worker ${workerId}:`, error);

    // Take a screenshot of the failed login attempt
    await page.screenshot({
      path: path.join(screenshotsDir, `admin-login-failed-worker${workerId}.png`),
      fullPage: true
    });

    // Log the current URL and HTML content for debugging
    console.error(`Current URL: ${page.url()}`);
    console.error(`Page HTML: ${await page.content()}`);

    // Rethrow the error to fail the setup
    throw error;
  } finally {
    // Close browser (this will also save the video)
    await browser.close();
  }

  return path.join('/tmp/auth', `adminAuth${workerId}.json`);
}

const globalSetup = async (config: FullConfig) => {
  // Initialize configuration to ensure environment variables are set
  const appName = process.env.APP_NAME || 'hyva';
  console.log(`Initializing configuration for app: ${appName}`);
  initConfig(appName);

  // Set up browser
  const browser = await chromium.launch();
  await browser.close();

  const reportPath = path.join(
    __dirname,
    "src",
    "apps",
    //@ts-ignore
    process.env.APP_NAME,
    "reports"
  );

  !fs.existsSync(reportPath) && fs.mkdirSync(reportPath, { recursive: true });
  process.env.REPORT_PATH = reportPath;

  // Get the number of workers from the config or environment
  const numWorkers = config.workers || 3;

  // Authenticate for each worker
  for (let i = 0; i < numWorkers; i++) {
    const authPath = await authenticateAdmin(i);
    // Store the auth path in an environment variable that can be accessed by the tests
    process.env[`ADMIN_AUTH_${i}`] = authPath;
  }
};

export default globalSetup;
