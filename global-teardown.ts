import axios from "axios";


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

  // Enable Pi-hole if it was disabled
  await enablePiHole();
}

export default globalTeardown;
