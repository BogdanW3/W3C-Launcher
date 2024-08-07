import {LauncherStrategy} from "@/update-handling/LauncherStrategy";
import logger from "@/logger";

const { exec, spawn } = window.require("child_process");
const fs = window.require("fs");
const { remote } = window.require("electron");

export class WindowsLauncher extends LauncherStrategy {
    turnOnLocalFiles(): void {
        exec("reg add \"HKEY_CURRENT_USER\\Software\\Blizzard Entertainment\\Warcraft III\" /v \"Allow Local Files\" /t REG_DWORD /d 1 /f", function(err: Error) {
            if (err) {
                logger.error(err);
            }
        });

        exec("reg add \"HKEY_CURRENT_USER\\Software\\Blizzard Entertainment\\Warcraft III Public Test\" /v \"Allow Local Files\" /t REG_DWORD /d 1 /f", function(err: Error) {
            if (err) {
                logger.error(err);
            }
        });
    }

    getDefaultPathWc3(): string {
        if (fs.existsSync("C:\\Program Files\\Warcraft III\\_retail_")) {
            return "C:\\Program Files\\Warcraft III\\_retail_";
        }
        if (fs.existsSync("C:\\Program Files (x86)\\Warcraft III\\_retail_")) {
            return "C:\\Program Files (x86)\\Warcraft III\\_retail_";
        }
        return "C:\\Program Files\\Warcraft III";
    }

    getDefaultBnetPath(): string {
        return "C:\\Program Files (x86)\\Battle.net";
    }

    getDefaultPathMap(): string {
        const documentPath = remote.app.getPath("documents");
        try {
            if (this.isTest && this.isBlizzardPTR && fs.existsSync(`${documentPath}\\Warcraft III Public Test`)
                && !fs.existsSync(`${documentPath}\\Warcraft III Public Test\\Maps`)) {
                fs.mkdirSync(`${documentPath}\\Warcraft III Public Test\\Maps`);
            } else if (fs.existsSync(`${documentPath}\\Warcraft III`)
                && !fs.existsSync(`${documentPath}\\Warcraft III\\Maps`)) {
                fs.mkdirSync(`${documentPath}\\Warcraft III\\Maps`);
            }
        } catch (e) {
            logger.error(e)
        }

        return this.isTest && this.isBlizzardPTR
            ? `${documentPath}\\Warcraft III Public Test\\Maps`
            : `${documentPath}\\Warcraft III\\Maps`;
    }

    getWar3PreferencesFile(): string {
        const documentPath = remote.app.getPath("documents");
        
        return this.isTest && this.isBlizzardPTR
            ? `${documentPath}\\Warcraft III Public Test\\War3Preferences.txt`
            : `${documentPath}\\Warcraft III\\War3Preferences.txt`;
    }

    getWar3HotkeyFile(): string {
        const documentPath = remote.app.getPath("documents");
        return this.isTest && this.isBlizzardPTR
            ? `${documentPath}\\Warcraft III Public Test\\CustomKeyBindings\\CustomKeys.txt`
            : `${documentPath}\\Warcraft III\\CustomKeyBindings\\CustomKeys.txt`;
    }

    startWc3Process(bnetPath: string): void {
        const bnetPathWithExe = `${bnetPath}\\${this.getDefaultBnetPathExecutable()}`;
        const ls = spawn(bnetPathWithExe, ['--exec="launch W3"'], {
            detached: true,
            windowsVerbatimArguments: true,
            stdio: 'ignore',
        });
        ls.unref();
    }

    getCopyCommand(from: string, to: string) {
        return `xcopy "${from}" "${to}" /E /I`
    }

    getDefaultBnetPathExecutable(): string {
        return "Battle.net.exe";
    }

    getDefaultWc3Executable(): string {
        return "Warcraft III Launcher.exe"
    }

    getBattleNetAgentPath(): string {
        const windowsDrive = this.getWindowsInstallDrive();
        return `${windowsDrive}:\\ProgramData\\Battle.net\\Agent`;
    }

    getBnetPathFromAgentLogs(): string {
        const bnetPath = this.getPathFromAgentLogs(/"([^'"]*:[^'"]*Battle.net.exe)"/);

        if (bnetPath) {
            return bnetPath.replace('\\Battle.net.exe', '');
        }
        return '';
    }

    getWc3PathFromAgentLogs(): string {
        const wc3Retail = this.getPathFromAgentLogs(/"([^'"]*:[^"']*_retail_[^"']*Warcraft III.exe)"/);

        if (wc3Retail) {
            return wc3Retail.replace('\\_retail_\\x86_64\\Warcraft III.exe', '');
        }

        const wc3NoRetail = this.getPathFromAgentLogs(/"([^'"]*:[^"']*Warcraft III.exe)"/);
        if (wc3NoRetail) {
            return wc3NoRetail.replace('\\x86_64\\Warcraft III.exe', '');
        }

        return '';
    }

    getWindowsInstallDrive() {
        const appData = remote.app.getPath("appData") as string;
        if (appData) {
            const indexOfColon = appData.indexOf(':');
            return appData.substring(0, indexOfColon);
        }

        return "C";
    }
}
