const fs = require('fs');
const path = require('path');

const find = `async function installAppIcon(page) {
  const icon = await _fs.default.promises.readFile(require.resolve('./chromium/appIcon.png'));
  const crPage = page._delegate;
  await crPage._mainFrameSession._client.send('Browser.setDockTile', {
    image: icon.toString('base64')
  });
}`
const replacement = `async function installAppIcon(page) {
  // const icon = await _fs.default.promises.readFile(require.resolve('./chromium/appIcon.png'));
  // const crPage = page._delegate;
  // await crPage._mainFrameSession._client.send('Browser.setDockTile', {
  //   image: icon.toString('base64')
  // });
}`

const find1 = `var bidiMapper = _interopRequireWildcard(require("chromium-bidi/lib/cjs/bidiMapper/BidiMapper"));
var bidiCdpConnection = _interopRequireWildcard(require("chromium-bidi/lib/cjs/cdp/CdpConnection"));
`
const replacement1 = `var bidiMapper = null;
var bidiCdpConnection =  null;
`

function replaceAppWithSrc() {
    const dirPath = path.join('.', 'node_modules', 'rebrowser-playwright-core');
    ;

    if (!fs.existsSync(dirPath)) {
        console.log(`Directory ${dirPath} does not exist. Skipping replacement.`);
        return;
    }

    try {
        // Read the file synchronously
        
        modifyContentAndWriteToFile(path.join(dirPath, 'lib', 'server', 'launchApp.js'), find, replacement)
        modifyContentAndWriteToFile(path.join(dirPath, 'lib', 'server', 'bidi','bidiOverCdp.js'), find1, replacement1)
        // node_modules/rebrowser-playwright-core/lib/server/bidi/bidiOverCdp.js
        // .replace(find1, replacement1);

        console.log('Successfully replaced');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Run the function
replaceAppWithSrc();

function modifyContentAndWriteToFile(filePath, find, replacement) {
try {
  
  let content = fs.readFileSync(filePath, 'utf8')

  // Replace all occurrences of "app" with "src"
  content = content.replace(find, replacement)

  // Write the modified content back to the file
  fs.writeFileSync(filePath, content, 'utf8')
} catch (error) {
  console.error(error)
}

}
