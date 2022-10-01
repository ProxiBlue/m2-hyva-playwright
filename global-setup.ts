import { FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";

export const projects = async (config: any) => {
  const projectArg = process.argv.find((arg) => arg.includes("project"));
  const projectName = projectArg.split("=")[1];
};

const globalSetup = async (config: FullConfig) => {
  const reportPath = path.join(
    __dirname,
    "src",
    "apps",
    process.env.APP_NAME,
    "reports"
  );

  !fs.existsSync(reportPath) && fs.mkdirSync(reportPath, { recursive: true });
  const fileName = path.join(reportPath, `playwright-report.zip`);
  process.env.REPORT_PATH = reportPath;
  fs.existsSync(fileName) && fs.unlinkSync(fileName);
  fs.existsSync(`./playwright-report.zip`) &&
    fs.unlinkSync(`./playwright-report.zip`);
};

export default globalSetup;
