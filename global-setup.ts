module.exports = async (config: any) => {
  const projectArg = process.argv.find((arg) => arg.includes("project"));
  const projectName = projectArg.split("=")[1];
};
