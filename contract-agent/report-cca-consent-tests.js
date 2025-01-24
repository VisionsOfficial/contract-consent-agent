const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const testDir = './src/tests';
const testFiles = fs.readdirSync(testDir).filter(file => file.match(/consent\..+\.spec\.ts$/));

(async () => {
  const consentDir = 'mochawesome-report/consent';
  if (fs.existsSync(consentDir)) {
    fs.rmSync(consentDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(consentDir, { recursive: true });

  for (const file of testFiles) {
    console.log(`Running test: ${file}`);
    await new Promise((resolve, reject) => {
      exec(`npx ts-mocha -p tsconfig.json ${path.join(testDir, file)} --timeout 4000 --reporter mochawesome --reporter-options reportDir=mochawesome-report/consent,reportFilename=${file} --exit`, (err, stdout, stderr) => {
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
    exec(`npx mochawesome-merge "mochawesome-report/consent/*.json" -o mochawesome-report/consent/mochawesome.json`, async (err) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      
      exec(`npx mochawesome-report-generator mochawesome-report/consent/mochawesome.json -o mochawesome-report/consent -f report`, (err) => {
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
