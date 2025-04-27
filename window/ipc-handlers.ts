import { BrowserWindow, ipcMain, shell } from 'electron';
import { store } from '../internal/electron/electron-config';

// Función para obtener la ventana actual
let getHockeyWindow: () => BrowserWindow | null = () => null;

// Función para establecer el getter de la ventana hockey desde el exterior
export function setHockeyWindowGetter(getter: () => BrowserWindow | null) {
  getHockeyWindow = getter;
}

// Registrar todos los handlers IPC necesarios para el framework
export function registerIPCHandlers() {
  // Limpiar handlers existentes si los hubiera para evitar duplicados
  cleanExistingHandlers();
  
  console.log("Registrando handlers IPC del framework Hockey Window...");
  
  // Registrar handlers para control de ventana
  registerWindowHandlers();
  
  // Registrar handlers para sistema (URLs externas, etc.)
  registerSystemHandlers();
  
  // Registrar handlers para almacenamiento
  registerStorageHandlers();
  
  // Registrar handlers específicos para GitHub (compatibilidad)
  registerGitHubHandlers();
  
  console.log("✅ Todos los handlers IPC registrados exitosamente.");
  console.log("Handlers disponibles:", ipcMain.eventNames());
}

// Limpiar handlers existentes
function cleanExistingHandlers() {
  const handlersToClean = [
    'window:close', 'window:minimize', 'window:maximize', 'window:restore',
    'system:open-external',
    'storage:get', 'storage:set', 'storage:remove',
    'github:get-token', 'github:set-token'
  ];
  
  try {
    for (const handler of handlersToClean) {
      if (ipcMain.eventNames().includes(handler)) {
        console.log(`Eliminando handler existente: ${handler}`);
        ipcMain.removeHandler(handler);
      }
    }
  } catch (error) {
    console.error('Error al limpiar handlers existentes:', error);
  }
}

// Registrar handlers para control de ventana
function registerWindowHandlers() {
  // Handler para cerrar ventana
  ipcMain.handle('window:close', () => {
    try {
      const win = getHockeyWindow() || BrowserWindow.getFocusedWindow();
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

  // Handler para minimizar ventana
  ipcMain.handle('window:minimize', () => {
    try {
      const win = getHockeyWindow() || BrowserWindow.getFocusedWindow();
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
  
  // Handler para maximizar ventana (opcional)
  ipcMain.handle('window:maximize', () => {
    try {
      const win = getHockeyWindow() || BrowserWindow.getFocusedWindow();
      if (win && !win.isDestroyed()) {
        if (win.isMaximized()) {
          win.unmaximize();
          console.log('Restaurando ventana de tamaño maximizado');
        } else {
          win.maximize();
          console.log('Maximizando ventana');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al maximizar/restaurar ventana:', error);
      return false;
    }
  });
  
  // Handler para restaurar ventana (opcional)
  ipcMain.handle('window:restore', () => {
    try {
      const win = getHockeyWindow() || BrowserWindow.getFocusedWindow();
      if (win && !win.isDestroyed()) {
        if (win.isMinimized()) {
          win.restore();
          console.log('Restaurando ventana de estado minimizado');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al restaurar ventana:', error);
      return false;
    }
  });
}

// Registrar handlers para sistema
function registerSystemHandlers() {
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
}

// Registrar handlers para almacenamiento
function registerStorageHandlers() {
  // Handler para obtener valor
  ipcMain.handle('storage:get', (_, key) => {
    try {
      console.log(`Obteniendo valor para clave: ${key}`);
      return store.get(key);
    } catch (error) {
      console.error(`Error al obtener valor para clave ${key}:`, error);
      return null;
    }
  });

  // Handler para guardar valor
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
  
  // Handler para eliminar valor
  ipcMain.handle('storage:remove', (_, key) => {
    try {
      console.log(`Eliminando valor para clave: ${key}`);
      store.delete(key);
      return true;
    } catch (error) {
      console.error(`Error al eliminar valor para clave ${key}:`, error);
      return false;
    }
  });
}

// Registrar handlers para compatibilidad con GitHub
// Estos handlers usan los handlers genéricos internamente
function registerGitHubHandlers() {
  console.log("Registrando handlers IPC para compatibilidad con GitHub...");

  // Handler para obtener token
  ipcMain.handle('github:get-token', async () => {
    try {
      console.log("Obteniendo token de GitHub (compatibilidad)");
      return store.get('githubToken') || '';
    } catch (error) {
      console.error('Error al obtener token de GitHub:', error);
      return '';
    }
  });

  // Handler para guardar token
  ipcMain.handle('github:set-token', async (_, token: string | null) => {
    try {
      console.log("Guardando token de GitHub (compatibilidad)");
      
      if (token === undefined) {
        console.error("Error: Se intentó guardar un token undefined");
        return false;
      }
      
      if (token === null || token === '') {
        // Si es null o vacío, eliminar el token
        console.log("Eliminando token de GitHub");
        store.delete('githubToken');
      } else {
        // Guardar el nuevo token
        console.log("Guardando nuevo token de GitHub");
        store.set('githubToken', token);
      }
      
      // Verificar que se guardó correctamente
      const savedToken = store.get('githubToken');
      console.log("Token guardado:", savedToken ? "***" : "null");
      
      return true;
    } catch (error) {
      console.error('Error al guardar token de GitHub:', error);
      return false;
    }
  });

  console.log("✅ Handlers de GitHub registrados exitosamente (compatibilidad).");
}