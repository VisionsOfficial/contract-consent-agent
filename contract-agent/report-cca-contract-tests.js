const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const testDir = './src/tests';
const testFiles = fs.readdirSync(testDir).filter(file => file.match(/contract\..+\.spec\.ts$/));

(async () => {
  const contractDir = 'mochawesome-report/contract';
  if (fs.existsSync(contractDir)) {
    fs.rmSync(contractDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(contractDir, { recursive: true });

  for (const file of testFiles) {
    console.log(`Running test: ${file}`);
    await new Promise((resolve, reject) => {
      exec(`npx ts-mocha -p tsconfig.json ${path.join(testDir, file)} --timeout 4000 --reporter mochawesome --reporter-options reportDir=mochawesome-report/contract,reportFilename=${file} --exit`, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error in ${file}:\n`, stderr);
          return reject(err);
        }
        console.log(stdout);
        resolve();
      });
    });
  }

  await new Promise((resolve, reject) => {
    exec(`npx mochawesome-merge "mochawesome-report/contract/*.json" -o mochawesome-report/contract/mochawesome.json`, async (err) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      
      exec(`npx mochawesome-report-generator mochawesome-report/contract/mochawesome.json -o mochawesome-report/contract -f report`, (err) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        resolve();
      });
    });
  });

  console.log('All tests completed and report generated.');
})();