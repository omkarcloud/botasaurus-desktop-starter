const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = content
    .replace(/createdAt/g, 'created_at')
    .replace(/updatedAt/g, 'updated_at');
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Updated ${filePath}`);
};

const basePath = path.join('.', 'node_modules', '@seald-io','nedb');
const filesToModify = [
  path.join(basePath, 'browser-version', 'out', 'nedb.js'),
  path.join(basePath, 'browser-version', 'out', 'nedb.min.js'),
  path.join(basePath, 'lib', 'datastore.js')
];

filesToModify.forEach(filePath => {
  try {
    replaceInFile(filePath);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('File modifications completed.');