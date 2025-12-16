import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

/**
 * Extracts the last screenshot from a Playwright trace file
 * @param traceFilePath Path to the trace.zip file
 * @param outputDir Directory to save the extracted screenshot
 * @returns Path to the extracted screenshot or null if extraction failed
 */
export async function extractLastScreenshotFromTrace(
  traceFilePath: string,
  outputDir: string
): Promise<string | null> {
  try {
    if (!fs.existsSync(traceFilePath)) {
      console.log(`Trace file not found: ${traceFilePath}`);
      return null;
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Extract the trace zip file
    const zip = new AdmZip(traceFilePath);
    const tempDir = path.join(outputDir, 'temp_trace_extract');

    // Clean up temp directory if it exists
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    fs.mkdirSync(tempDir, { recursive: true });
    zip.extractAllTo(tempDir, true);

    // Look for the trace file (usually trace.json or similar)
    const traceJsonPath = path.join(tempDir, 'trace.json');
    if (!fs.existsSync(traceJsonPath)) {
      console.log(`Trace JSON not found in: ${tempDir}`);
      // Clean up
      fs.rmSync(tempDir, { recursive: true, force: true });
      return null;
    }

    // Read and parse the trace JSON
    const traceData = JSON.parse(fs.readFileSync(traceJsonPath, 'utf8'));

    // Find the last screenshot in the trace
    let lastScreenshotPath: string | null = null;
    let lastTimestamp = 0;

    // Look through actions to find screenshots
    if (traceData.actions && Array.isArray(traceData.actions)) {
      for (const action of traceData.actions) {
        if (action.beforeSnapshot && action.startTime > lastTimestamp) {
          lastScreenshotPath = action.beforeSnapshot;
          lastTimestamp = action.startTime;
        }
        if (action.afterSnapshot && action.startTime > lastTimestamp) {
          lastScreenshotPath = action.afterSnapshot;
          lastTimestamp = action.startTime;
        }
      }
    }

    // Also check for screenshots in the resources
    if (traceData.resources && Array.isArray(traceData.resources)) {
      for (const resource of traceData.resources) {
        if (resource.name && resource.name.includes('screenshot') && resource.name.endsWith('.png')) {
          const resourcePath = path.join(tempDir, resource.name);
          if (fs.existsSync(resourcePath)) {
            lastScreenshotPath = resource.name;
          }
        }
      }
    }

    if (!lastScreenshotPath) {
      console.log('No screenshots found in trace');
      // Clean up
      fs.rmSync(tempDir, { recursive: true, force: true });
      return null;
    }

    // Copy the last screenshot to the output directory
    const sourceScreenshotPath = path.join(tempDir, lastScreenshotPath);
    const outputScreenshotPath = path.join(outputDir, 'trace-last-screenshot.png');

    if (fs.existsSync(sourceScreenshotPath)) {
      fs.copyFileSync(sourceScreenshotPath, outputScreenshotPath);
      console.log(`Extracted last screenshot from trace: ${outputScreenshotPath}`);

      // Clean up temp directory
      fs.rmSync(tempDir, { recursive: true, force: true });

      return outputScreenshotPath;
    } else {
      console.log(`Screenshot file not found: ${sourceScreenshotPath}`);
      // Clean up
      fs.rmSync(tempDir, { recursive: true, force: true });
      return null;
    }

  } catch (error) {
    console.error('Error extracting screenshot from trace:', error);
    return null;
  }
}

/**
 * Alternative method using Playwright CLI to extract trace screenshots
 * @param traceFilePath Path to the trace.zip file
 * @param outputDir Directory to save the extracted screenshot
 * @returns Path to the extracted screenshot or null if extraction failed
 */
export async function extractLastScreenshotUsingCLI(
  traceFilePath: string,
  outputDir: string
): Promise<string | null> {
  try {
    if (!fs.existsSync(traceFilePath)) {
      console.log(`Trace file not found: ${traceFilePath}`);
      return null;
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'trace-last-screenshot.png');

    // Try to use Playwright CLI to show trace and extract screenshot
    // This is a more complex approach that would require additional tooling
    console.log(`Attempting to extract screenshot from trace: ${traceFilePath}`);

    // For now, we'll use the manual extraction method
    return await extractLastScreenshotFromTrace(traceFilePath, outputDir);

  } catch (error) {
    console.error('Error extracting screenshot using CLI:', error);
    return null;
  }
}
