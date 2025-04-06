import { contextBridge, ipcRenderer } from 'electron';

// Para depuración
console.log('Preload script ejecutado');

// Función para verificar si un valor es una promesa
const isPromise = (obj: any): boolean => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

// Implementaciones seguras
const safeGetGithubToken = async () => {
  console.log('Solicitando token desde preload');
  try {
    const token = await ipcRenderer.invoke('get-github-token');
    console.log('Token obtenido desde IPC:', token ? `Existe (${token.length} caracteres)` : 'No existe');
    return token;
  } catch (err) {
    console.error('Error en preload al obtener token:', err);
    throw err;
  }
};

const safeSetGithubToken = async (token: string) => {
  console.log('Guardando token desde preload');
  try {
    return await ipcRenderer.invoke('set-github-token', token);
  } catch (err) {
    console.error('Error en preload al guardar token:', err);
    throw err;
  }
};

const safeOpenExternal = async (url: string) => {
  console.log('Abriendo URL externa:', url);
  try {
    return await ipcRenderer.invoke('open-external', url);
  } catch (err) {
    console.error('Error en preload al abrir URL externa:', err);
    throw err;
  }
};

// Configuración de API segura para exponer funciones al renderer
contextBridge.exposeInMainWorld('electron', {
  getGithubToken: safeGetGithubToken,
  setGithubToken: safeSetGithubToken,
  openExternal: safeOpenExternal
});

// Verificar que las funciones trabajan correctamente
safeGetGithubToken()
  .then(token => console.log('Verificación inicial de token completada, token existe:', !!token))
  .catch(err => console.error('Error en verificación inicial de token:', err)); 