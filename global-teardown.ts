import { removeFilesInDirectory } from "@utils/functions/file";
import fs from "fs";
import path from "path";

/**
 * Global teardown function that runs after all tests are complete
 * Cleans up any resources created during testing
 */
async function globalTeardown() {
  console.log('Running global teardown...');

  // Clean up adminauth.json files
  const authDir = path.join(__dirname, 'auth');

  if (fs.existsSync(authDir)) {
    console.log('Cleaning up adminauth.json files...');
    try {
      await removeFilesInDirectory(authDir);
      console.log('Successfully removed adminauth.json files');
    } catch (error) {
      console.error('Failed to remove adminauth.json files:', error);
    }
  } else {
    console.log('No auth directory found, skipping cleanup');
  }
}

export default globalTeardown;
