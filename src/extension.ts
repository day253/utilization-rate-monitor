// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as si from "systeminformation";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "utilization-rate-monitor" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('utilization-rate-monitor.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from Utilization Rate Monitor!');
    });

    context.subscriptions.push(disposable);

    let utilizationrate = new UtilizationRate();
    try {
        utilizationrate.start();
    } catch (e) {
        console.log(e);
    }

    context.subscriptions.push(utilizationrate);
}

// This method is called when your extension is deactivated
export function deactivate() { }

const digitChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

class UtilizationRate {
    private _statusBarItem: vscode.StatusBarItem | undefined;
    private _interval: NodeJS.Timeout | undefined;
    public lock: boolean;

    constructor() {
        this.lock = false;
        this._statusBarItem = undefined;
        this._interval = undefined;
    }

    public async update() {
        if (this.lock) {
            return;
        }
        try {
            this.lock = true;
            const { text, tooltip } = await this.information();
            if (this._statusBarItem) {
                this._statusBarItem.text = text;
                this._statusBarItem.tooltip = tooltip;
            }
            this.lock = false;
        } catch (e) {
            console.log(e);
            this.lock = false;
        }
    }

    public async information() {
        const gpus = await si.graphics();
        const levels_gpu = gpus.controllers.map(controller => controller.utilizationGpu);
        const levels_mem = gpus.controllers.map(controller => controller.utilizationMemory);

        const cpuData = await si.currentLoad();
        const cpuUsage = cpuData.currentLoad;

        const memData = await si.mem();
        const memUsage = (memData.used / memData.total) * 100;

        var chars = digitChars;
        var nlevel = chars.length - 1;
        var levelChars_gpu = levels_gpu.map(val => chars[Math.ceil((Number(val) / 100) * nlevel)]);
        var levelChars_mem = levels_mem.map(val => chars[Math.ceil((Number(val) / 100) * nlevel)]);
        let levels_zipped = levels_gpu.map((val, index) => [val, levels_mem[index]]);

        var text = `$(gpu-usage) ${levelChars_gpu.join(",")} | $(gpu-memory) ${levelChars_mem.join(",")} | CPU: ${cpuUsage.toFixed(1)}% | MEM: ${memUsage.toFixed(1)}%`;
        var tooltip = levels_zipped.map((val, index) => `GPU${index}: GPU-Usage: ${val[0]}%, GPU-Memory: ${val[1]}%`).join("\n");
        return { text, tooltip };
    }

    public async stop() {
        clearInterval(this._interval);
        if (this._statusBarItem) {
            this._statusBarItem.text = "";
            this._statusBarItem.tooltip = "";
            this._statusBarItem.dispose();
        }
    }

    public async start() {
        this._interval = setInterval(() => {
            this.update();
        }, 2000);
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        this._statusBarItem.show();
    }

    dispose() {
        this.stop();
    }
}