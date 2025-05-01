// Cliente para aplicaciones Hockey Window
import { HockeyWindowAPI } from '../internal/types/hockey-window';

// Verificar que estemos en un entorno Hockey Window
const isHockeyWindowAvailable = (): boolean => {
  // Comprueba si el objeto 'electron' existe en el objeto 'window'
  return typeof window !== 'undefined' && window.electron !== undefined;
};

// API cliente bien tipada y con manejo de errores básico
export const HockeyWindowClient = {
  // API de almacenamiento persistente
  storage: {
    /**
     * Obtiene un valor del almacenamiento persistente.
     * Devuelve null si no está disponible o si ocurre un error.
     */
    getValue: async <T>(key: 'windowBounds' | 'githubToken'): Promise<T | null> => {
      if (!isHockeyWindowAvailable()) {
        console.warn('Hockey Window no disponible, no se puede obtener el valor:', key);
        return null;
      }
      try {
        // Llama a la función expuesta en preload.ts
        const value = await window.electron.getValue<T>(key);
        return value;
      } catch (error) {
        console.error(`Error obteniendo valor para la clave "${key}":`, error);
        return null;
      }
    },

    /**
     * Guarda un valor en el almacenamiento persistente.
     * Devuelve true si se guarda correctamente, false en caso contrario.
     */
    setValue: async <T>(key: 'windowBounds' | 'githubToken', value: T): Promise<boolean> => {
      if (!isHockeyWindowAvailable()) {
        console.warn('Hockey Window no disponible, no se puede guardar el valor:', key);
        return false;
      }
      try {
        // Llama a la función expuesta en preload.ts
        const success = await window.electron.setValue<T>(key, value);
        return success;
      } catch (error) {
        console.error(`Error guardando valor para la clave "${key}":`, error);
        return false;
      }
    },

    /**
     * Elimina un valor del almacenamiento persistente.
     * Devuelve true si se elimina correctamente, false en caso contrario.
     */
    removeValue: async (key: 'windowBounds' | 'githubToken'): Promise<boolean> => {
      if (!isHockeyWindowAvailable()) {
        console.warn('Hockey Window no disponible, no se puede eliminar el valor:', key);
        return false;
      }
      try {
        // Llama a la función expuesta en preload.ts
        const success = await window.electron.removeValue(key);
        return success;
      } catch (error) {
        console.error(`Error eliminando valor para la clave "${key}":`, error);
        return false;
      }
    },
  },

  // API del sistema (ej. abrir enlaces externos)
  system: {
    /**
     * Abre una URL en el navegador predeterminado del sistema.
     * No hace nada si Hockey Window no está disponible.
     */
    openExternal: async (url: string): Promise<void> => {
      if (!isHockeyWindowAvailable()) {
        console.warn('Hockey Window no disponible, no se puede abrir enlace externo:', url);
        return;
      }
      try {
        // Llama a la función expuesta en preload.ts
        await window.electron.openExternal(url);
      } catch (error) {
        console.error(`Error abriendo enlace externo "${url}":`, error);
      }
    },
  },

  // API de la ventana (ej. cerrar, minimizar)
  window: {
    /**
     * Cierra la ventana actual de la aplicación.
     * No hace nada si Hockey Window no está disponible.
     */
    close: async (): Promise<void> => {
      if (!isHockeyWindowAvailable()) {
        console.warn('Hockey Window no disponible, no se puede cerrar la ventana.');
        return;
      }
      try {
         // Llama a la función expuesta en preload.ts
        await window.electron.closeWindow();
      } catch (error) {
        console.error('Error cerrando la ventana:', error);
      }
    },

    /**
     * Minimiza la ventana actual de la aplicación.
     * No hace nada si Hockey Window no está disponible.
     */
    minimize: async (): Promise<void> => {
       if (!isHockeyWindowAvailable()) {
        console.warn('Hockey Window no disponible, no se puede minimizar la ventana.');
        return;
      }
      try {
         // Llama a la función expuesta en preload.ts
        await window.electron.minimizeWindow();
      } catch (error) {
        console.error('Error minimizando la ventana:', error);
      }
    },
  },
};

// Mantener compatibilidad con nombre anterior
export const ElectronClient = HockeyWindowClient;

// Exporta la función de verificación por si se necesita externamente
export { isHockeyWindowAvailable };
