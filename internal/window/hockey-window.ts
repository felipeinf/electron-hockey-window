import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
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
  
  // Configuración según entorno (desarrollo vs producción)
  const isDev = process.env.NODE_ENV === 'development';
  
  console.log(`MODO DE EJECUCIÓN: ${isDev ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  
  // CONFIGURACIÓN DE DIMENSIONES SEGÚN ENTORNO
  // Modo producción usa 400x600, modo desarrollo usa 1200x600
  const windowWidth = isDev ? 1200 : 400;
  const windowHeight = 600;
  
  console.log(`Dimensiones seleccionadas: ${windowWidth}x${windowHeight}`);
  
  // Cargar configuración adicional en dev si existe
  if (isDev) {
    try {
      const configPath = path.resolve(__dirname, '../../src/config/window-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.dev && config.dev.width && config.dev.height) {
          console.log(`Configuración DEV: ${config.dev.width}x${config.dev.height}`);
        }
      }
    } catch (error) {
      console.error('Error al cargar configuración dev:', error);
    }
  } else {
    console.log(`Configuración PROD: ${windowWidth}x${windowHeight}`);
  }
  
  // Detectar rutas dinámicamente
  const isPackaged = process.env.NODE_ENV === 'production';
  
  // Encontrar la ruta correcta para el proyecto
  let projectRoot = '';
  if (isPackaged) {
    projectRoot = path.resolve(__dirname, '../..');
  } else {
    projectRoot = process.cwd();
  }
  
  console.log('Raíz del proyecto:', projectRoot);
  
  // Encontrar preload.js
  const distFolder = path.join(projectRoot, 'dist');
  let preloadPath = path.join(distFolder, 'preload.js');
  console.log('Ruta del preload:', preloadPath);
  
  // Verificar si el archivo preload existe
  if (fs.existsSync(preloadPath)) {
    console.log('El archivo preload.js existe en:', preloadPath);
  } else {
    console.error('ERROR: No se encontró el archivo preload.js en:', preloadPath);
    // Intentar buscar en ubicaciones alternativas
    const altPreloadPath = path.resolve(process.cwd(), 'dist', 'preload.js');
    console.log('Intentando ruta alternativa para preload:', altPreloadPath);
    if (fs.existsSync(altPreloadPath)) {
      console.log('Preload encontrado en ruta alternativa');
      // Usar la ruta alternativa
      preloadPath = altPreloadPath;
    }
  }
  
  // Cerrar la ventana existente si por alguna razón todavía existe
  if (currentHockeyWindow) {
    try {
      currentHockeyWindow.destroy();
    } catch (error) {
      console.error('Error al cerrar ventana anterior:', error);
    }
  }
  
  // Crear la ventana con el tamaño de la configuración
  const newWindow = new BrowserWindow({
    width: isDev ? 1200 : 400, // Ancho según entorno
    height: 600, // Alto fijo
    x: Math.floor(width / 2 - (isDev ? 1200 : 400) / 2),
    y: Math.floor(height / 2 - 600 / 2),
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
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'hidden',
    trafficLightPosition: { x: -100, y: -100 }, // Mover los controles fuera de la vista
    titleBarOverlay: false
  });

  // EN PRODUCCIÓN FORZAR DIMENSIONES CON RETRASO
  if (!isDev) {
    setTimeout(() => {
      console.log('⛔ CONFIRMANDO DIMENSIONES EN PRODUCCIÓN');
      newWindow.setSize(400, 600);
      const size = newWindow.getSize();
      console.log(`⛔ DIMENSIONES TRAS SETSIZE: ${size[0]}x${size[1]}`);
    }, 200);
  }

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
    
    // FORZAR TAMAÑO NUEVAMENTE EN READY-TO-SHOW EN PRODUCCIÓN
    if (!isDev) {
      newWindow.setSize(400, 600);
      const size = newWindow.getSize();
      console.log(`⛔ DIMENSIONES EN READY-TO-SHOW: ${size[0]}x${size[1]}`);
    }
  });

  // Cargar la última posición guardada
  const windowBounds = store.get('windowBounds');
  if (windowBounds) {
    newWindow.setBounds(windowBounds as Electron.Rectangle);
    
    // ASEGURAR ANCHO CORRECTO SI SE CARGÓ POSICIÓN GUARDADA Y ESTAMOS EN PRODUCCIÓN
    if (!isDev) {
      const bounds = newWindow.getBounds();
      newWindow.setBounds({...bounds, width: 400});
    }
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
  
  // Encontrar archivo HTML
  const indexPath = path.join(distFolder, 'app', 'hockey.html');
  console.log('Ruta absoluta del HTML:', indexPath);
  
  // Verificar si el archivo existe
  if (fs.existsSync(indexPath)) {
    console.log('El archivo HTML existe');
  } else {
    console.error('ADVERTENCIA: El archivo HTML no existe en', indexPath);
    // Intentar buscar en otras ubicaciones
    const altPath = path.resolve(process.cwd(), 'dist', 'app', 'hockey.html');
    console.log('Intentando ruta alternativa:', altPath);
    if (fs.existsSync(altPath)) {
      console.log('HTML encontrado en ruta alternativa');
      newWindow.loadFile(altPath);
      return;
    }
  }
  
  console.log('Cargando archivo HTML:', indexPath);
  newWindow.loadFile(indexPath);

  // Eventos de ventana para depuración
  newWindow.webContents.on('did-finish-load', () => {
    console.log('La ventana ha terminado de cargar');
    
    // Abrir DevTools solo en modo desarrollo
    if (isDev) {
      console.log('Modo desarrollo: abriendo DevTools');
      // Forzar apertura de DevTools
      newWindow.webContents.openDevTools({ mode: 'right' });
      
      // Asegurar que DevTools se abre en caso de problemas
      setTimeout(() => {
        if (!newWindow.webContents.isDevToolsOpened()) {
          console.log('Intentando abrir DevTools nuevamente...');
          newWindow.webContents.openDevTools({ mode: 'right' });
        }
      }, 500);
    } else {
      console.log('Modo producción: no se abrirán DevTools');
      
      // FORZAR TAMAÑO UNA VEZ MÁS DESPUÉS DE CARGAR
      newWindow.setSize(400, 600);
      const size = newWindow.getSize();
      console.log(`Dimensiones finales: ${size[0]}x${size[1]}`);
    }
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