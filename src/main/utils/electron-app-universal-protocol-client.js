"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron = require("electron");
var os = require("os");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var child_process_1 = require("child_process");
var events_1 = require("events");
// var bindings = require("./bindings");
var electronAppUniversalProtocolClientStartupRequestUrl;
if (os.platform() === "darwin") {
    electron.app.once("open-url", function (_event, url) {
        electronAppUniversalProtocolClientStartupRequestUrl = url;
    });
}
var ElectronAppUniversalProtocolClient = /** @class */ (function (_super) {
    __extends(ElectronAppUniversalProtocolClient, _super);
    function ElectronAppUniversalProtocolClient() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isInitialized = false;
        return _this;
    }
    ElectronAppUniversalProtocolClient.prototype.initialize = function (_a) {
        var protocol = _a.protocol, mode = _a.mode;
        return __awaiter(this, void 0, void 0, function () {
            var electronBundlePath, electronBundleInfoPlistFilePath, electronBundleInfoPlistOriginalFilePath, electronBundleInfoPlistContents, electronAppMainScriptPath, electronAppDesktopFileName, electronAppDesktopFilePath, mainInstanceRequestUrl;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isInitialized) {
                            throw new Error("ElectronAppUniversalProtocolClient is already initialized.");
                        }
                        return [4 /*yield*/, electron.app.whenReady()];
                    case 1:
                        _b.sent();
                        if (os.platform() === "darwin") {
                            if (mode === "development") {
                                electronBundlePath = path.resolve(process.execPath, "..", "..", "..");
                                electronBundleInfoPlistFilePath = path.resolve(electronBundlePath, "Contents", "Info.plist");
                                electronBundleInfoPlistOriginalFilePath = path.resolve(electronBundlePath, "Contents", "Info.plist.original");
                                electronBundleInfoPlistContents = void 0;
                                if (fs.existsSync(electronBundleInfoPlistOriginalFilePath)) {
                                    electronBundleInfoPlistContents = fs.readFileSync(electronBundleInfoPlistOriginalFilePath, "utf8");
                                }
                                else {
                                    electronBundleInfoPlistContents = fs.readFileSync(electronBundleInfoPlistFilePath, "utf8");
                                    fs.writeFileSync(electronBundleInfoPlistOriginalFilePath, electronBundleInfoPlistContents);
                                }
                                electronBundleInfoPlistContents = electronBundleInfoPlistContents.replace("com.github.Electron", "com.github.".concat(protocol));
                                electronBundleInfoPlistContents = electronBundleInfoPlistContents.replace(/<\/dict>\n<\/plist>/, [
                                    "    <key>CFBundleURLTypes</key>",
                                    "    <array>",
                                    "      <dict>",
                                    "        <key>CFBundleURLName</key>",
                                    "        <string>".concat(protocol, "</string>"),
                                    "        <key>CFBundleURLSchemes</key>",
                                    "        <array>",
                                    "          <string>".concat(protocol, "</string>"),
                                    "        </array>",
                                    "      </dict>",
                                    "    </array>",
                                    "  </dict>",
                                    "</plist>",
                                ].join("\n"));
                                fs.writeFileSync(electronBundleInfoPlistFilePath, electronBundleInfoPlistContents);
                                // bindings.setDevAppAsDefaultProtocolClient(electronBundlePath, protocol);
                            }
                            if (electronAppUniversalProtocolClientStartupRequestUrl !== undefined) {
                                if (electronAppUniversalProtocolClientStartupRequestUrl.startsWith(protocol)) {
                                    this.emit("request", electronAppUniversalProtocolClientStartupRequestUrl);
                                }
                            }
                            electron.app.setAsDefaultProtocolClient(protocol);
                            electron.app.on("open-url", function (_event, url) {
                                if (url.startsWith(protocol)) {
                                    _this.emit("request", url);
                                }
                            });
                            electron.app.on("open-file", function (_event, url) {
                                if (url.startsWith(protocol)) {
                                    _this.emit("request", url);
                                }
                            });
                        }
                        else {
                            if (mode === "development") {
                                electronAppMainScriptPath = path.resolve(process.argv[1]);
                                if (os.platform() === "linux") {
                                    // HACK: As `electron.app.setAsDefaultProtocolClient` is based on `xdg-settings set default-url-scheme-handler` which is not supported on Xfce, we manually create new .desktop entry and use `xdg-mime` to make it default handler for protocol URLs.
                                    try {
                                        electronAppDesktopFileName = "electron-app-universal-protocol-client-".concat(crypto.createHash("md5").update("".concat(process.execPath).concat(electronAppMainScriptPath)).digest("hex"), ".desktop");
                                        electronAppDesktopFilePath = path.resolve(electron.app.getPath("home"), ".local", "share", "applications", electronAppDesktopFileName);
                                        fs.mkdirSync(path.dirname(electronAppDesktopFilePath), {
                                            recursive: true,
                                        });
                                        fs.writeFileSync(electronAppDesktopFilePath, [
                                            "[Desktop Entry]",
                                            "Name=Electron (pid: ".concat(process.pid, ")"),
                                            "Exec=".concat(process.execPath, " ").concat(electronAppMainScriptPath, " %u"),
                                            "Type=Application",
                                            "Terminal=false",
                                            "MimeType=x-scheme-handler/".concat(protocol, ";")
                                        ].join("\n"));
                                        (0, child_process_1.execSync)("xdg-mime default ".concat(electronAppDesktopFileName, " x-scheme-handler/").concat(protocol));
                                    }
                                    catch (_c) {
                                        // ignore
                                    }
                                }
                                electron.app.setAsDefaultProtocolClient(protocol, process.execPath, [
                                    electronAppMainScriptPath,
                                ]);
                            }
                            else {
                                electron.app.setAsDefaultProtocolClient(protocol, process.execPath, []);
                            }
                        }
                        electron.app.on("second-instance", function (_event, argv) {
                            var secondInstanceRequestUrl = argv.find(function (arg) { return arg.startsWith("".concat(protocol)); });
                            if (secondInstanceRequestUrl !== undefined) {
                                _this.emit("request", secondInstanceRequestUrl);
                            }
                        });
                        mainInstanceRequestUrl = process.argv.find(function (arg) { return arg.startsWith("".concat(protocol)); });
                        if (mainInstanceRequestUrl !== undefined) {
                            this.emit("request", mainInstanceRequestUrl);
                        }
                        this.isInitialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    return ElectronAppUniversalProtocolClient;
}(events_1.EventEmitter));
exports.default = new ElectronAppUniversalProtocolClient();
