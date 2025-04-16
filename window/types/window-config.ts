// Interfaces y tipos para la configuración de la ventana Hockey

/**
 * Configuración de la ventana Hockey
 */
export interface HockeyWindowConfig {
  title?: string; // Título de la ventana
  width?: number; // Ancho de la ventana
  height?: number; // Alto de la ventana
  transparent?: boolean; // Si la ventana debe ser transparente
  alwaysOnTop?: boolean; // Si la ventana debe estar siempre en primer plano
  shortcutKey?: string; // Atajo de teclado (por defecto CommandOrControl+Shift+H)
  showSystemButtons?: boolean; // Mostrar botones del sistema operativo
  // Opciones adicionales para futura extensibilidad
  backgroundColor?: string; // Color de fondo (útil con transparent: false)
  roundedCorners?: boolean; // Si la ventana debe tener esquinas redondeadas
  frame?: boolean; // Si debe mostrar el marco estándar del SO
  titleBarStyle?: 'default' | 'hidden' | 'hiddenInset'; // Estilo de la barra de título en macOS
  vibrancy?: 'appearance-based' | 'light' | 'dark' | 'titlebar' | 'selection' | 'menu' | 'popover' | 'sidebar' | 'medium-light' | 'ultra-dark' | 'header' | 'sheet' | 'window' | 'hud' | 'fullscreen-ui' | 'tooltip' | 'content' | 'under-window' | 'under-page'; // Efecto vibrancy en macOS
  devTools?: boolean; // Si debe mostrar las herramientas de desarrollo en modo producción
}

/**
 * Configuración completa de la aplicación
 */
export interface AppConfig {
  window: HockeyWindowConfig;
} 