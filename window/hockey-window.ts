import { BrowserWindow, screen, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { store } from './ipc-handlers';
import { finalConfig } from './config';
import { HockeyWindowConfig } from './types/window-config';
import { setHockeyWindowGetter } from './ipc-handlers';

// Referencia a la ventana hockey
let hockeyWindow: BrowserWindow | null = null;

// Getter para acceder a la ventana
export const getHockeyWindow = (): BrowserWindow | null => {
  return hockeyWindow;
};

// Registrar el getter para los handlers IPC
setHockeyWindowGetter(getHockeyWindow);

// Función para cerrar todas las ventanas duplicadas
export const closeAllDuplicateWindows = () => {
  const allWindows = BrowserWindow.getAllWindows();
  // Filtrar ventanas que tengan características similares a la ventana hockey
  const currentHockeyWindow = getHockeyWindow();
  const hockeyWindows = allWindows.filter(win => 
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

// Función para crear la ventana principal usando la configuración
export const createHockeyWindow = () => {
  // Cerrar ventanas duplicadas primero
  closeAllDuplicateWindows();
  
  // Si la ventana ya existe, mostrarla y enfocarla
  if (hockeyWindow && !hockeyWindow.isDestroyed()) {
    hockeyWindow.show();
    hockeyWindow.focus();
    return;
  }

  // Obtener la información de la pantalla
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.workAreaSize;

  // Configuración según entorno (desarrollo vs producción)
  const isDev = process.env.NODE_ENV === 'development';
  
  // Usar configuración del archivo
  console.log('Usando configuración:', finalConfig);
  
  // Sobrescribir el ancho en modo desarrollo para tener una ventana más grande
  const windowWidth = isDev ? 1200 : finalConfig.width || 400;
  const windowHeight = finalConfig.height || 600;
  
  console.log(`Dimensiones de ventana: ${windowWidth}x${windowHeight}`);
  
  // Encontrar rutas de archivos
  const isPackaged = process.env.NODE_ENV === 'production';
  
  // Encontrar la ruta correcta para el proyecto
  let projectRoot = '';
  if (isPackaged) {
    projectRoot = path.resolve(__dirname, '..');
  } else {
    projectRoot = process.cwd();
  }
  
  console.log('Raíz del proyecto:', projectRoot);
  
  // Encontrar preload.js
  const distFolder = path.join(projectRoot, 'dist');
  let preloadPath = path.join(distFolder, 'preload.js');
  
  // Verificar si el archivo preload existe
  if (fs.existsSync(preloadPath)) {
    console.log('El archivo preload.js existe en:', preloadPath);
  } else {
    console.error('ERROR: No se encontró el archivo preload.js en:', preloadPath);
    // Intentar buscar en ubicaciones alternativas
    const altPreloadPath = path.resolve(process.cwd(), 'dist', 'preload.js');
    if (fs.existsSync(altPreloadPath)) {
      console.log('Preload encontrado en ruta alternativa');
      preloadPath = altPreloadPath;
    }
  }
  
  // Cerrar la ventana existente si por alguna razón todavía existe
  if (hockeyWindow) {
    try {
      hockeyWindow.destroy();
    } catch (error) {
      console.error('Error al cerrar ventana anterior:', error);
    }
    hockeyWindow = null;
  }
  
  // Opciones para BrowserWindow
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: windowWidth,
    height: windowHeight,
    x: Math.floor(screenWidth / 2 - windowWidth / 2),
    y: Math.floor(screenHeight / 2 - windowHeight / 2),
    title: finalConfig.title || 'Hockey Window',
    transparent: finalConfig.transparent !== undefined ? finalConfig.transparent : true,
    alwaysOnTop: finalConfig.alwaysOnTop !== undefined ? finalConfig.alwaysOnTop : true,
    frame: finalConfig.frame !== undefined ? finalConfig.frame : false,
    skipTaskbar: false,
    hasShadow: true,
    backgroundColor: finalConfig.backgroundColor || '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      devTools: isDev || finalConfig.devTools,
      sandbox: false
    },
    titleBarStyle: finalConfig.titleBarStyle || 'hidden',
    trafficLightPosition: finalConfig.showSystemButtons ? undefined : { x: -100, y: -100 }, // Mover los controles fuera de la vista si no se muestran
    titleBarOverlay: false
  };
  
  // Crear la nueva ventana
  hockeyWindow = new BrowserWindow(windowOptions);

  // En producción, forzar las dimensiones correctas
  if (!isDev) {
    setTimeout(() => {
      if (hockeyWindow) {
        hockeyWindow.setSize(finalConfig.width || 400, finalConfig.height || 600);
      }
    }, 200);
  }
  
  // Asegurarse de que la ventana sea movible
  hockeyWindow.setMovable(true);

  // Limpiar ventanas duplicadas al mostrar la ventana
  hockeyWindow.on('show', () => {
    console.log('Ventana hockey mostrada');
    closeAllDuplicateWindows();
  });

  // Limpiar ventanas duplicadas al redimensionar
  hockeyWindow.on('resize', () => {
    closeAllDuplicateWindows();
  });

  // Manejar el evento ready-to-show
  hockeyWindow.once('ready-to-show', () => {
    closeAllDuplicateWindows();
    
    // Forzar tamaño en producción
    if (!isDev && hockeyWindow) {
      hockeyWindow.setSize(finalConfig.width || 400, finalConfig.height || 600);
    }
  });

  // Cargar la última posición guardada
  const windowBounds = store.get('windowBounds');
  if (windowBounds) {
    hockeyWindow.setBounds(windowBounds as Electron.Rectangle);
    
    // Asegurar el ancho correcto si se cargó posición guardada y estamos en producción
    if (!isDev) {
      const bounds = hockeyWindow.getBounds();
      hockeyWindow.setBounds({...bounds, width: finalConfig.width || 400});
    }
  }

  // Guardar la posición cuando se mueva la ventana
  hockeyWindow.on('moved', () => {
    if (hockeyWindow) {
      store.set('windowBounds', hockeyWindow.getBounds());
    }
  });

  // En macOS, hacer que la ventana sea visible en todos los espacios de trabajo
  if (process.platform === 'darwin') {
    hockeyWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: false
    });
  }
  
  // Encontrar y cargar el archivo HTML
  const indexPath = path.join(distFolder, 'app', 'hockey.html');
  
  // Verificar si el archivo existe
  if (fs.existsSync(indexPath)) {
    console.log('El archivo HTML existe en:', indexPath);
    hockeyWindow.loadFile(indexPath);
  } else {
    console.error('ADVERTENCIA: El archivo HTML no existe en', indexPath);
    // Intentar buscar en otras ubicaciones
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
      // Cargar un HTML básico inline como último recurso
      hockeyWindow.loadURL('data:text/html;charset=utf-8,<html><body><h1>Error: No se encontró el archivo HTML</h1></body></html>');
    }
  }

  // Eventos de ventana para depuración
  hockeyWindow.webContents.on('did-finish-load', () => {
    console.log('La ventana ha terminado de cargar');
    
    // Abrir DevTools según la configuración
    if (isDev || finalConfig.devTools) {
      console.log('Abriendo DevTools');
      hockeyWindow?.webContents.openDevTools({ mode: 'right' });
    }
  });

  hockeyWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error al cargar la ventana:', errorCode, errorDescription);
  });

  // Configurar el comportamiento de cierre
  hockeyWindow.on('close', (event) => {
    console.log('Evento close en hockeyWindow');
    
    // En macOS, permitir el cierre normal
    if (process.platform === 'darwin') {
      console.log('Permitiendo cierre normal en macOS');
      return; // No prevenir el evento de cierre
    }
    
    // Para otras plataformas, prevenir el cierre y ocultar
    if (hockeyWindow && !hockeyWindow.isDestroyed()) {
      event.preventDefault();
      hideHockeyWindow();
    }
  });

  // Limpiar la referencia cuando se cierra la ventana
  hockeyWindow.on('closed', () => {
    console.log('Ventana hockey cerrada completamente');
    hockeyWindow = null;
  });

  // Manejar el evento de ocultar ventana
  hockeyWindow.on('hide', () => {
    console.log('Ventana hockey ocultada');
    closeAllDuplicateWindows();
  });

  return hockeyWindow;
};