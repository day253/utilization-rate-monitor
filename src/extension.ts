// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import metrics from './metrics';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "utilization-rate-monitor" is now active!');
    let utilizationrate = new UtilizationRate();
    try {
        utilizationrate.start();
    } catch (e) {
        console.log(e);
    }
    context.subscriptions.push(utilizationrate);
    const disposable = vscode.commands.registerCommand('utilization-rate-monitor.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Utilization Rate Monitor!');
    });
    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

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
            const { text, tooltip } = await metrics();
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