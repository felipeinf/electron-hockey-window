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
    console.log(`Obteniendo valor para clave: ${key}`);
    return await ipcRenderer.invoke('storage:get', key);
  },
  setValue: async (key: string, value: any) => {
    console.log(`Guardando valor para clave: ${key}`);
    return await ipcRenderer.invoke('storage:set', key, value);
  },
  removeValue: async (key: string) => {
    console.log(`Eliminando valor para clave: ${key}`);
    return await ipcRenderer.invoke('storage:remove', key);
  }
};

// Log del objeto para verificar su estructura
console.log('API a exponer en window.electron:', Object.keys(api));

// Exponer las APIs
contextBridge.exposeInMainWorld('electron', api);

// Verificar que todo esté configurado correctamente
console.log('✅ Preload completado exitosamente');