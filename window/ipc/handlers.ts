import { ipcMain } from 'electron';
import ElectronStore from 'electron-store';

// Instancia de almacenamiento genérico
export const store = new ElectronStore({ name: 'hockey-app-storage', clearInvalidConfig: true });

// Handlers genéricos para almacenamiento
export function registerStorageHandlers() {
  console.log("Registrando handlers IPC para almacenamiento...");

  // Handler para obtener valor
  ipcMain.handle('storage:get', async (_, key: string) => {
    try {
      console.log(`Recuperando valor para clave: ${key}`);
      const value = store.get(key);
      console.log(`Valor recuperado (${key}), tipo:`, typeof value);
      return value;
    } catch (error) {
      console.error(`Error al recuperar valor para clave ${key}:`, error);
      return null;
    }
  });

  // Handler para guardar valor
  ipcMain.handle('storage:set', async (_, key: string, value: any) => {
    try {
      console.log(`Guardando valor para clave: ${key}`);
      store.set(key, value);
      return true;
    } catch (error) {
      console.error(`Error al guardar valor para clave ${key}:`, error);
      return false;
    }
  });

  // Handler para eliminar valor
  ipcMain.handle('storage:remove', async (_, key: string) => {
    try {
      console.log(`Eliminando valor para clave: ${key}`);
      store.delete(key);
      return true;
    } catch (error) {
      console.error(`Error al eliminar valor para clave ${key}:`, error);
      return false;
    }
  });

  console.log("✅ Handlers de almacenamiento registrados exitosamente.");
}
