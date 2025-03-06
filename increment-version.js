const fs = require('fs');
const path = require('path');

function incrementMinorVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  const newMinor = minor + 1;
  return `${major}.${newMinor}.${patch}`;
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
}

main();