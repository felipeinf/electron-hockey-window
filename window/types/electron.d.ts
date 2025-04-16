/**
 * Interfaces y tipos para la API de Electron
 */

// Declaración de la API de Electron que se expone al renderer
export interface ElectronApi {
  getValue: <T>(key: string) => Promise<T | null>;
  setValue: <T>(key: string, value: T) => Promise<boolean>;
  removeValue: (key: string) => Promise<boolean>;
  openExternal: (url: string) => Promise<boolean>;
  closeWindow: () => Promise<boolean>;
  minimizeWindow: () => Promise<boolean>;
  maximizeWindow: () => Promise<boolean>;
  restoreWindow: () => Promise<boolean>;
  getGithubToken: () => Promise<string>;
  setGithubToken: (token: string) => Promise<boolean>;
}

// Declaración global para que TypeScript reconozca window.electron
declare global {
  interface Window {
    electron: ElectronApi;
  }
} 