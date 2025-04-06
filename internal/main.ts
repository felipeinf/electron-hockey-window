/**
 * Punto de entrada principal para la aplicación Electron
 * Solo maneja la inicialización básica de la aplicación
 */

import { app } from 'electron';
import { initializeApp } from './electron/electron-config';

// Configurar modo de desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Aplicación iniciada en modo DESARROLLO');
  
  // Habilitar DevTools en desarrollo
  app.whenReady().then(() => {
    // Instalar extensiones de desarrollo si es necesario
    try {
      // En una aplicación real, aquí podrías instalar extensiones para Redux, React, etc.
      console.log('Listo para extensiones de desarrollo');
    } catch (e) {
      console.error('Error al configurar entorno de desarrollo:', e);
    }
  });
} else {
  console.log('Aplicación iniciada en modo PRODUCCIÓN');
  
  // Deshabilitar DevTools en producción
  app.on('browser-window-created', (_, window) => {
    window.webContents.on('devtools-opened', () => {
      window.webContents.closeDevTools();
    });
  });
}

// Inicializar la aplicación
initializeApp();

// Emitir mensaje cuando la aplicación esté lista
console.log('Aplicación Electron inicializada correctamente');

// Configuración para evitar múltiples instancias
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Ya existe otra instancia de la aplicación, cerrando...');
  app.quit();
} else {
  app.on('second-instance', () => {
    console.log('Intento de abrir segunda instancia, enfocando ventana existente');
    // La lógica de enfocar la ventana existente está en electron-config.ts
  });
} 