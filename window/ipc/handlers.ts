import { ipcMain } from 'electron';
import ElectronStore from 'electron-store';

// Instancia de almacenamiento genérico (podría venir de otro lado si se centraliza)
// Si no, asegúrate que el nombre sea consistente si tienes varias instancias
export const store = new ElectronStore({ name: 'hockey-app-storage', clearInvalidConfig: true });

// Handlers específicos de GitHub
export function registerGitHubHandlers() {
  // Limpiar handlers existentes si los hubiera para evitar duplicados
  try {
    if (ipcMain.eventNames().includes('github:get-token')) {
       console.log("Removing existing handler for github:get-token");
       ipcMain.removeHandler('github:get-token');
    }
    if (ipcMain.eventNames().includes('github:set-token')) {
        console.log("Removing existing handler for github:set-token");
        ipcMain.removeHandler('github:set-token');
    }
  } catch (error) {
    console.error('Error al limpiar handlers de GitHub existentes:', error);
  }

  console.log("Registrando handlers IPC para GitHub...");

  // Registrar handlers para GitHub
  // Handler para obtener token
  ipcMain.handle('github:get-token', async () => {
    const key = 'githubToken'; // Clave específica para el token
    try {
      console.log(`Recuperando valor para clave: ${key}`);
      const token = store.get(key) as string;
      console.log(`Token recuperado (${key}), longitud:`, token ? token.length : 0);
      return token || ''; // Devolver vacío si no existe o es nulo
    } catch (error) {
      console.error(`Error al recuperar valor para clave ${key}:`, error);
      return ''; // Devolver vacío en caso de error
    }
  });

  // Handler para guardar token
  ipcMain.handle('github:set-token', async (_, token: string | null) => {
    const key = 'githubToken'; // Clave específica para el token
    try {
      console.log(`Guardando valor para clave: ${key}. Longitud:`, token ? token.length : 'null/undefined');
      if (token === undefined) { // Permitir null para borrar, pero no undefined
        console.error(`ERROR: Se intentó guardar un token undefined para ${key}`);
        return false;
      }
      store.set(key, token); // Guardar el token (o null para borrar)
      // Verificar si se guardó (opcional pero bueno para debug)
      const saved = store.get(key);
      console.log(`Verificación post-guardado (${key}):`, saved === token);
      return true; // Indicar éxito
    } catch (error) {
      console.error(`Error al guardar valor para clave ${key}:`, error);
      return false; // Indicar fallo
    }
  });

  console.log("✅ Handlers de GitHub registrados exitosamente.");
}
