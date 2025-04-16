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
  // APIs específicas de GitHub - añadidas directamente para evitar problemas
  getGithubToken: async () => {
    console.log('Solicitando token de GitHub desde preload');
    return await ipcRenderer.invoke('github:get-token');
  },
  setGithubToken: async (token: string) => {
    console.log('Guardando token de GitHub desde preload:', token ? 'Valor no vacío' : 'Valor vacío');
    return await ipcRenderer.invoke('github:set-token', token);
  }
};

// Log del objeto para verificar su estructura
console.log('API a exponer en window.electron:', Object.keys(api));

// Exponer las APIs
contextBridge.exposeInMainWorld('electron', api);

// Verificar que todo esté configurado correctamente
console.log('✅ Preload completado exitosamente'); 