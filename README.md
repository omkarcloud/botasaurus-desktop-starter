<p align="center">
  <img src="https://raw.githubusercontent.com/omkarcloud/botasaurus/master/images/mascot.png" alt="botasaurus" />
</p>
  <div align="center" style="margin-top: 0;">
  <h1>✨ Official Starter Template for Botasaurus Desktop Application✨</h1>
</div>
<em>
  <h5 align="center">(Programming Language - TypeScript)</h5>
</em>
<p align="center">
  <a href="#">
    <img alt="botasaurus-desktop-starter forks" src="https://img.shields.io/github/forks/omkarcloud/botasaurus-desktop-starter?style=for-the-badge" />
  </a>
  <a href="#">
    <img alt="Repo stars" src="https://img.shields.io/github/stars/omkarcloud/botasaurus-desktop-starter?style=for-the-badge&color=yellow" />
  </a>
  <a href="#">
    <img alt="botasaurus-desktop-starter License" src="https://img.shields.io/github/license/omkarcloud/botasaurus-desktop-starter?color=orange&style=for-the-badge" />
  </a>
  <a href="https://github.com/omkarcloud/botasaurus-desktop-starter/issues">
    <img alt="issues" src="https://img.shields.io/github/issues/omkarcloud/botasaurus-desktop-starter?color=purple&style=for-the-badge" />
  </a>
</p>
<p align="center">
  <img src="https://views.whatilearened.today/views/github/omkarcloud/botasaurus-desktop-starter.svg" width="80px" height="28px" alt="View" />
</p>

# Botasaurus Desktop Starter
This is a starter template for building **Botasaurus Desktop Applications**


## 🚀 Project Setup

To run locally, follow these steps:  

1️⃣ Clone the Magic 🧙‍♀️:
   ```bash
   git clone https://github.com/omkarcloud/botasaurus-desktop-starter my-botasaurus-desktop-app
   cd my-botasaurus-desktop-app
   ```

2️⃣ Install Packages 📦:
   ```bash
   npm install
   ```

3️⃣ Launch the App 🚀:
   ```bash
   npm run dev
   ```

This will launch your **Botasaurus** desktop application in development mode.  

## 💡 Learn to Develop Scraping Apps

To understand how to develop desktop apps using **Botasaurus**, please refer to the [Botasaurus Desktop Documentation](https://github.com/omkarcloud/botasaurus/blob/master/botasaurus-desktop-tutorial.md).

## 📦 Create Installers for Your OS

To create an installer for your operating system, run the following command:
```bash
npm run package
```

After executing the command, you can find the installer for your OS in the `release/build` folder.

![Screenshot of release/build folder with OS-specific installer](https://raw.githubusercontent.com/omkarcloud/botasaurus/master/images/installer-build-folder.png)

**Note**  
On Windows, if you face the "resource busy or locked" error:

![Resource Busy](https://raw.githubusercontent.com/omkarcloud/botasaurus/master/images/resource-busy.png)  

Please follow these steps to resolve the issue:
1. Run the Command Prompt as an administrator.
2. Use the 'cd' command to navigate to your project directory.
3. Run the command `npm run package` again to create the installer.

This will resolve the error and allow the installer to be created successfully.

## 📦 Creating Installers for All Operating Systems (Recommended Method)

To automatically create installers for all operating systems whenever you push changes to GitHub, you can set up GitHub Actions. For step-by-step instructions, please follow the guide [here](https://github.com/omkarcloud/botasaurus/blob/master/botasaurus-desktop-tutorial.md#how-do-i-create-installers-for-multiple-platforms). 

This is the recommended method for creating installers.