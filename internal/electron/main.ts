import { app, session, ipcMain } from 'electron';
import path from 'path';
import { createHockeyWindow } from '../window/hockey-window';
import { initializeApp } from './electron-config';
import * as log from 'electron-log';

// Declaración global para la ventana
declare global {
  namespace NodeJS {
    interface Global {
      hockeyWindow: any;
    }
  }
}

// Verificar el modo de ejecución y respetarlo
console.log(`Valor original de NODE_ENV: "${process.env.NODE_ENV}"`);
console.log(`Argumentos de ejecución:`, process.argv);

// Solo definir valor por defecto si no existe
if (!process.env.NODE_ENV) {
  console.warn('⚠️ NODE_ENV no definido, configurando por defecto a "production"');
  process.env.NODE_ENV = 'production';
}

// Ahora mostramos el valor final sin modificarlo
console.log(`✅ MODO DE EJECUCIÓN FINAL: "${process.env.NODE_ENV}"`);

// Configuración de registro
log.initialize({ preload: true });
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';

log.info('🚀 Aplicación iniciando');
log.info(`Versión de Electron: ${process.versions.electron}`);
log.info(`Versión de Node: ${process.versions.node}`);
log.info(`Versión de Chromium: ${process.versions.chrome}`);
log.info(`Directorio de la aplicación: ${app.getAppPath()}`);

// Evitar múltiples instancias
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  log.warn('Otra instancia está ejecutándose. Cerrando esta instancia.');
  app.quit();
} else {
  // Manejo de segunda instancia
  app.on('second-instance', () => {
    log.info('Segunda instancia detectada, enfocando la ventana principal');
    const hockeyWindow = (global as any).hockeyWindow;
    if (hockeyWindow) {
      if (hockeyWindow.isMinimized()) hockeyWindow.restore();
      hockeyWindow.focus();
    }
  });
}

// Inicializar la aplicación cuando esté lista
app.whenReady().then(async () => {
  try {
    log.info('Aplicación lista, configurando...');
    
    // Extensiones para desarrollo si es necesario
    if (process.env.NODE_ENV === 'development') {
      try {
        log.info('Entorno de desarrollo detectado, intentando cargar React DevTools');
        // Intentar instalar React DevTools
        const reactDevToolsPath = path.join(
          app.getPath('userData'),
          'react-devtools'
        );
        await session.defaultSession.loadExtension(reactDevToolsPath, {
          allowFileAccess: true
        });
        log.info('React DevTools cargado correctamente');
      } catch (devToolsError) {
        log.warn('No se pudieron cargar React DevTools:', devToolsError);
      }
    }
    
    log.info('Handlers IPC registrados:', ipcMain.eventNames());
    
    // Inicializar IPC básicos
    log.info('Inicializando handlers IPC básicos...');
    initializeApp();
    log.info('Handlers IPC básicos inicializados');
    
    // Esperar un momento para que se registren completamente los handlers
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Crear ventana principal
    await createHockeyWindow();
    
    // En macOS, recrear la ventana cuando se hace clic en el icono del dock
    app.on('activate', async () => {
      log.info('Activación de la aplicación');
      if (!(global as any).hockeyWindow) {
        await createHockeyWindow();
      }
    });
  } catch (error) {
    log.error('Error durante la inicialización de la aplicación:', error);
  }
});

// Manejo del cierre de la aplicación
app.on('window-all-closed', () => {
  log.info('Todas las ventanas cerradas');
  // En macOS, es común que la aplicación siga en ejecución hasta que el usuario salga explícitamente
  if (process.platform !== 'darwin') {
    log.info('No estamos en macOS, cerrando la aplicación');
    app.quit();
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  log.error('Error no capturado en el proceso principal:', error);
});

// Limpieza antes de salir
app.on('before-quit', () => {
  log.info('Aplicación a punto de cerrar, realizando limpieza...');
}); 