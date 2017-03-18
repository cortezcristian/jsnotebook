'use strict';
const electron = require('electron');
const {VM} = require('vm2');
const vm = new VM();
const ipcMain = require('electron').ipcMain;
const shell = require('electron').shell;


const app = electron.app;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 740,
		height: 600
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	// https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssendchannel-arg1-arg2-

	return win;
}

ipcMain.on('vm-run', (event, o) => {
	console.log("vm-run: ", o);
	//event.returnValue = 'pong';
	var result = vm.run(o.script);

	event.sender.send('vm-result', result);
	//event.sender.send('vm-result', vm.run(o.script));
});

ipcMain.on('element-clicked', (event, target) => {
	console.log('element-clicked:', target);
	//https://github.com/electron/electron/issues/1344
	shell.openExternal(target);
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});
