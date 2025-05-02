import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { store } from '../electron/electron-config';
import { windowConfig } from '../../window/config';

// Variable para acceder a la ventana de forma segura
let hockeyWindow: BrowserWindow | null = null;

// Getter para acceder a la ventana
export const getHockeyWindow = () => hockeyWindow;

// Función para cerrar todas las ventanas duplicadas
export const closeAllDuplicateWindows = () => {
  const allWindows = BrowserWindow.getAllWindows();
  const hockeyWindows = allWindows.filter(win => 
    !win.isDestroyed() && 
    win !== hockeyWindow
  );
  
  console.log(`Encontradas ${hockeyWindows.length} ventanas duplicadas para cerrar`);
  
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
  if (!hockeyWindow || hockeyWindow.isDestroyed()) return;
  
  console.log('Ocultando ventana hockey');
  
  const bounds = hockeyWindow.getBounds();
  store.set('windowBounds', bounds);
  
  try {
    hockeyWindow.hide();
    console.log('Ventana ocultada correctamente');
  } catch (error) {
    console.error('Error al ocultar ventana:', error);
  }
  
  closeAllDuplicateWindows();
};

// Función para crear la ventana principal
export const createHockeyWindow = () => {
  closeAllDuplicateWindows();
  
  if (hockeyWindow && !hockeyWindow.isDestroyed()) {
    hockeyWindow.show();
    hockeyWindow.focus();
    return;
  }

  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.workAreaSize;

  const isDev = process.env.NODE_ENV === 'development';
  const windowWidth = isDev ? 1200 : windowConfig.width || 400;
  const windowHeight = windowConfig.height || 600;
  
  console.log(`Dimensiones de ventana: ${windowWidth}x${windowHeight}`);
  
  const isPackaged = process.env.NODE_ENV === 'production';
  const projectRoot = isPackaged ? path.resolve(__dirname, '../..') : process.cwd();
  const distFolder = path.join(projectRoot, 'dist');
  const preloadPath = path.join(distFolder, 'preload.js');
  
  if (hockeyWindow) {
    try {
      hockeyWindow.destroy();
    } catch (error) {
      console.error('Error al cerrar ventana anterior:', error);
    }
    hockeyWindow = null;
  }
  
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: windowWidth,
    height: windowHeight,
    x: Math.floor(screenWidth / 2 - windowWidth / 2),
    y: Math.floor(screenHeight / 2 - windowHeight / 2),
    title: windowConfig.title || 'Hockey Window',
    transparent: windowConfig.transparent !== undefined ? windowConfig.transparent : true,
    alwaysOnTop: windowConfig.alwaysOnTop !== undefined ? windowConfig.alwaysOnTop : true,
    frame: windowConfig.frame !== undefined ? windowConfig.frame : false,
    skipTaskbar: false,
    hasShadow: true,
    backgroundColor: windowConfig.backgroundColor || '#00000000',
    titleBarStyle: windowConfig.titleBarStyle || 'hidden',
    trafficLightPosition: windowConfig.showSystemButtons ? undefined : { x: -100, y: -100 },
    titleBarOverlay: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      sandbox: false
    }
  };
  
  hockeyWindow = new BrowserWindow(windowOptions);

  if (!isDev) {
    setTimeout(() => {
      if (hockeyWindow) {
        hockeyWindow.setSize(windowConfig.width || 400, windowConfig.height || 600);
      }
    }, 200);
  }
  
  hockeyWindow.setMovable(true);

  hockeyWindow.on('show', () => {
    console.log('Ventana hockey mostrada');
    closeAllDuplicateWindows();
  });

  hockeyWindow.on('resize', () => {
    closeAllDuplicateWindows();
  });

  hockeyWindow.once('ready-to-show', () => {
    closeAllDuplicateWindows();
    
    if (!isDev && hockeyWindow) {
      hockeyWindow.setSize(windowConfig.width || 400, windowConfig.height || 600);
    }
  });

  const windowBounds = store.get('windowBounds');
  if (windowBounds) {
    hockeyWindow.setBounds(windowBounds as Electron.Rectangle);
    
    if (!isDev) {
      const bounds = hockeyWindow.getBounds();
      hockeyWindow.setBounds({...bounds, width: windowConfig.width || 400});
    }
  }

  hockeyWindow.on('moved', () => {
    if (hockeyWindow) {
      store.set('windowBounds', hockeyWindow.getBounds());
    }
  });

  if (process.platform === 'darwin') {
    hockeyWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: false
    });
  }
  
  const indexPath = path.join(distFolder, 'app', 'hockey.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('El archivo HTML existe en:', indexPath);
    hockeyWindow.loadFile(indexPath);
  } else {
    console.error('ADVERTENCIA: El archivo HTML no existe en', indexPath);
    const altPaths = [
      path.resolve(process.cwd(), 'dist', 'app', 'hockey.html'),
      path.resolve(process.cwd(), 'dist', 'hockey.html'),
      path.resolve(process.cwd(), 'dist', 'index.html')
    ];
    
    let loaded = false;
    for (const altPath of altPaths) {
      if (fs.existsSync(altPath)) {
        console.log('HTML encontrado en ruta alternativa:', altPath);
        hockeyWindow.loadFile(altPath);
        loaded = true;
        break;
      }
    }
    
    if (!loaded) {
      console.error('ERROR: No se pudo encontrar ningún HTML. La ventana se mostrará vacía.');
      hockeyWindow.loadURL('data:text/html;charset=utf-8,<html><body><h1>Error: No se encontró el archivo HTML</h1></body></html>');
    }
  }

  hockeyWindow.webContents.on('did-finish-load', () => {
    console.log('La ventana ha terminado de cargar');
    
    if (isDev || windowConfig.devTools) {
      console.log('Abriendo DevTools');
      hockeyWindow?.webContents.openDevTools({ mode: 'right' });
    }
  });

  hockeyWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error al cargar la ventana:', errorCode, errorDescription);
  });

  hockeyWindow.on('close', (event) => {
    console.log('Evento close en hockeyWindow');
    
    if (process.platform === 'darwin') {
      console.log('Permitiendo cierre normal en macOS');
      return;
    }
    
    if (hockeyWindow && !hockeyWindow.isDestroyed()) {
      event.preventDefault();
      hideHockeyWindow();
    }
  });

  hockeyWindow.on('closed', () => {
    console.log('Ventana hockey cerrada completamente');
    hockeyWindow = null;
  });

  hockeyWindow.on('hide', () => {
    console.log('Ventana hockey ocultada');
    closeAllDuplicateWindows();
  });

  return hockeyWindow;
}; 