/**
 * Interfaces y tipos para la API de Hockey Window
 */

// API principal expuesta al renderer
export interface HockeyWindowAPI {
  // API de almacenamiento
  getValue: <T>(key: string) => Promise<T | null>;
  setValue: <T>(key: string, value: T) => Promise<boolean>;
  removeValue: (key: string) => Promise<boolean>;
  
  // API del sistema
  openExternal: (url: string) => Promise<boolean>;
  
  // API de la ventana
  closeWindow: () => Promise<boolean>;
  minimizeWindow: () => Promise<boolean>;
  maximizeWindow: () => Promise<boolean>;
  restoreWindow: () => Promise<boolean>;
}

// Declaración global para que TypeScript reconozca window.electron
declare global {
  interface Window {
    electron: HockeyWindowAPI;
  }
} 