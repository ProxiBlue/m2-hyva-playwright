import { FullConfig } from "@playwright/test";
import { removeFilesInDirectory } from "@utils/functions/file";
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
    //@ts-ignore
    process.env.APP_NAME,
    "reports"
  );

  !fs.existsSync(reportPath) && fs.mkdirSync(reportPath, { recursive: true });
  process.env.REPORT_PATH = reportPath;
};

export default globalSetup;
