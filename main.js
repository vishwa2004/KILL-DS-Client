const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('max-gum-fps', '999'); 

let mainWindow;
let splash;

protocol.registerSchemesAsPrivileged([
  { scheme: 'custom', privileges: { standard: true, secure: true, bypassCSP: true } }
]);


function createSplash() {
  splash = new BrowserWindow({
    width: 500,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    center: true,
    resizable: false,
  });

  splash.loadFile(path.join(__dirname, 'splash/splash.html'));

  setTimeout(() => {
    createMainWindow();
  }, 7000);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL('https://deadshot.io');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (splash && !splash.isDestroyed()) splash.close();
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Main window crashed!');
    app.quit();
  });

  setupSkinSwapper(); 
}

function setupSkinSwapper() {

  const resourceFilter = {
    urls: [
      '*://deadshot.io/weapons/awp/*.webp',
      '*://deadshot.io/weapons/ar2/*.webp',
      '*://deadshot.io/weapons/shotgun/*.webp',
      '*://deadshot.io/weapons/vector/*.webp',
      '*://deadshot.io/skins/compressed/*.webp',
      '*://deadshot.io/promo/*.webp',
      '*://deadshot.io/audio/*.mp3',
      '*://deadshot.io/textures/*.webp',
    //'*://deadshot.io/weapons/**/*.glb', 
    ],
  };

  mainWindow.webContents.session.webRequest.onBeforeRequest(
    resourceFilter,
    (details, callback) => {
      try {
        const pathname = new URL(details.url).pathname; 
        const localFile = path.join(__dirname, 'swap', pathname);
        
        if (fs.existsSync(localFile)) {
          const redirectURL = `custom://${pathname}`;
          console.log(`[swap] Redirecting ${details.url} → ${redirectURL}`);
          return callback({ redirectURL });
        }
      } catch (e) {
        console.error('[swap] onBeforeRequest ERROR:', e);
      }
      return callback({ cancel: false });
    }
  );
}


app.whenReady().then(() => {
  protocol.registerFileProtocol('custom', (request, callback) => {
    const url = decodeURIComponent(request.url.substr(9)); 
    const filePath = path.normalize(path.join(__dirname, 'swap', url));
    
    if (fs.existsSync(filePath)) {
      callback({ path: filePath });
    } else {
      console.error(`[swap] File not found for: ${filePath}`);
      callback({ error: -6 }); 
    }
  });
  
  createSplash();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSplash();
  }
});