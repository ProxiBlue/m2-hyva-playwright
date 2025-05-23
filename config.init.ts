import path from "path";
export const initConfig = (appName: string) => {
    const configFile = path.join(
        __dirname,
        "src",
        "apps",
        appName,
        "config.json"
    );
    const privateConfigFile = path.join(
        __dirname,
        "src",
        "apps",
        appName,
        "config.private.json"
    );
    let jsonData = require(configFile);
    process.env.skipBaseTests = jsonData.skipBaseTests;
    process.env.mailcatcher = jsonData.mailcatcher;
    process.env.faker_locale = jsonData.faker_locale;
    let privateData = require(privateConfigFile);
    process.env.admin_user = privateData.admin_user;
    process.env.admin_password = privateData.admin_password;
    process.env.admin_path = privateData.url;
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
