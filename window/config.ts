// Hockey Window Configuration
import { HockeyWindowConfig } from './types/window-config';

// Configuración predeterminada
export const defaultConfig: HockeyWindowConfig = {
  title: "Hockey Window",
  width: 400,
  height: 600,
  transparent: true,
  alwaysOnTop: true,
  shortcutKey: "CommandOrControl+Shift+H",
  showSystemButtons: false,
  backgroundColor: "#00000000", // Transparente
  roundedCorners: true,
  frame: false,
  titleBarStyle: 'hidden',
  devTools: false
};

// Configuración específica de la aplicación
// Esta es la que el usuario debe modificar para personalizar su aplicación
export const appConfig: HockeyWindowConfig = {
  title: "Hockey PR",
  width: 400,
  height: 600,
  transparent: true,
  alwaysOnTop: true,
  showSystemButtons: false,
  backgroundColor: "#121212"
};

// Configuración final que combina los valores predeterminados con los específicos de la aplicación
export const finalConfig: HockeyWindowConfig = getConfig(appConfig);

// Función para combinar configuración personalizada con la predeterminada
export function getConfig(userConfig?: Partial<HockeyWindowConfig>): HockeyWindowConfig {
  return { ...defaultConfig, ...userConfig };
}

// Exportar la configuración final como valor predeterminado para facilitar su importación
export default finalConfig;
