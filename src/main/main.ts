import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import * as path from 'path';
import Store from 'electron-store';

const store = new Store();
let hockeyWindow: BrowserWindow | null = null;

const createHockeyWindow = () => {
  if (hockeyWindow) {
    hockeyWindow.show();
    return;
  }

  hockeyWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true, // No mostrar en la barra de tareas
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  });

  // Cargar la última posición guardada
  const windowBounds = store.get('windowBounds');
  if (windowBounds) {
    hockeyWindow.setBounds(windowBounds as Electron.Rectangle);
  }

  hockeyWindow.loadFile(path.join(__dirname, '../renderer/hockey.html'));

  // Guardar la posición cuando se mueve la ventana
  hockeyWindow.on('moved', () => {
    if (hockeyWindow) {
      store.set('windowBounds', hockeyWindow.getBounds());
    }
  });

  // Ocultar en lugar de cerrar
  hockeyWindow.on('close', (event) => {
    event.preventDefault();
    hockeyWindow?.hide();
  });

  // Mostrar DevTools en desarrollo
  if (process.env.NODE_ENV === 'development') {
    hockeyWindow.webContents.openDevTools({ mode: 'detach' });
  }
};

app.whenReady().then(() => {
  createHockeyWindow();

  // Registrar atajo global (Command+Shift+H en macOS, Ctrl+Shift+H en Windows)
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (hockeyWindow?.isVisible()) {
      hockeyWindow.hide();
    } else {
      createHockeyWindow();
    }
  });
});

app.on('window-all-closed', (e: Electron.Event) => {
  e.preventDefault(); // Prevenir que la aplicación se cierre
});

// IPC handlers para comunicación con el renderer
ipcMain.handle('get-github-token', () => {
  return store.get('github-token');
});

ipcMain.handle('set-github-token', (_, token: string) => {
  store.set('github-token', token);
}); 