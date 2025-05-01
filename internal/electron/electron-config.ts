import { BrowserWindow, app, globalShortcut, ipcMain, shell } from 'electron';
import * as path from 'path';
import ElectronStore from 'electron-store';
import * as fs from 'fs';
import * as os from 'os';

// Instancia de almacenamiento para Hockey Window
console.log('Inicializando ElectronStore...');

// Definir el directorio de configuración explícitamente para evitar problemas de permisos
const appConfigDir = path.join(os.homedir(), '.config', 'hockey-window');
console.log('Directorio de configuración:', appConfigDir);

// Verificar que el directorio existe y tiene permisos de escritura
try {
  if (!fs.existsSync(appConfigDir)) {
    fs.mkdirSync(appConfigDir, { recursive: true });
    console.log('Directorio de configuración creado:', appConfigDir);
  }
  
  // Verificar permisos de escritura
  const testFile = path.join(appConfigDir, 'test-write.tmp');
  fs.writeFileSync(testFile, 'test', { encoding: 'utf8' });
  fs.unlinkSync(testFile);
  console.log('Verificación de permisos de escritura exitosa');
} catch (error) {
  console.error('Error al verificar/crear directorio de configuración:', error);
}

export const store = new ElectronStore({
  name: 'hockey-window',
  clearInvalidConfig: true,
  cwd: appConfigDir, // Establecer el directorio de trabajo explícitamente
  defaults: {
    windowBounds: null,
    githubToken: null
  }
});

// Log para verificar la ubicación del store
console.log('Ubicación del archivo de configuración:', store.path);
console.log('Valores iniciales en el store:', {
  windowBounds: store.get('windowBounds') ? '***' : 'null',
  githubToken: store.get('githubToken') ? '***' : 'null'
});

// Control de ventanas
export let hockeyWindow: BrowserWindow | null = null;

// Handlers para control de ventana
// Eliminados porque están siendo manejados por window/ipc-handlers.ts

// Handler para abrir URLs externas
// Eliminado porque está siendo manejado por window/ipc-handlers.ts

// Handlers genéricos para almacenamiento
// Eliminados porque están siendo manejados por window/ipc-handlers.ts

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