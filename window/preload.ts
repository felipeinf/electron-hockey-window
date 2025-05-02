import { contextBridge, ipcRenderer } from 'electron';

// Para depuración
console.log('Preload script ejecutado');

// Definir la API para exponer al renderer
const api = {
  // Control de ventana
  closeWindow: async () => {
    console.log('Solicitando cerrar ventana');
    return await ipcRenderer.invoke('window:close');
  },
  minimizeWindow: async () => {
    console.log('Solicitando minimizar ventana');
    return await ipcRenderer.invoke('window:minimize');
  },
  maximizeWindow: async () => {
    console.log('Solicitando maximizar ventana');
    return await ipcRenderer.invoke('window:maximize');
  },
  restoreWindow: async () => {
    console.log('Solicitando restaurar ventana');
    return await ipcRenderer.invoke('window:restore');
  },
  
  // Funcionalidad general que cualquier aplicación podría necesitar
  openExternal: async (url: string) => {
    console.log('Abriendo URL externa:', url);
    return await ipcRenderer.invoke('system:open-external', url);
  },
  
  // Almacenamiento persistente genérico
  getValue: async (key: string) => {
    console.log(`Preload: Obteniendo valor para clave: ${key}`);
    try {
      // Si la clave es githubToken, usar el handler específico
      if (key === 'githubToken') {
        const result = await ipcRenderer.invoke('github:get-token');
        console.log(`Preload: Token de GitHub obtenido:`, result ? "***" : "null/undefined");
        return result;
      }
      
      const result = await ipcRenderer.invoke('storage:get', key);
      console.log(`Preload: Valor obtenido para clave ${key}:`, result ? "***" : "null/undefined");
      return result;
    } catch (error) {
      console.error(`Preload: Error obteniendo valor para clave ${key}:`, error);
      return null;
    }
  },
  setValue: async (key: string, value: any) => {
    console.log(`Preload: Guardando valor para clave: ${key}`, value ? "***" : "null/undefined");
    try {
      // Si la clave es githubToken, usar el handler específico
      if (key === 'githubToken') {
        const result = await ipcRenderer.invoke('github:set-token', value);
        console.log(`Preload: Resultado de guardar token de GitHub:`, result);
        return result;
      }
      
      const result = await ipcRenderer.invoke('storage:set', key, value);
      console.log(`Preload: Resultado de guardar valor para clave ${key}:`, result);
      return result;
    } catch (error) {
      console.error(`Preload: Error guardando valor para clave ${key}:`, error);
      return false;
    }
  },
  removeValue: async (key: string) => {
    console.log(`Preload: Eliminando valor para clave: ${key}`);
    try {
      // Si la clave es githubToken, usar el handler específico
      if (key === 'githubToken') {
        const result = await ipcRenderer.invoke('github:set-token', null);
        console.log(`Preload: Resultado de eliminar token de GitHub:`, result);
        return result;
      }
      
      const result = await ipcRenderer.invoke('storage:remove', key);
      console.log(`Preload: Resultado de eliminar valor para clave ${key}:`, result);
      return result;
    } catch (error) {
      console.error(`Preload: Error eliminando valor para clave ${key}:`, error);
      return false;
    }
  }
};

// Log del objeto para verificar su estructura
console.log('API a exponer en window.electron:', Object.keys(api));

// Exponer las APIs
contextBridge.exposeInMainWorld('electron', api);

// Verificar que todo esté configurado correctamente
console.log('✅ Preload completado exitosamente');