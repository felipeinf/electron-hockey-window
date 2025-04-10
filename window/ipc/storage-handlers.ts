import { ipcMain } from 'electron';
import { store } from './handlers';

// Registro de manejadores genéricos para operaciones de almacenamiento
export function registerStorageHandlers() {
  // Limpiar handlers existentes si los hubiera para evitar duplicados
  try {
    ['storage:get', 'storage:set', 'storage:remove'].forEach(channel => {
      if (ipcMain.eventNames().includes(channel)) {
        console.log(`Eliminando manejador existente para ${channel}`);
        ipcMain.removeHandler(channel);
      }
    });
  } catch (error) {
    console.error('Error al limpiar handlers de almacenamiento existentes:', error);
  }

  console.log("Registrando handlers IPC para almacenamiento genérico...");

  // Handler para obtener un valor
  ipcMain.handle('storage:get', async (_, key: string) => {
    try {
      console.log(`Recuperando valor para clave: ${key}`);
      const value = store.get(key);
      console.log(`Valor recuperado para ${key}:`, value ? '[Datos encontrados]' : 'null/undefined');
      return value || null; // Devolver null si no existe o es undefined
    } catch (error) {
      console.error(`Error al recuperar valor para clave ${key}:`, error);
      return null; // Devolver null en caso de error
    }
  });

  // Handler para guardar un valor
  ipcMain.handle('storage:set', async (_, key: string, value: any) => {
    try {
      console.log(`Guardando valor para clave: ${key}`);
      if (value === undefined) {
        console.error(`ERROR: Se intentó guardar un valor undefined para ${key}`);
        return false;
      }
      store.set(key, value); // Guardar el valor
      console.log(`Valor guardado exitosamente para ${key}`);
      return true; // Indicar éxito
    } catch (error) {
      console.error(`Error al guardar valor para clave ${key}:`, error);
      return false; // Indicar fallo
    }
  });

  // Handler para eliminar un valor
  ipcMain.handle('storage:remove', async (_, key: string) => {
    try {
      console.log(`Eliminando valor para clave: ${key}`);
      store.delete(key); // Eliminar la clave
      console.log(`Valor eliminado exitosamente para ${key}`);
      return true; // Indicar éxito
    } catch (error) {
      console.error(`Error al eliminar valor para clave ${key}:`, error);
      return false; // Indicar fallo
    }
  });

  console.log("✅ Handlers de almacenamiento registrados exitosamente.");
} 