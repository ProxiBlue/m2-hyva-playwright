import fs, { PathLike } from "fs";
import * as fsPromises from "fs/promises";

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
