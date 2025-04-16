import { contextBridge, ipcRenderer } from 'electron';
import { ElectronApi } from './types/electron';

// Para depuración
console.log('Hockey Window Framework: Preload script iniciado');

/**
 * API de puente entre el proceso de renderizado y el proceso principal.
 * Proporciona funciones para acceder a capacidades nativas de Electron de forma segura.
 */
const api: HockeyWindowAPI = {
  /**
   * API de almacenamiento persistente
   */
  getValue: async <T>(key: string): Promise<T | null> => {
    console.log(`[Preload] Obteniendo valor para clave: ${key}`);
    return await ipcRenderer.invoke('storage:get', key);
  },
  
  setValue: async <T>(key: string, value: T): Promise<boolean> => {
    console.log(`[Preload] Guardando valor para clave: ${key}`);
    return await ipcRenderer.invoke('storage:set', key, value);
  },
  
  removeValue: async (key: string): Promise<boolean> => {
    console.log(`[Preload] Eliminando valor para clave: ${key}`);
    return await ipcRenderer.invoke('storage:remove', key);
  },
  
  /**
   * API del sistema
   */
  openExternal: async (url: string): Promise<boolean> => {
    console.log(`[Preload] Abriendo URL externa: ${url}`);
    return await ipcRenderer.invoke('system:open-external', url);
  },
  
  /**
   * API de la ventana
   */
  closeWindow: async (): Promise<boolean> => {
    console.log('[Preload] Solicitando cerrar ventana');
    return await ipcRenderer.invoke('window:close');
  },
  
  minimizeWindow: async (): Promise<boolean> => {
    console.log('[Preload] Solicitando minimizar ventana');
    return await ipcRenderer.invoke('window:minimize');
  },
  
  maximizeWindow: async (): Promise<boolean> => {
    console.log('[Preload] Solicitando maximizar/restaurar ventana');
    return await ipcRenderer.invoke('window:maximize');
  },
  
  restoreWindow: async (): Promise<boolean> => {
    console.log('[Preload] Solicitando restaurar ventana minimizada');
    return await ipcRenderer.invoke('window:restore');
  },
  
  getGithubToken: async (): Promise<string> => {
    console.log('[Preload] Solicitando token de GitHub (compatibilidad)');
    return await ipcRenderer.invoke('github:get-token');
  },
  
  setGithubToken: async (token: string): Promise<boolean> => {
    console.log('[Preload] Guardando token de GitHub (compatibilidad)');
    return await ipcRenderer.invoke('github:set-token', token);
  }
};

// Log del objeto para verificar su estructura
console.log('[Preload] API a exponer en window.electron:', Object.keys(api));

// Exponer las APIs al proceso de renderizado
contextBridge.exposeInMainWorld('electron', api);

// Verificar que todo esté configurado correctamente
console.log('✅ Hockey Window Framework: Preload completado exitosamente');