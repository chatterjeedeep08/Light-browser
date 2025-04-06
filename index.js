const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 720,  // Start at 100x100
        height: 720,
        autoHideMenuBar: true,
        webPreferences: {
          preload: path.join(__dirname, 'renderer.js'),
          nodeIntegration: true,
          contextIsolation: false,
          webviewTag: true // Enables WebView
        }
    });

    // Load website
    //mainWindow.loadURL('https://www.chess.com');
    mainWindow.loadFile('index.html'); // Load local HTML file

    // Resize dynamically after load
    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.setBounds({ x: 100, y: 100, width: 720, height: 720 });

        // Inject JavaScript to set the viewport size
        mainWindow.webContents.executeJavaScript(`
            document.querySelector('meta[name="viewport"]')?.setAttribute('content', 'width=100, initial-scale=1');
            document.body.style.zoom = '1'; // Adjust zoom to fit
        `);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});