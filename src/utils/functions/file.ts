import fs, { PathLike } from "fs";
import * as fsPromises from "fs/promises";
import path from "path";

export const holdBeforeFileExists = async (filePath: any, timeout: number) => {
  timeout = timeout < 1000 ? 1000 : timeout;
  try {
    var nom = 0;
    return new Promise((resolve) => {
      var inter = setInterval(() => {
        nom = nom + 100;
        if (nom >= timeout) {
          clearInterval(inter);
          //maybe exists, but my time is up!
          resolve(false);
        }

        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
          clearInterval(inter);
          //clear timer, even though there's still plenty of time left
          resolve(true);
        }
      }, 100);
    });
  } catch (error) {
    return false;
  }
};

export const isFileUpdateComplete = async (
  filePath: PathLike,
  timeout: number
) => {
  const abortController = new AbortController();
  const { signal } = abortController;
  setTimeout(() => abortController.abort(), timeout);

  const watchEventAsyncIterator = fsPromises.watch(filePath, { signal });

  for await (const event of watchEventAsyncIterator) {
    console.log(
      `'${event.eventType}' watch event was raised for ${event.filename}`
    );
  }
};

export const removeFilesInDirectory = async (directory: string) => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
};

export const updateFile = async (
  jsonFilePath: string,
  key: string,
  value: string
) => {
  const jsonFile = require(jsonFilePath);
  jsonFile[key] = value;
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonFile, null, 2));
  } catch (err) {
    console.error(err);
  }
};

export const appendFile = async (jsonFilePath: string, obj: any) => {
  var data = fs.readFileSync(jsonFilePath);
  var json = JSON.parse(data.toString());
  json.push(obj);
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
};
