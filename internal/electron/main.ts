import { app, session } from 'electron';
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
    
    // Inicializar IPC
    log.info('Inicializando handlers IPC...');
    initializeApp();
    log.info('Handlers IPC inicializados correctamente, incluyendo github:get-token y github:set-token');
    
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