import path from "path";
import fs from "fs";

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
    process.env.currency_symbol = jsonData.currency_symbol;
    let privateData = require(privateConfigFile);
    process.env.admin_user = privateData.admin_user;
    process.env.admin_password = privateData.admin_password;
    process.env.admin_path = privateData.url;
    process.env.url = jsonData.url;
};
