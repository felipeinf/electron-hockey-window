import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { store } from '../electron/electron-config';

// Variable para acceder a la ventana de forma segura
const getHockeyWindow = () => {
  return require('../electron/electron-config').hockeyWindow;
};

// Función para cerrar todas las ventanas duplicadas
export const closeAllDuplicateWindows = () => {
  const allWindows = BrowserWindow.getAllWindows();
  // Filtrar ventanas que tengan características similares a la ventana hockey
  const currentHockeyWindow = getHockeyWindow();
  const hockeyWindows = allWindows.filter(win => 
    win.getBackgroundColor() === '#00000000' && 
    !win.isDestroyed() && 
    win !== currentHockeyWindow
  );
  
  console.log(`Encontradas ${hockeyWindows.length} ventanas duplicadas para cerrar`);
  
  // Cerrar ventanas duplicadas
  hockeyWindows.forEach(win => {
    try {
      win.destroy();
    } catch (error) {
      console.error('Error al cerrar ventana duplicada:', error);
    }
  });
};

// Función para ocultar la ventana (sin destruirla)
export const hideHockeyWindow = () => {
  const currentHockeyWindow = getHockeyWindow();
  if (!currentHockeyWindow || currentHockeyWindow.isDestroyed()) return;
  
  console.log('Ocultando ventana hockey');
  
  // Guardar la posición actual de la ventana
  const bounds = currentHockeyWindow.getBounds();
  store.set('windowBounds', bounds);
  
  // Simplemente ocultar la ventana en lugar de destruirla
  try {
    // Ocultar la ventana
    currentHockeyWindow.hide();
    console.log('Ventana ocultada correctamente');
  } catch (error) {
    console.error('Error al ocultar ventana:', error);
  }
  
  // Cerrar ventanas duplicadas que puedan existir
  closeAllDuplicateWindows();
};

// Función para crear la ventana principal
export const createHockeyWindow = () => {
  // Cerrar ventanas duplicadas primero
  closeAllDuplicateWindows();
  
  const currentHockeyWindow = getHockeyWindow();
  if (currentHockeyWindow && !currentHockeyWindow.isDestroyed()) {
    currentHockeyWindow.show();
    currentHockeyWindow.focus();
    return;
  }

  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  // Registro para depuración
  console.log('Creando ventana Hockey');
  console.log('Resolución de pantalla:', width, 'x', height);
  
  const projectRoot = path.resolve(__dirname, '../..');
  console.log('Raíz del proyecto:', projectRoot);
  
  const preloadPath = path.resolve(projectRoot, 'dist', 'preload.js');
  console.log('Ruta del preload:', preloadPath);
  
  // Cerrar la ventana existente si por alguna razón todavía existe
  if (currentHockeyWindow) {
    try {
      currentHockeyWindow.destroy();
    } catch (error) {
      console.error('Error al cerrar ventana anterior:', error);
    }
  }
  
  // Cargar configuración personalizable desde config.json
  let windowConfig;
  try {
    windowConfig = require('../../src/config/window-config.json');
  } catch (error) {
    console.warn('No se pudo cargar la configuración de ventana personalizada:', error);
    // Configuración predeterminada
    windowConfig = {
      width: 400,
      height: 600,
      useCustomPosition: false,
      x: 0,
      y: 0
    };
  }
  
  // Crear la ventana con las opciones configurables
  const newWindow = new BrowserWindow({
    width: windowConfig.width || 400,
    height: windowConfig.height || 600,
    x: windowConfig.useCustomPosition ? windowConfig.x : Math.floor(width / 2 - (windowConfig.width || 400) / 2),
    y: windowConfig.useCustomPosition ? windowConfig.y : Math.floor(height / 2 - (windowConfig.height || 600) / 2),
    frame: process.platform === 'darwin',
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      devTools: true,
      sandbox: false
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    trafficLightPosition: { x: 10, y: 10 }
  });

  // Actualizar la referencia en el módulo electron-config.ts
  require('../electron/electron-config').hockeyWindow = newWindow;
  
  // Asegurarse de que la ventana sea transparente de verdad
  newWindow.setBackgroundColor('#00000000');
  
  // Asegurarse de que la ventana sea movible
  newWindow.setMovable(true);

  // Limpiar ventanas fantasma al mostrar
  newWindow.on('show', () => {
    console.log('Ventana hockey mostrada');
    // Eliminar ventanas fantasma
    closeAllDuplicateWindows();
  });

  // Limpiar ventanas fantasma al redimensionar
  newWindow.on('resize', () => {
    closeAllDuplicateWindows();
  });

  // Manejar el evento ready-to-show
  newWindow.once('ready-to-show', () => {
    closeAllDuplicateWindows();
  });

  // Cargar la última posición guardada
  const windowBounds = store.get('windowBounds');
  if (windowBounds) {
    newWindow.setBounds(windowBounds as Electron.Rectangle);
  }

  // Guardar la posición cuando se mueva la ventana
  newWindow.on('moved', () => {
    store.set('windowBounds', newWindow.getBounds());
  });

  // Asegurarse de que la ventana permanezca visible en todos los espacios de trabajo
  if (process.platform === 'darwin') {
    newWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: false
    });
  }

  console.log('__dirname:', __dirname);
  const indexPath = path.resolve(projectRoot, 'dist', 'renderer', 'hockey.html');
  console.log('Ruta absoluta a dist:', indexPath);
  
  console.log('Cargando archivo HTML:', indexPath);
  newWindow.loadFile(indexPath);

  // Eventos de ventana para depuración
  newWindow.webContents.on('did-finish-load', () => {
    console.log('La ventana ha terminado de cargar');
  });

  newWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error al cargar la ventana:', errorCode, errorDescription);
  });

  // Ocultar en lugar de cerrar
  newWindow.on('close', (event) => {
    console.log('Evento close en hockeyWindow');
    
    // En macOS, permitir el cierre normal si viene del botón nativo de cierre
    if (process.platform === 'darwin') {
      console.log('Permitiendo cierre normal en macOS');
      return; // No prevenir el evento de cierre
    }
    
    // Para otras plataformas o casos, prevenimos el cierre y ocultamos
    if (!newWindow.isDestroyed()) {
      event.preventDefault();
      hideHockeyWindow();
    }
  });

  // Añadir log para verificar si la ventana se cierra
  newWindow.on('closed', () => {
    console.log('Ventana hockey cerrada completamente');
    require('../electron/electron-config').hockeyWindow = null;
  });

  // Manejar ocultar ventana
  newWindow.on('hide', () => {
    console.log('Ventana hockey ocultada');
    // Cerrar ventanas fantasma
    closeAllDuplicateWindows();
  });

  // Manejar evento hide para macOS
  if (process.platform === 'darwin') {
    const { app } = require('electron');
    app.on('browser-window-blur', () => {
      const currentHockeyWindow = getHockeyWindow();
      if (currentHockeyWindow && !currentHockeyWindow.isDestroyed() && currentHockeyWindow.isVisible()) {
        // No hacer nada especial por ahora, solo loggear
        console.log('Ventana perdió el foco');
      }
    });
  }
}; 