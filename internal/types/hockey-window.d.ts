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

// Configuración base de Hockey Window
export interface HockeyWindowBaseConfig {
  // Configuración esencial que no debe ser modificada
  nodeIntegration: boolean;
  contextIsolation: boolean;
  sandbox: boolean;
  preload: string;
}

// Configuración completa de Hockey Window
export interface HockeyWindowConfig extends HockeyWindowBaseConfig {
  // Opciones personalizables
  title?: string; // Título de la ventana
  width?: number; // Ancho de la ventana
  height?: number; // Alto de la ventana
  transparent?: boolean; // Si la ventana debe ser transparente
  alwaysOnTop?: boolean; // Si la ventana debe estar siempre en primer plano
  shortcutKey: string; // Atajo de teclado (por defecto CommandOrControl+Shift+H)
  showSystemButtons?: boolean; // Mostrar botones del sistema operativo
  backgroundColor?: string; // Color de fondo (útil con transparent: false)
  roundedCorners?: boolean; // Si la ventana debe tener esquinas redondeadas
  frame?: boolean; // Si debe mostrar el marco estándar del SO
  titleBarStyle?: 'default' | 'hidden' | 'hiddenInset'; // Estilo de la barra de título en macOS
  vibrancy?: 'appearance-based' | 'light' | 'dark' | 'titlebar' | 'selection' | 'menu' | 'popover' | 'sidebar' | 'medium-light' | 'ultra-dark' | 'header' | 'sheet' | 'window' | 'hud' | 'fullscreen-ui' | 'tooltip' | 'content' | 'under-window' | 'under-page'; // Efecto vibrancy en macOS
  devTools?: boolean; // Si debe mostrar las herramientas de desarrollo en modo producción
}

// Configuración completa de la aplicación
export interface AppConfig {
  window: HockeyWindowConfig;
}

// Declaración global para que TypeScript reconozca window.electron
declare global {
  interface Window {
    electron: HockeyWindowAPI;
  }
} 