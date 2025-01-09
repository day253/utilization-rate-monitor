import { ExtensionContext } from 'vscode';
import { powerShellRelease, powerShellStart } from "systeminformation";
import Monitor from './monitor';

let monitor: Monitor | null = null;
let interval: NodeJS.Timeout;

export function activate(ctx: ExtensionContext) {
    if (process.platform === "win32") {
        powerShellStart();
    }
    if (monitor) {
        monitor.dispose();
    }
    monitor = new Monitor();
    monitor.StartUpdating();
    interval = setInterval(async () => {
        if (monitor) {
            await monitor.update();
        }
    }, 2000);
}

export function deactivate() {
    if (process.platform === "win32") {
        powerShellRelease();
    }
    clearInterval(interval);
    if (monitor) {
        monitor.dispose();
        monitor = null;
    }
}