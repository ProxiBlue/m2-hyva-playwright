import { FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";

export const projects = async (config: any) => {
  const projectArg = process.argv.find((arg) => arg.includes("project"));
  const projectName = projectArg.split("=")[1];
};

const globalSetup = async (config: FullConfig) => {
  const fileName = path.join(__dirname, `html-report.zip`);
  fs.existsSync(fileName) && fs.unlinkSync(fileName);
  process.env.APP_NAME = "ui-testing-playground";
};

export default globalSetup;
