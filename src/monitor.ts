import { StatusBarItem, StatusBarAlignment, window } from 'vscode';
import metrics from './metrics';

class Monitor {
    private _statusBarItem: StatusBarItem;
    private _updating: boolean;

    constructor() {
        this._updating = false;
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 1);
        this._statusBarItem.show();
    }

    public async update() {
        if (this._updating) {
            return;
        }
        this._updating = true;
        const { text, tooltip } = await metrics();
        this._statusBarItem.text = text;
        this._statusBarItem.tooltip = tooltip;
        this._updating = false;
    }

    public async StopUpdating() {
        this._updating = false;
    }

    public async StartUpdating() {
        this._updating = true;
        this.update();
    }

    dispose() {
        this.StopUpdating();
        this._statusBarItem.dispose();
    }
}

export default Monitor;