import path from "path";

export const initConfig = (appName: string) => {
    const configFile = path.join(
        __dirname,
        "src",
        "apps",
        appName,
        "config.json"
    );
    let jsonData = require(configFile);
    process.env.skipBaseTests = jsonData.skipBaseTests;
    process.env.mailcatcher = jsonData.mailcatcher;

    (() => {
        switch (process.env.NODE_ENV) {
            case "live":
                process.env.URL = jsonData.env.live.url;
                break;

            case "dev":
                process.env.URL = jsonData.env.dev.url;
                break;

            case "uat":
                process.env.URL = jsonData.env.uat.url;
                break;

            default:
                break;
        }
    })();
};
