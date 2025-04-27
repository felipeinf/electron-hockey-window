import { BrowserWindow, app, globalShortcut, ipcMain, shell } from 'electron';
import * as path from 'path';
import ElectronStore from 'electron-store';
import * as fs from 'fs';

// Instancia de almacenamiento para Hockey Window
export const store = new ElectronStore({
  name: 'hockey-window',
  clearInvalidConfig: true
});

// Control de ventanas
export let hockeyWindow: BrowserWindow | null = null;

// Handlers para control de ventana
ipcMain.handle('window:close', () => {
  try {
    const win = hockeyWindow || BrowserWindow.getFocusedWindow();
    if (win && !win.isDestroyed()) {
      console.log('Cerrando ventana');
      win.close();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al cerrar ventana:', error);
    return false;
  }
});

ipcMain.handle('window:minimize', () => {
  try {
    const win = hockeyWindow || BrowserWindow.getFocusedWindow();
    if (win && !win.isDestroyed()) {
      console.log('Minimizando ventana');
      win.minimize();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al minimizar ventana:', error);
    return false;
  }
});

// Handler para abrir URLs externas
ipcMain.handle('system:open-external', async (_, url) => {
  try {
    console.log('Abriendo URL externa:', url);
    await shell.openExternal(url);
    return true;
  } catch (error) {
    console.error('Error al abrir URL externa:', error);
    return false;
  }
});

// Handlers genéricos para almacenamiento
ipcMain.handle('storage:get', (_, key) => {
  try {
    console.log(`Obteniendo valor para clave: ${key}`);
    return store.get(key);
  } catch (error) {
    console.error(`Error al obtener valor para clave ${key}:`, error);
    return null;
  }
});

ipcMain.handle('storage:set', (_, key, value) => {
  try {
    console.log(`Guardando valor para clave: ${key}`);
    store.set(key, value);
    return true;
  } catch (error) {
    console.error(`Error al guardar valor para clave ${key}:`, error);
    return false;
  }
});

// Función para inicializar la aplicación Electron
export function initializeApp() {
  // Log para verificar que los handlers están registrados
  console.log('Verificando handlers IPC registrados...');
  console.log('Todos los handlers IPC:', ipcMain.eventNames());
  
  // Hot Reload simple y directo para desarrollo
  if (process.env.NODE_ENV === 'development') {
    try {
      // Usar el tiempo de última modificación para detectar cambios
      let lastModified = Date.now();
      
      // Función para verificar cambios
      const checkForChanges = () => {
        try {
          const rendererFilePath = path.join(__dirname, '../renderer/hockey.js');
          
          if (fs.existsSync(rendererFilePath)) {
            const stats = fs.statSync(rendererFilePath);
            const mtime = stats.mtimeMs;
            
            if (mtime > lastModified && hockeyWindow && !hockeyWindow.isDestroyed()) {
              console.log('Detectado cambio en el renderer, recargando...');
              lastModified = mtime;
              hockeyWindow.webContents.reloadIgnoringCache();
            }
          }
        } catch (err) {
          console.error('Error verificando cambios:', err);
        }
      };
      
      // Verificar cambios cada 1 segundo
      const watchInterval = setInterval(checkForChanges, 1000);
      
      // Limpiar el intervalo cuando la aplicación se cierra
      app.on('will-quit', () => {
        clearInterval(watchInterval);
      });
      
      console.log('Hot reload activado (verificación cada 1s)');
    } catch (err) {
      console.log('Error al configurar hot reload:', err);
    }
  }

  app.whenReady().then(() => {
    // Importamos dinámicamente para evitar dependencias circulares
    const { createHockeyWindow, closeAllDuplicateWindows, hideHockeyWindow } = require('../window/hockey-window');
    createHockeyWindow();

    // Registrar atajo global (Command+Shift+H en macOS, Ctrl+Shift+H en Windows)
    globalShortcut.register('CommandOrControl+Shift+H', () => {
      // Primero cerrar ventanas duplicadas
      closeAllDuplicateWindows();
      
      if (hockeyWindow && !hockeyWindow.isDestroyed()) {
        if (hockeyWindow.isVisible()) {
          hideHockeyWindow();
        } else {
          // Este caso no debería ocurrir con la nueva implementación
          // pero por si acaso lo manejamos
          hockeyWindow.show();
          hockeyWindow.focus();
        }
      } else {
        createHockeyWindow();
      }
    });
  });

  // Manejar evento de cierre de aplicación
  app.on('window-all-closed', () => {
    // No cerrar en macOS a menos que el usuario lo solicite explícitamente
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // Manejar activación (macOS)
  app.on('activate', () => {
    // Importamos dinámicamente para evitar dependencias circulares
    const { createHockeyWindow, closeAllDuplicateWindows } = require('../window/hockey-window');
    
    // Primero cerrar ventanas duplicadas
    closeAllDuplicateWindows();
    
    if (!hockeyWindow || hockeyWindow.isDestroyed()) {
      createHockeyWindow();
    } else if (!hockeyWindow.isVisible()) {
      hockeyWindow.show();
      hockeyWindow.focus();
    }
  });
} 