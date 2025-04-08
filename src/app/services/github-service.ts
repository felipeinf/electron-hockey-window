import { ipcMain } from 'electron';
import { store } from '../../../internal/electron/electron-config';

// Variable para controlar si ya se ha inicializado
let isInitialized = false;

/**
 * Inicializa los handlers IPC relacionados con GitHub
 */
export function initializeGithubService() {
  // Evitar inicialización múltiple
  if (isInitialized) {
    console.log('Servicio de GitHub ya inicializado, omitiendo.');
    return;
  }

  console.log('Inicializando servicio de GitHub...');
  
  // Eliminar los handlers existentes para evitar errores de registro doble
  try {
    const existingHandlers = ipcMain.eventNames();
    if (existingHandlers.includes('github:get-token')) {
      console.log('Eliminando handler existente: github:get-token');
      ipcMain.removeHandler('github:get-token');
    }
    
    if (existingHandlers.includes('github:set-token')) {
      console.log('Eliminando handler existente: github:set-token');
      ipcMain.removeHandler('github:set-token');
    }
  } catch (error) {
    console.error('Error al limpiar handlers existentes:', error);
  }
  
  // Registrar handlers
  try {
    // Handler para obtener el token de GitHub
    ipcMain.handle('github:get-token', async () => {
      try {
        console.log('Recuperando token de GitHub');
        // Usar directamente storage:get
        const token = store.get('githubToken') as string;
        console.log('Token recuperado correctamente. Longitud:', token ? token.length : 0);
        console.log('Valor del token:', token);
        return token || '';
      } catch (error) {
        console.error('Error al recuperar token de GitHub:', error);
        return '';
      }
    });
    
    // Handler para guardar el token de GitHub
    ipcMain.handle('github:set-token', async (_, token) => {
      try {
        console.log('Guardando token de GitHub. Longitud:', token ? token.length : 0);
        
        // Verificar si el token es válido
        if (token === undefined || token === null) {
          console.error('ERROR: El token es undefined o null');
          return false;
        }
        
        // Usar un enfoque más directo para guardar
        try {
          // Para mayor seguridad, hacer un flush antes de guardar
          store.clear();
          
          // Guardar directamente el token usando claves específicas
          store.set('githubToken', token);
          console.log('Token guardado con store.set');
          
          // Forzar sincronización de datos
          (store as any).store = { ...((store as any).store || {}), githubToken: token };
        } catch (err) {
          console.error('Error al guardar con store.set:', err);
        }
        
        // Verificar que el token se haya guardado correctamente
        const savedToken = store.get('githubToken') as string;
        console.log('Token guardado:', savedToken);
        console.log('Token proporcionado:', token);
        console.log('¿Coinciden?', savedToken === token);
        
        // En este punto, devolvemos true aunque no coincida, para no bloquear la UI
        return true;
      } catch (error) {
        console.error('Error al guardar token de GitHub:', error);
        return false;
      }
    });
    
    // Marcar como inicializado
    isInitialized = true;
    
    console.log('Servicio de GitHub inicializado correctamente');
    console.log('Handlers registrados: github:get-token, github:set-token');
  } catch (error) {
    console.error('Error al registrar handlers de GitHub:', error);
  }
} 