const fs = require('fs');
const path = require('path');

function incrementMinorVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  const newMinor = minor + 1;
  return `${major}.${newMinor}.${patch}`;
}
function updateVersionInFile(filePath, newVersion) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if ('version' in data) {
    data.version = newVersion;
  }

  if ('packages' in data && typeof data.packages === 'object') {
    for (const packageKey in data.packages) {
      const packageData = data.packages[packageKey];
      if (packageData && 'version' in packageData) {
        packageData.version = newVersion;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return true;
}
function main() {
  const packageJsonPath = './release/app/package.json';

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`File not found: ${packageJsonPath}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const hasVersion = 'version' in data;
  let newVersion;

  if (!hasVersion) {
    newVersion = '1.0.0';
  } else {
    const currentVersion = data.version;
    newVersion = incrementMinorVersion(currentVersion);
  }

  data.version = newVersion;

  fs.writeFileSync(packageJsonPath, JSON.stringify(data, null, 2));

  if (!hasVersion) {
    console.log(`Version incremented to ${newVersion}`);
  } else {
    console.log(`Version incremented from ${data.version} to ${newVersion}`);
  }
  const packageLockJsonPath = './release/app/package-lock.json';

  if (updateVersionInFile(packageLockJsonPath, newVersion)) {
    
  } else {
    console.log(`Failed to update package-lock.json`);
  }

}

main();