import { app, globalShortcut } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { windowConfig } from './config';
import { registerIPCHandlers } from './ipc-handlers';
import { createHockeyWindow, closeAllDuplicateWindows, hideHockeyWindow, getHockeyWindow } from '../internal/window/hockey-window';

/**
 * Framework Hockey Window - Punto de entrada principal
 * Inicializa la aplicación Electron y maneja el ciclo de vida de la ventana
 */

// Función para registrar el atajo global
function registerGlobalShortcut() {
  const shortcutKey = windowConfig.shortcutKey;
  
  try {
    globalShortcut.register(shortcutKey, () => {
      console.log(`Atajo global activado: ${shortcutKey}`);
      
      // Cerrar ventanas duplicadas primero
      closeAllDuplicateWindows();
      
      const hockeyWindow = getHockeyWindow();
      
      if (hockeyWindow && !hockeyWindow.isDestroyed()) {
        if (hockeyWindow.isVisible()) {
          hideHockeyWindow();
        } else {
          hockeyWindow.show();
          hockeyWindow.focus();
        }
      } else {
        createHockeyWindow();
      }
    });
    
    console.log(`✅ Atajo global registrado: ${shortcutKey}`);
  } catch (error) {
    console.error(`❌ Error al registrar el atajo global ${shortcutKey}:`, error);
  }
}

// Función para configurar el hot reload en desarrollo
function setupHotReload() {
  if (process.env.NODE_ENV !== 'development') return;
  
  try {
    let lastModified = Date.now();
    
    // Función para verificar cambios
    const checkForChanges = () => {
      try {
        const rendererFilePath = path.join(__dirname, '../dist/app/hockey.js');
        
        if (fs.existsSync(rendererFilePath)) {
          const stats = fs.statSync(rendererFilePath);
          const mtime = stats.mtimeMs;
          
          if (mtime > lastModified) {
            const hockeyWindow = getHockeyWindow();
            
            if (hockeyWindow && !hockeyWindow.isDestroyed()) {
              console.log('Detectado cambio en el renderer, recargando...');
              lastModified = mtime;
              hockeyWindow.webContents.reloadIgnoringCache();
            }
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
    
    console.log('🔄 Hot reload activado (verificación cada 1s)');
  } catch (err) {
    console.error('Error al configurar hot reload:', err);
  }
}

// Función para inicializar la aplicación
export function initializeHockeyApp() {
  console.log('🚀 Iniciando Hockey Window Framework');
  
  // Configurar modo de desarrollo
  const isDev = process.env.NODE_ENV === 'development';
  console.log(`Modo: ${isDev ? '🔧 DESARROLLO' : '🏭 PRODUCCIÓN'}`);
  
  // Registrar los handlers IPC
  registerIPCHandlers();
  
  // Configurar hot reload en desarrollo
  setupHotReload();
  
  // Cuando la aplicación esté lista
  app.whenReady().then(() => {
    console.log('✅ Electron listo');
    
    // Crear la ventana Hockey
    createHockeyWindow();
    
    // Registrar el atajo global
    registerGlobalShortcut();
  });
  
  // Manejar evento de cierre de todas las ventanas
  app.on('window-all-closed', () => {
    // No cerrar en macOS a menos que el usuario lo solicite explícitamente
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  
  // Manejar activación (macOS)
  app.on('activate', () => {
    // Primero cerrar ventanas duplicadas
    closeAllDuplicateWindows();
    
    const hockeyWindow = getHockeyWindow();
    
    if (!hockeyWindow || hockeyWindow.isDestroyed()) {
      createHockeyWindow();
    } else if (!hockeyWindow.isVisible()) {
      hockeyWindow.show();
      hockeyWindow.focus();
    }
  });
  
  // Configurar comportamiento para una sola instancia
  const gotTheLock = app.requestSingleInstanceLock();
  
  if (!gotTheLock) {
    console.log('Ya existe otra instancia de la aplicación, cerrando...');
    app.quit();
  } else {
    app.on('second-instance', () => {
      console.log('Intento de abrir segunda instancia, enfocando ventana existente');
      
      const hockeyWindow = getHockeyWindow();
      
      if (hockeyWindow && !hockeyWindow.isDestroyed()) {
        if (hockeyWindow.isMinimized()) {
          hockeyWindow.restore();
        }
        hockeyWindow.focus();
      } else {
        createHockeyWindow();
      }
    });
  }
}

// Exportar funciones y constantes para que las aplicaciones puedan usarlas
export { getHockeyWindow, createHockeyWindow, hideHockeyWindow, windowConfig };