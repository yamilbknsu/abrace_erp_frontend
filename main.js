const { app, BrowserWindow, ipcMain, dialog, webFrame, screen } = require('electron')
const url = require("url");
const path = require("path");

// We keep a reference so it doesn't get garbage collected
let mainWindow
var screenRatio;

// 1333 x 638, 83%

function createWindow () {

  screenRatio = screen.getDisplayNearestPoint({x:0, y:0}).bounds.height / 1080;

  //Create new window
  mainWindow = new BrowserWindow({
    width: 1800 * screenRatio, //1600
    height: 950 * screenRatio, // 900
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      zoomFactor: screenRatio
    }
  });

  // Load the Angular html
  mainWindow.loadURL(
  url.format({
    pathname: path.join(__dirname, '/dist/index.html'),
    protocol: "file:",
    slashes: true
  })
  );
  //mainWindow.loadURL('http://localhost:4200');

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  //mainWindow.setMenu(null);

  mainWindow.on('closed', function () {
    mainWindow = null
  });

  // Resize event handler
  mainWindow.on('resize', function(){
    //size = mainWindow.getSize();
    //mainWindow.webContents.executeJavaScript('onWindowResize()');
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

ipcMain.on('success-message', (event, args) => {
  dialog.showMessageBox(args)
});

ipcMain.on('error-message', (event, args) => {
  dialog.showErrorBox(args.title, args.message)
});

ipcMain.on('warning-message', (event, args) => {
  dialog.showMessageBox({title: args.title, message: args.message, type: "warning"})
});

ipcMain.on('confirmation-message', (event, args) => {
  dialog.showMessageBox(args).then((response, checkboxChecked) => {
    mainWindow.webContents.send('confirmation-response', response.response);
  })
});

ipcMain.on('file-saving-message', (event, args) => {
  dialog.showSaveDialog(args).then((response, checkboxChecked) => {

    mainWindow.webContents.send('file-saving-response', response);
  })
});

ipcMain.on('url-pdf', (event, args) => {
  var pdfWindow = new BrowserWindow({
    width: 900 * screenRatio, 
    height: 900 * screenRatio,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      zoomFactor: screenRatio,
      plugins: true
    }
  });

  pdfWindow.loadURL(args.url);
  pdfWindow.setMenu(null);
});