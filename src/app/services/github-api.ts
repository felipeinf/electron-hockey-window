import { ipcRenderer } from 'electron';

/**
 * API para interactuar con GitHub desde el frontend
 */
export const githubAPI = {
  /**
   * Obtiene el token de GitHub almacenado
   * @returns Token de GitHub o cadena vacía si no hay token
   */
  getGithubToken: async (): Promise<string> => {
    console.log('Obteniendo token de GitHub usando API específica');
    try {
      const result = await ipcRenderer.invoke('github:get-token');
      console.log('Token obtenido:', result ? 'Valor no vacío' : 'Valor vacío');
      return result;
    } catch (error) {
      console.error('Error al obtener token de GitHub:', error);
      return '';
    }
  },

  /**
   * Guarda el token de GitHub
   * @param token Token de GitHub a guardar
   * @returns True si se guardó correctamente, false en caso de error
   */
  setGithubToken: async (token: string): Promise<boolean> => {
    console.log('Estableciendo token de GitHub usando API específica, token:', token ? 'Valor no vacío' : 'Valor vacío');
    try {
      const result = await ipcRenderer.invoke('github:set-token', token);
      console.log('Resultado de guardar token:', result);
      return result;
    } catch (error) {
      console.error('Error al establecer token de GitHub:', error);
      return false;
    }
  }
};

// Registrar las APIs en window.electron
export function registerGithubAPI() {
  if (window.electron) {
    // @ts-ignore - Extendemos window.electron dinámicamente
    window.electron.getGithubToken = githubAPI.getGithubToken;
    // @ts-ignore
    window.electron.setGithubToken = githubAPI.setGithubToken;
    console.log('APIs de GitHub registradas correctamente en window.electron');
  } else {
    console.error('No se pudo registrar la API de GitHub: window.electron no está disponible');
  }
} 