import fs from "fs";
import path from "path";
import axios from "axios";
import { execSync } from "child_process";

/**
 * Copy HTML reports from the app-specific location to the expected location
 */
async function copyHtmlReports() {
  console.log('Copying HTML reports to the expected location...');

  try {
    const appName = process.env.APP_NAME || 'hyva';
    const testBase = process.env.TEST_BASE || 'default';
    const reportDirName = `${appName}-${testBase}-reports`;

    // Source directory (where reports are actually generated)
    const sourceDir = path.join(
      process.cwd(),
      '../../../../../tests',
      reportDirName,
      'playwright-report'
    );

    // Destination directory (where reports should be - in the main test-results directory)
    const destDir = path.join(
      process.cwd(),
      '../../../test-results',
      'pps',
      reportDirName
    );

    // Create the destination directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Destination report directory
    const destReportDir = path.join(destDir, 'playwright-report');

    // Remove the destination report directory if it exists
    if (fs.existsSync(destReportDir)) {
      execSync(`rm -rf "${destReportDir}"`);
    }

    // Check if the source directory exists
    if (fs.existsSync(sourceDir)) {
      // Copy the reports from the source to the destination
      execSync(`cp -r "${sourceDir}" "${destDir}/"`);
      console.log(`Successfully copied HTML reports from ${sourceDir} to ${destDir}`);
    } else {
      console.log(`Source directory ${sourceDir} does not exist, skipping copy`);
    }
  } catch (error) {
    console.error('Failed to copy HTML reports:', error);
  }
}

/**
 * Enable Pi-hole if it was disabled and configuration is available
 */
async function enablePiHole() {
  if (process.env.pi_hole_api && process.env.pi_hole_service) {
    console.log('Pi-hole configuration found. Enabling Pi-hole...');

    try {
      const piHoleService = process.env.pi_hole_service;
      const piHoleApi = process.env.pi_hole_api;
      const enableUrl = `http://${piHoleService}/admin/api.php?enable&auth=${piHoleApi}`;

      const response = await axios.get(enableUrl);

      if (response.data && response.data.status === 'enabled') {
        console.log('Pi-hole successfully enabled');
      } else {
        console.error('Failed to enable Pi-hole:', response.data);
      }
    } catch (error) {
      console.error('Error enabling Pi-hole:', error);
    }
  } else {
    console.log('No Pi-hole configuration found. Skipping Pi-hole enable.');
  }
}

/**
 * Global teardown function that runs after all tests are complete
 * Cleans up any resources created during testing
 */
async function globalTeardown() {
  console.log('Running global teardown...');


  // Copy HTML reports to the expected location
  await copyHtmlReports();

  // Enable Pi-hole if it was disabled
  await enablePiHole();
}

export default globalTeardown;
