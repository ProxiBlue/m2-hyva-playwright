import fs from "fs";
import path from "path";

/**
 * Load JSON data from a file, checking first in the APP_NAME directory and falling back to a default path
 * @param filename The name of the JSON file to load (e.g., 'orders.data.json')
 * @param appDir The directory name within apps where the file might be located (e.g., 'admin', 'hyva')
 * @param defaultData Default data to use if the file cannot be loaded
 * @returns The loaded JSON data or the default data if the file cannot be loaded
 */
export const loadJsonData = <T>(filename: string, appDir: string, defaultData: T): T => {
  try {
    // Use a more reliable way to resolve the path to the apps directory
    // First try to resolve from the current file's location
    const srcDir = path.resolve(__dirname, '../..');
    const appsBasePath = path.join(srcDir, 'apps');

    let dataPath;
    // Check if file exists in APP_NAME directory
    if (process.env.APP_NAME && fs.existsSync(path.join(appsBasePath, process.env.APP_NAME, 'data', filename))) {
      dataPath = path.join(appsBasePath, process.env.APP_NAME, 'data', filename);
    } else {
      // Fall back to the provided app directory
      dataPath = path.join(appsBasePath, appDir, 'data', filename);
    }

    // Read and parse the JSON file
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    const parsedData = JSON.parse(jsonData);

    return parsedData;
  } catch (error) {
    console.error(`Error loading ${filename}: ${error}`);
    return defaultData;
  }
};

/**
 * Recursively removes all files and directories within a directory
 * @param directory The directory to clean up
 * @returns A promise that resolves when all files and directories have been removed
 */
export const cleanDirectory = async (directory: string): Promise<void> => {
  if (!fs.existsSync(directory)) {
    return;
  }

  const items = fs.readdirSync(directory);

  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // Recursively clean subdirectory
      await cleanDirectory(itemPath);
      // Remove the now-empty directory
      fs.rmdirSync(itemPath);
    } else {
      // Remove file
      fs.unlinkSync(itemPath);
    }
  }
};

/**
 * Load locators module dynamically, always loading the base app locators first,
 * then overriding with APP_NAME locators if they exist
 * @param locatorPath The path to the locator file relative to the app directory (e.g., 'locators/cms.locator')
 * @param appDir The directory name within apps where the file might be located (e.g., 'admin', 'hyva')
 * @returns The loaded locators module with combined entries
 */
export const loadLocators = (locatorPath: string, appDir: string): any => {
  try {
    // Use a more reliable way to resolve the path to the apps directory
    // First try to resolve from the current file's location
    const srcDir = path.resolve(__dirname, '../..');
    const appsBasePath = path.join(srcDir, 'apps');

    // Always load the base app locators first
    const baseLocatorPath = path.join(appsBasePath, appDir, locatorPath);
    const baseModulePath = baseLocatorPath.replace(/\\/g, '/');

    // Load the base locators
    const baseLocators = require(baseModulePath);

    // Check if APP_NAME locators exist
    if (process.env.APP_NAME && fs.existsSync(path.join(appsBasePath, process.env.APP_NAME, locatorPath + '.ts'))) {
      // Load the APP_NAME locators
      const appLocatorPath = path.join(appsBasePath, process.env.APP_NAME, locatorPath);
      const appModulePath = appLocatorPath.replace(/\\/g, '/');
      const appLocators = require(appModulePath);

      // Merge the locators, with APP_NAME locators overriding base locators
      return { ...baseLocators, ...appLocators };
    }

    // If no APP_NAME locators exist, return just the base locators
    return baseLocators;
  } catch (error) {
    console.error(`Error loading locators from ${locatorPath}: ${error}`);
    return {};
  }
};
