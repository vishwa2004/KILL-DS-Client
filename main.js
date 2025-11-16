const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let splash;

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
  //console.log('Skin swapper initialized.');

  protocol.handle('custom', async (request) => {
  const relativePath = request.url.slice(7); 
  const localPath = path.join(__dirname, 'swap', relativePath);

  try {
    const fileData = await fs.promises.readFile(localPath);
    const ext = path.extname(localPath).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.webp') contentType = 'image/webp';

    return new Response(fileData, {
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error(`[swap] Could not read file: ${localPath}`, err);
    return new Response('Not Found', { status: 404 });
  }
});


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
        const localFile = path.join(__dirname, 'swap', new URL(details.url).pathname);
        if (fs.existsSync(localFile)) {
          const redirectURL = `custom://${new URL(details.url).pathname}`;
          console.log(`[swap] Redirecting ${details.url} → ${redirectURL}`);
          return callback({ redirectURL });
        }
      } catch (e) {
        console.error('[swap] onBeforeRequest ERROR:', e);
      }
      callback({ cancel: false });
    }
  );
}

app.whenReady().then(() => {
  createSplash();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createSplash();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
