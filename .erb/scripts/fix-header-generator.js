const fs = require('fs');
const path = require('path');

const find1 = `const utils_1 = require("./utils");`
const replacement1 = `const utils_1 = require("./utils");
const path = require('path');`
const find = `        this.headersOrder = JSON.parse((0, fs_1.readFileSync)(\`\$\{__dirname}/data_files/headers-order.json\`).toString());
        const uniqueBrowserStrings = JSON.parse((0, fs_1.readFileSync)(\`\$\{__dirname}/data_files/browser-helper-file.json\`, 'utf8').toString());
        for (const browserString of uniqueBrowserStrings) {
            // There are headers without user agents in the datasets we used to configure the generator. They should be disregarded.
            if (browserString !== constants_1.MISSING_VALUE_DATASET_TOKEN) {
                this.uniqueBrowsers.push(this.prepareHttpBrowserObject(browserString));
            }
        }
        this.inputGeneratorNetwork = new generative_bayesian_network_1.BayesianNetwork({ path: \`\$\{__dirname}/data_files/input-network-definition.zip\` });
        this.headerGeneratorNetwork = new generative_bayesian_network_1.BayesianNetwork({ path: \`\$\{__dirname}/data_files/header-network-definition.zip\` });`
const replacement = `
        function isRunningInErbDll() {
            const currentDir = __dirname;
            const dirName = path.basename(currentDir);
            const parentDir = path.basename(path.dirname(currentDir));
            
            return parentDir === '.erb' && dirName === 'dll';
        }

        const isDev=process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

        let doResolve = (ph)  => {
            if (isDev) {
                if (isRunningInErbDll()) {
                    return path.join(__dirname,  "../","../",'node_modules','header-generator','data_files', ph);
                } 
            }
                
            return path.join(__dirname, ph);              
        }        
        try {
            this.headersOrder = JSON.parse((0, fs_1.readFileSync)(doResolve('headers-order.json')).toString());
        } catch (error) {
            doResolve = (ph)  => {
                return path.join(__dirname,  'node_modules','header-generator','data_files', ph);           
            }        
            this.headersOrder = JSON.parse((0, fs_1.readFileSync)(doResolve('headers-order.json')).toString());
        }
        
        const uniqueBrowserStrings = JSON.parse((0, fs_1.readFileSync)(doResolve('browser-helper-file.json'), 'utf8').toString());
        for (const browserString of uniqueBrowserStrings) {
            // There are headers without user agents in the datasets we used to configure the generator. They should be disregarded.
            if (browserString !== constants_1.MISSING_VALUE_DATASET_TOKEN) {
                this.uniqueBrowsers.push(this.prepareHttpBrowserObject(browserString));
            }
        }
        this.inputGeneratorNetwork = new generative_bayesian_network_1.BayesianNetwork({ path: doResolve('input-network-definition.zip') });
        this.headerGeneratorNetwork = new generative_bayesian_network_1.BayesianNetwork({ path: doResolve('header-network-definition.zip') });            
`

function replaceAppWithSrc() {
    const dirPath = path.join('.', 'node_modules', 'header-generator');
    const filePath = path.join(dirPath, 'header-generator.js');

    if (!fs.existsSync(dirPath)) {
        console.log(`Directory ${dirPath} does not exist. Skipping replacement.`);
        return;
    }

    try {
        // Read the file synchronously
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace the specified content
        content = content.replace(find, replacement)
        if (!content.includes(`const path = require('path');`)) {
            content = content.replace(find1, replacement1);
        }

        // Write the modified content back to the file
        fs.writeFileSync(filePath, content, 'utf8');

        console.log('Successfully replaced');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Run the function
replaceAppWithSrc();