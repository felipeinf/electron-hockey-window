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
  console.log("Registrando handlers IPC para almacenamiento...");

  // Handler para obtener valor
  ipcMain.handle('storage:get', async (_, key: 'windowBounds' | 'githubToken') => {
    try {
      console.log(`Handler: Obteniendo valor para clave: ${key}`);
      const value = store.get(key);
      console.log(`Handler: Valor obtenido para clave ${key}:`, value ? "***" : "null/undefined");
      return value;
    } catch (error) {
      console.error(`Handler: Error al obtener valor para clave "${key}":`, error);
      return null;
    }
  });

  // Handler para guardar valor
  ipcMain.handle('storage:set', async (_, key: 'windowBounds' | 'githubToken', value: any) => {
    try {
      console.log(`Handler: Guardando valor para clave: ${key}`);
      
      if (value === undefined) {
        console.error(`Handler: Error: Se intentó guardar un valor undefined para la clave ${key}`);
        return false;
      }
      
      if (value === null) {
        // Si es null, eliminar el valor
        console.log(`Handler: Eliminando valor para clave: ${key}`);
        store.delete(key);
      } else {
        // Guardar el nuevo valor
        console.log(`Handler: Guardando nuevo valor para clave: ${key}`, typeof value);
        store.set(key, value);
      }
      
      // Verificar que se guardó correctamente
      const savedValue = store.get(key);
      console.log(`Handler: Valor guardado para clave ${key}:`, savedValue ? "***" : "null/undefined", typeof savedValue);
      
      return true;
    } catch (error) {
      console.error(`Handler: Error al guardar valor para clave "${key}":`, error);
      return false;
    }
  });

  // Handler para eliminar valor
  ipcMain.handle('storage:remove', async (_, key: 'windowBounds' | 'githubToken') => {
    try {
      console.log(`Handler: Eliminando valor para clave: ${key}`);
      store.delete(key);
      const valueAfterDelete = store.get(key);
      console.log(`Handler: Valor después de eliminar para clave ${key}:`, valueAfterDelete ? "***" : "null/undefined");
      return true;
    } catch (error) {
      console.error(`Handler: Error al eliminar valor para clave "${key}":`, error);
      return false;
    }
  });

  console.log("✅ Handlers de almacenamiento registrados exitosamente.");
}

// Registrar handlers para compatibilidad con GitHub
// Estos handlers usan los handlers genéricos internamente
function registerGitHubHandlers() {
  console.log("Registrando handlers IPC para compatibilidad con GitHub...");

  // Importar fs y path para manipulación directa de archivos
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  
  // Crear un archivo de configuración simple para el token
  const tokenFilePath = path.join(os.homedir(), '.github-token.json');
  console.log("Ruta de archivo de token:", tokenFilePath);
  
  // Función para leer el token directamente del archivo
  const readTokenFromFile = () => {
    try {
      if (fs.existsSync(tokenFilePath)) {
        const data = fs.readFileSync(tokenFilePath, 'utf8');
        const json = JSON.parse(data);
        return json.token || '';
      }
    } catch (error) {
      console.error("Error al leer token del archivo:", error);
    }
    return '';
  };
  
  // Función para guardar el token directamente en el archivo
  const saveTokenToFile = (token: string | null) => {
    try {
      const json = { token: token };
      fs.writeFileSync(tokenFilePath, JSON.stringify(json, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error("Error al guardar token en archivo:", error);
      return false;
    }
  };

  // Handler para obtener token
  ipcMain.handle('github:get-token', async () => {
    try {
      console.log("Handler GitHub: Obteniendo token de GitHub");
      
      // Intentar primero desde el store
      let token = store.get('githubToken');
      
      // Si no está en el store, intentar leerlo del archivo
      if (!token) {
        token = readTokenFromFile();
        // Si se encontró en el archivo, guardarlo también en el store
        if (token) {
          store.set('githubToken', token);
        }
      }
      
      console.log("Handler GitHub: Token recuperado:", token ? "***" : "null/undefined");
      return token || '';
    } catch (error) {
      console.error('Handler GitHub: Error al obtener token de GitHub:', error);
      return '';
    }
  });

  // Handler para guardar token
  ipcMain.handle('github:set-token', async (_, token: string | null) => {
    try {
      console.log("Handler GitHub: Guardando token de GitHub");
      
      if (token === undefined) {
        console.error("Handler GitHub: Error: Se intentó guardar un token undefined");
        return false;
      }
      
      // Guardar tanto en el store como en el archivo
      if (token === null || token === '') {
        // Si es null o vacío, eliminar el token
        console.log("Handler GitHub: Eliminando token de GitHub");
        store.delete('githubToken');
        
        // También eliminar del archivo
        if (fs.existsSync(tokenFilePath)) {
          fs.unlinkSync(tokenFilePath);
        }
        
        return true;
      } else {
        // Guardar en ambos lugares
        console.log("Handler GitHub: Guardando nuevo token de GitHub");
        
        // Guardar en el store
        store.set('githubToken', token);
        
        // Guardar en el archivo
        const success = saveTokenToFile(token);
        
        if (success) {
          console.log("Handler GitHub: Token guardado correctamente");
        } else {
          console.error("Handler GitHub: Error al guardar token en archivo");
        }
        
        return success;
      }
    } catch (error) {
      console.error('Handler GitHub: Error al guardar token de GitHub:', error);
      console.error('Handler GitHub: Detalles del error:', error instanceof Error ? error.message : 'Error desconocido');
      console.error('Handler GitHub: Stack trace:', error instanceof Error ? error.stack : 'No disponible');
      return false;
    }
  });

  console.log("✅ Handlers de GitHub registrados exitosamente (compatibilidad).");
}