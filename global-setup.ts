import { FullConfig, chromium } from "@playwright/test";
import { removeFilesInDirectory, cleanDirectory } from "@utils/functions/file";
import fs from "fs";
import path from "path";
import { initConfig } from "./config.init";
import axios from "axios";

export const projects = async (config: any) => {
  const projectArg = process.argv.find((arg) => arg.includes("project")) || '';
  const projectName = projectArg.split("=")[1];
};


/**
 * Disable Pi-hole for 20 minutes if Pi-hole configuration is available
 * Note: Pi-hole API expects the disable duration in seconds (1200 = 20 minutes)
 */
async function disablePiHole() {
  if (process.env.pi_hole_api && process.env.pi_hole_service) {
    console.log('Pi-hole configuration found. Disabling Pi-hole for 20 minutes...');

    try {
      const piHoleService = process.env.pi_hole_service;
      const piHoleApi = process.env.pi_hole_api;
      const disableUrl = `http://${piHoleService}/admin/api.php?disable=1200&auth=${piHoleApi}`;

      const response = await axios.get(disableUrl);

      if (response.data && response.data.status === 'disabled') {
        console.log('Pi-hole successfully disabled for 20 minutes');
      } else {
        console.error('Failed to disable Pi-hole:', response.data);
      }
    } catch (error) {
      console.error('Error disabling Pi-hole:', error);
    }
  } else {
    console.log('No Pi-hole configuration found. Skipping Pi-hole disable.');
  }
}

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


const globalSetup = async (config: FullConfig) => {
  // Initialize configuration to ensure environment variables are set
  const appName = process.env.APP_NAME || 'hyva';
  //console.log(`Initializing configuration for app: ${appName}`);
  initConfig(appName);

  // Disable Pi-hole if configuration is available
  await disablePiHole();

  // Set up browser
  const browser = await chromium.launch();
  await browser.close();

  // Clean up test results directory for a fresh start, but preserve report directories
  const testResultsDir = path.join(process.cwd(), "tests/m2-hyva-playwright/test-results");
  if (fs.existsSync(testResultsDir)) {
    console.log('Cleaning up test results directory for a fresh start (preserving reports)...');
    try {
      // Get all items in the test results directory
      const items = fs.readdirSync(testResultsDir);

      for (const item of items) {
        const itemPath = path.join(testResultsDir, item);
        const stats = fs.statSync(itemPath);

        // Skip directories that contain "reports" in their name
        if (stats.isDirectory() && item.includes('-reports')) {
          console.log(`Preserving reports directory: ${item}`);
          continue;
        }

        // Clean other directories and files
        if (stats.isDirectory()) {
          await cleanDirectory(itemPath);
          fs.rmdirSync(itemPath);
        } else {
          fs.unlinkSync(itemPath);
        }
      }

      console.log('Successfully cleaned test results directory (preserved reports)');
    } catch (error) {
      console.error('Failed to clean test results directory:', error);
    }
  }

  // Use the tests directory for reports
  const reportPath = path.join(
    process.cwd(),
    "test-results",
    "pps",
    `${process.env.APP_NAME || 'default'}-${process.env.TEST_BASE || 'default'}-reports`
  );

  !fs.existsSync(reportPath) && fs.mkdirSync(reportPath, { recursive: true });
  process.env.REPORT_PATH = reportPath;

};

export default globalSetup;
