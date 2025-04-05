import { contextBridge, ipcRenderer } from 'electron';
import Store from 'electron-store';

interface StoreSchema {
  'github-token': string;
}

const store = new Store<StoreSchema>();

// Exponer funciones seguras al proceso de renderizado
contextBridge.exposeInMainWorld(
  'electron',
  {
    getGithubToken: () => ipcRenderer.invoke('get-github-token'),
    setGithubToken: (token: string) => ipcRenderer.invoke('set-github-token', token)
  }
); 