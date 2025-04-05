import { contextBridge, ipcRenderer } from 'electron';

// Exponer funciones seguras al proceso de renderizado
contextBridge.exposeInMainWorld(
  'electron',
  {
    getGithubToken: () => ipcRenderer.invoke('get-github-token'),
    setGithubToken: (token: string) => ipcRenderer.invoke('set-github-token', token)
  }
); 