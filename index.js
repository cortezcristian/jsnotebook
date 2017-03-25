'use strict';
const electron = require('electron');
const {  VM } = require('vm2');
const vm = new VM();
const ipcMain = require('electron').ipcMain;
const shell = require('electron').shell;
const { dialog } = require('electron');
// https://github.com/szwacz/fs-jetpack
const gfs = require('graceful-fs');

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
    autoHideMenuBar: true,
    type: 'normal', // Default normal . On Linux, desktop, dock, toolbar, splash, notification.  On OS X, desktop, textured
    center: true,
    minWidth: 560,
    minHeight: 450,
    width: 800,
    height: 600,
    defaultFontSize: 12
  });
  win.setMenu(null);
  win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', onClosed);

  // https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssendchannel-arg1-arg2-

  return win;
}

ipcMain.on('vm-run', (event, o) => {
  console.log("vm-run: ", o);
  //event.returnValue = 'pong';
  //var result = vm.run(o.script);
  var result;
  try {
    result = vm.run(o.script);
    o.stdout = result;

    event.sender.send('vm-result', o);
  } catch (e) {
    o.stderr = e.message;
    event.sender.send('vm-result', o);
  }
  //event.sender.send('vm-result', vm.run(o.script));
  /*
  try {
      var script = new VMScript(o.script).compile();
  } catch (err) {
      console.error('Failed to compile script.', err);
    o.stderr = err;
    event.sender.send('vm-result', o);
  }

  try {
      vm.run(o.script);
    o.stdout = result;

    event.sender.send('vm-result', o);
  } catch (err) {
      console.error('Failed to execute script.', err);
    o.stderr = err;
    event.sender.send('vm-result', o);
  }
  */
});

ipcMain.on('request-openfile', (event, target) => {
  // https://github.com/electron/electron/blob/master/docs/api/dialog.md
  dialog.showOpenDialog({
    properties: ['openFile']
  }, function(files) {
    console.log("files:", files);
    var file = gfs.readFileSync(files[0]);
    console.log(file.toString());
    event.sender.send('openfile-complete', file.toString());
  });
});

ipcMain.on('element-clicked', (event, target) => {
  console.log('element-clicked:', target);
  //https://github.com/electron/electron/issues/1344
  shell.openExternal(target);
});

ipcMain.on('request-keydown', (event, target) => {
  console.log('request-keydown');
  //console.log('request-keydown', mainWindow.webContents);
  //console.log(">>>>>>", mainWindow.webContents.sendInputEvent)
  mainWindow.webContents.sendInputEvent({
    type: "keyDown",
    keyCode: '40'
  });
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

// https://github.com/patriksimek/vm2/issues/53
process.on('uncaughtException', (err) => {
  console.error('Asynchronous error caught.', err);
})
