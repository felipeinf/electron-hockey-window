import { app, BrowserWindow, globalShortcut, ipcMain, screen, shell } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import * as fs from 'fs';

// Hot Reload simple y directo
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

// Configuración de electron-store
const store = new Store({
  name: 'hockey-config',
  defaults: {
    'github-token': ''
  }
});

let hockeyWindow: BrowserWindow | null = null;

// Función para cerrar todas las ventanas duplicadas
const closeAllDuplicateWindows = () => {
  const allWindows = BrowserWindow.getAllWindows();
  // Filtrar ventanas que tengan características similares a la ventana hockey
  const hockeyWindows = allWindows.filter(win => 
    win.getBackgroundColor() === '#00000000' && 
    !win.isDestroyed() && 
    win !== hockeyWindow
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

// Función mejorada para ocultar la ventana
const hideHockeyWindow = () => {
  if (!hockeyWindow || hockeyWindow.isDestroyed()) return;
  
  console.log('Destruyendo ventana hockey en lugar de ocultarla');
  
  // Guardar la posición actual de la ventana
  const bounds = hockeyWindow.getBounds();
  store.set('windowBounds', bounds);
  
  // En lugar de ocultar, destruimos completamente la ventana
  try {
    hockeyWindow.destroy();
    hockeyWindow = null;
  } catch (error) {
    console.error('Error al destruir ventana:', error);
  }
  
  // Cerrar todas las ventanas que puedan quedar
  closeAllDuplicateWindows();
};

const createHockeyWindow = () => {
  // Cerrar ventanas duplicadas primero
  closeAllDuplicateWindows();
  
  if (hockeyWindow && !hockeyWindow.isDestroyed()) {
    hockeyWindow.show();
    hockeyWindow.focus();
    return;
  }

  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  // Registro para depuración
  console.log('Creando ventana Hockey');
  console.log('Resolución de pantalla:', width, 'x', height);
  
  const preloadPath = path.join(__dirname, '../preload/preload.js');
  console.log('Ruta del preload:', preloadPath);
  
  // Cerrar la ventana existente si por alguna razón todavía existe
  if (hockeyWindow) {
    try {
      hockeyWindow.destroy();
    } catch (error) {
      console.error('Error al cerrar ventana anterior:', error);
    }
    hockeyWindow = null;
  }
  
  hockeyWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: Math.floor(width / 2 - 200),
    y: Math.floor(height / 2 - 300),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      devTools: true,
      sandbox: false
    },
    titleBarStyle: 'customButtonsOnHover',
    trafficLightPosition: { x: 10, y: 10 }
  });

  // Asegurarse de que la ventana sea transparente de verdad
  hockeyWindow.setBackgroundColor('#00000000');
  
  // Asegurarse de que la ventana sea movible
  hockeyWindow.setMovable(true);

  // Limpiar ventanas fantasma al mostrar
  hockeyWindow.on('show', () => {
    console.log('Ventana hockey mostrada');
    // Eliminar ventanas fantasma
    closeAllDuplicateWindows();
  });

  // Limpiar ventanas fantasma al redimensionar
  hockeyWindow.on('resize', () => {
    closeAllDuplicateWindows();
  });

  // Manejar el evento ready-to-show
  hockeyWindow.once('ready-to-show', () => {
    closeAllDuplicateWindows();
  });

  // Cargar la última posición guardada
  const windowBounds = store.get('windowBounds');
  if (windowBounds) {
    hockeyWindow.setBounds(windowBounds as Electron.Rectangle);
  }

  // Guardar la posición cuando se mueva la ventana
  hockeyWindow.on('moved', () => {
    if (hockeyWindow) {
      store.set('windowBounds', hockeyWindow.getBounds());
    }
  });

  // Asegurarse de que la ventana permanezca visible en todos los espacios de trabajo
  if (process.platform === 'darwin') {
    hockeyWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: false
    });
  }

  console.log('Cargando archivo HTML:', path.join(__dirname, '../renderer/hockey.html'));
  hockeyWindow.loadFile(path.join(__dirname, '../renderer/hockey.html'));

  // Eventos de ventana para depuración
  hockeyWindow.webContents.on('did-finish-load', () => {
    console.log('La ventana ha terminado de cargar');
  });

  hockeyWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error al cargar la ventana:', errorCode, errorDescription);
  });

  // Ocultar en lugar de cerrar
  hockeyWindow.on('close', (event) => {
    console.log('Evento close en hockeyWindow');
    if (hockeyWindow && !hockeyWindow.isDestroyed()) {
      event.preventDefault();
      hideHockeyWindow();
    }
  });

  // Añadir log para verificar si la ventana se cierra
  hockeyWindow.on('closed', () => {
    console.log('Ventana hockey cerrada completamente');
    hockeyWindow = null;
  });

  // Manejar ocultar ventana
  hockeyWindow.on('hide', () => {
    console.log('Ventana hockey ocultada');
    // Cerrar ventanas fantasma
    closeAllDuplicateWindows();
  });

  // Manejar evento hide para macOS
  if (process.platform === 'darwin') {
    app.on('browser-window-blur', () => {
      if (hockeyWindow && !hockeyWindow.isDestroyed() && hockeyWindow.isVisible()) {
        // No hacer nada especial por ahora, solo loggear
        console.log('Ventana perdió el foco');
      }
    });
  }
};

// IPC handlers para comunicación con el renderer
ipcMain.handle('get-github-token', (event) => {
  console.log('Procesando solicitud get-github-token desde:', event.sender.getURL());
  try {
    const token = store.get('github-token') as string;
    if (!token) {
      console.log('Token no encontrado');
      return '';
    }
    console.log('Token recuperado: Existe (longitud: ' + token.length + ')');
    return token;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return '';
  }
});

ipcMain.handle('set-github-token', (_, token) => {
  try {
    console.log('Guardando token de longitud:', token ? token.length : 0);
    store.set('github-token', token);
    console.log('Token guardado correctamente');
    return true;
  } catch (error) {
    console.error('Error al guardar el token:', error);
    return false;
  }
});

ipcMain.handle('open-external', async (_, url) => {
  try {
    console.log('Abriendo URL externa:', url);
    await shell.openExternal(url);
    console.log('URL abierta correctamente');
    return true;
  } catch (error) {
    console.error('Error al abrir URL externa:', error);
    return false;
  }
});

app.whenReady().then(() => {
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
  // Primero cerrar ventanas duplicadas
  closeAllDuplicateWindows();
  
  if (!hockeyWindow || hockeyWindow.isDestroyed()) {
    createHockeyWindow();
  } else if (!hockeyWindow.isVisible()) {
    hockeyWindow.show();
    hockeyWindow.focus();
  }
}); 