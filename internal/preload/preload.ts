import { contextBridge, ipcRenderer } from 'electron';

// Para depuración
console.log('Preload script ejecutado');

// API básica independiente de la aplicación
const windowAPI = {
  // Control de la ventana
  closeWindow: async () => {
    console.log('Solicitando cerrar ventana');
    return await ipcRenderer.invoke('window:close');
  },
  minimizeWindow: async () => {
    console.log('Solicitando minimizar ventana');
    return await ipcRenderer.invoke('window:minimize');
  },
  // Funcionalidad general que cualquier aplicación podría necesitar
  openExternal: async (url: string) => {
    console.log('Abriendo URL externa:', url);
    return await ipcRenderer.invoke('system:open-external', url);
  }
};

// API para almacenamiento persistente (genérico)
const storageAPI = {
  // Almacenamiento persistente genérico
  getValue: async (key: string) => {
    console.log(`Obteniendo valor para clave: ${key}`);
    return await ipcRenderer.invoke('storage:get', key);
  },
  setValue: async (key: string, value: any) => {
    console.log(`Guardando valor para clave: ${key}`);
    return await ipcRenderer.invoke('storage:set', key, value);
  }
};

// APIs específicas para GitHub
const githubAPI = {
  // Método específico para token de GitHub
  getGithubToken: async () => {
    console.log('Obteniendo token de GitHub usando API específica');
    return await ipcRenderer.invoke('storage:get', 'github-token');
  },
  setGithubToken: async (token: string) => {
    console.log('Estableciendo token de GitHub usando API específica');
    return await ipcRenderer.invoke('storage:set', 'github-token', token);
  }
};

// Objeto completo para exponer
const electronBridgeAPI = {
  ...windowAPI,
  ...storageAPI,
  ...githubAPI
};

// Log del objeto para verificar su estructura
console.log('API a exponer en window.electron:', Object.keys(electronBridgeAPI));

// Exponer las APIs
contextBridge.exposeInMainWorld('electron', electronBridgeAPI);

// Verificar que todo esté configurado correctamente
console.log('✅ Preload completado exitosamente'); 