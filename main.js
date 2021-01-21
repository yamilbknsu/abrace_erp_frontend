const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");

// We keep a reference so it doesn't get garbage collected
let mainWindow

function createWindow () {
  //Create new window
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load the Angular html
  /*mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '/dist/index.html'),
      protocol: "file:",
      slashes: true
    })
  );*/
  mainWindow.loadURL('http://localhost:4200');

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

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