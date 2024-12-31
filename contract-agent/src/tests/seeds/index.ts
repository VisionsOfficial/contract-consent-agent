import fs from 'fs';
import { Logger } from 'Logger';
import path from 'path';

const seedDirectory: string = path.join(__dirname);

fs.readdirSync(seedDirectory)
  .filter((file: string) => file.endsWith('.seed.ts'))
  .forEach((file: string) => {
    import(path.join(seedDirectory, file))
      .then(() => {
        Logger.info(`Seed file ${file} executed successfully.`);
      })
      .catch((error: Error) => {
        Logger.error(`Error executing seed file ${file}: ${error.message}`);
      });
  });
