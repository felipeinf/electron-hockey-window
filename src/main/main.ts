import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import * as path from 'path';
import Store from 'electron-store';

// Configuración de electron-store
const store = new Store({
  name: 'hockey-config',
  defaults: {
    'github-token': ''
  }
});

let hockeyWindow: BrowserWindow | null = null;

const createHockeyWindow = () => {
  if (hockeyWindow) {
    hockeyWindow.show();
    return;
  }

  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  // Registro para depuración
  console.log('Creando ventana Hockey');
  console.log('Resolución de pantalla:', width, 'x', height);
  
  const preloadPath = path.join(__dirname, '../preload/preload.js');
  console.log('Ruta del preload:', preloadPath);
  
  hockeyWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: Math.floor(width / 2 - 200),
    y: Math.floor(height / 2 - 300),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: true,
    visualEffectState: 'active',
    vibrancy: 'under-window',
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      devTools: true,
      sandbox: false
    },
    titleBarStyle: 'customButtonsOnHover',
    trafficLightPosition: { x: 10, y: 10 }
  });

  // Mostrar DevTools siempre para depuración
  hockeyWindow.webContents.openDevTools({ mode: 'detach' });

  // Asegurarse de que la ventana sea movible
  hockeyWindow.setMovable(true);

  // Cargar la última posición guardada
  const windowBounds = store.get('windowBounds');
  if (windowBounds) {
    hockeyWindow.setBounds(windowBounds as Electron.Rectangle);
  }

  // Guardar la posición cuando se mueva la ventana
  hockeyWindow.on('moved', () => {
    if (hockeyWindow) {
      store.set('windowBounds', hockeyWindow.getBounds());
    }
  });

  // Asegurarse de que la ventana permanezca visible en todos los espacios de trabajo
  if (process.platform === 'darwin') {
    hockeyWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: false
    });
  }

  console.log('Cargando archivo HTML:', path.join(__dirname, '../renderer/hockey.html'));
  hockeyWindow.loadFile(path.join(__dirname, '../renderer/hockey.html'));

  // Eventos de ventana para depuración
  hockeyWindow.webContents.on('did-finish-load', () => {
    console.log('La ventana ha terminado de cargar');
  });

  hockeyWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error al cargar la ventana:', errorCode, errorDescription);
  });

  // Ocultar en lugar de cerrar
  hockeyWindow.on('close', (event) => {
    event.preventDefault();
    hockeyWindow?.hide();
  });
};

// IPC handlers
ipcMain.handle('get-github-token', () => {
  console.log('Obteniendo token de GitHub');
  const token = store.get('github-token');
  console.log('Token obtenido:', token ? 'Token existe' : 'No hay token');
  return token;
});

ipcMain.handle('set-github-token', (_, token: string) => {
  console.log('Guardando token de GitHub');
  store.set('github-token', token);
  console.log('Token guardado');
  return true;
});

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