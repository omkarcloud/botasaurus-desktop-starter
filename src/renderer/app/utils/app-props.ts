export const appProps = {
    "header_title": "Botasaurus",
    "description": "Build Awesome Scrapers with Botasaurus, The All in One Scraping Framework.",
    "right_header": {
        "text": "Love It? Star It! ★",
        "link": "https://github.com/omkarcloud/botasaurus"
    },
    "readme": "<p align=\"center\">\n  <img src=\"https://raw.githubusercontent.com/omkarcloud/botasaurus/master/images/mascot.png\" alt=\"botasaurus\" />\n</p>\n  <div align=\"center\" style=\"margin-top: 0;\">\n  <h1>✨ Official Starter Template for Botasaurus Desktop Application✨</h1>\n</div>\n<em>\n  <h5 align=\"center\">(Programming Language - TypeScript)</h5>\n</em>\n<p align=\"center\">\n  <a href=\"#\">\n    <img alt=\"botasaurus-desktop-starter forks\" src=\"https://img.shields.io/github/forks/omkarcloud/botasaurus-desktop-starter?style=for-the-badge\" />\n  </a>\n  <a href=\"#\">\n    <img alt=\"Repo stars\" src=\"https://img.shields.io/github/stars/omkarcloud/botasaurus-desktop-starter?style=for-the-badge&color=yellow\" />\n  </a>\n  <a href=\"#\">\n    <img alt=\"botasaurus-desktop-starter License\" src=\"https://img.shields.io/github/license/omkarcloud/botasaurus-desktop-starter?color=orange&style=for-the-badge\" />\n  </a>\n  <a href=\"https://github.com/omkarcloud/botasaurus-desktop-starter/issues\">\n    <img alt=\"issues\" src=\"https://img.shields.io/github/issues/omkarcloud/botasaurus-desktop-starter?color=purple&style=for-the-badge\" />\n  </a>\n</p>\n<p align=\"center\">\n  <img src=\"https://views.whatilearened.today/views/github/omkarcloud/botasaurus-desktop-starter.svg\" width=\"80px\" height=\"28px\" alt=\"View\" />\n</p>\n\n# Botasaurus Desktop Starter\nThis is a starter template for building **Botasaurus Desktop Applications**\n\n\n## 🚀 Project Setup\n\nTo run locally, follow these steps:  \n\n1️⃣ Clone the Magic 🧙‍♀️:\n   ```bash\n   git clone https://github.com/omkarcloud/botasaurus-desktop-starter my-botasaurus-desktop-app\n   cd my-botasaurus-desktop-app\n   ```\n\n2️⃣ Install Packages 📦:\n   ```bash\n   npm install\n   ```\n\n3️⃣ Launch the App 🚀:\n   ```bash\n   npm run dev\n   ```\n\nThis will launch your **Botasaurus** desktop application in development mode.  \n\n## 💡 Learn to Develop Scraping Apps\n\nTo understand how to develop desktop apps using **Botasaurus**, please refer to the [Botasaurus Desktop Documentation](https://github.com/omkarcloud/botasaurus/blob/master/botasaurus-desktop-tutorial.md).\n\n## 📦 Create Installers for Your OS\n\nTo create an installer for your operating system, run the following command:\n```bash\nnpm run package\n```\n\nAfter executing the command, you can find the installer for your OS in the `release/build` folder.\n\n![Screenshot of release/build folder with OS-specific installer](https://raw.githubusercontent.com/omkarcloud/botasaurus/master/images/installer-build-folder.png)\n\n**Note**  \nOn Windows, if you face the \"resource busy or locked\" error:\n\n![Resource Busy](https://raw.githubusercontent.com/omkarcloud/botasaurus/master/images/resource-busy.png)  \n\nPlease follow these steps to resolve the issue:\n1. Run the Command Prompt as an administrator.\n2. Use the 'cd' command to navigate to your project directory.\n3. Run the command `npm run package` again to create the installer.\n\nThis will resolve the error and allow the installer to be created successfully.\n\n## 📦 Creating Installers for All Operating Systems (Recommended Method)\n\nTo automatically create installers for all operating systems whenever you push changes to GitHub, you can set up GitHub Actions. For step-by-step instructions, please follow the guide [here](https://github.com/omkarcloud/botasaurus/blob/master/botasaurus-desktop-tutorial.md#how-do-i-create-installers-for-multiple-platforms). \n\nThis is the recommended method for creating installers.",
    "enable_cache": false,
    "scrapers": [
        {
            "name": "Scrape Heading Task",
            "scraper_name": "scrapeHeadingTask",
            "route_path": "scrape-heading-task",
            "input_js": "/**\n * @typedef {import('botasaurus-controls').Controls} Controls\n * @typedef {import('botasaurus-controls').FileTypes} FileTypes\n * \n */\n\n/**\n * @param {Controls} controls\n */\nfunction getInput(controls) {\n    controls\n        // Render a Link Input\n        .link('link', { isRequired: true, defaultValue: \"https://stackoverflow.blog/open-source\" })\n}\n",
            "input_js_hash": "69fc72f1db61af05ec70a6f385e8591a",
            "filters": [],
            "sorts": [
                {
                    "id": "no_sort",
                    "label": "No Sort"
                }
            ],
            "views": [],
            "default_sort": "no_sort",
            "max_runs": 1
        }
    ]
}