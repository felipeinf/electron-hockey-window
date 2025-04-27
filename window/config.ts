// Hockey Window Configuration
import { HockeyWindowConfig } from '../internal/types/hockey-window';
import * as path from 'path';

// Configuración base (no personalizable)
const baseConfig = {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: false,
  preload: path.join(__dirname, 'preload.js')
};

// Configuración de la ventana
// Modifica solo los valores que necesites cambiar
export const windowConfig: HockeyWindowConfig = {
  ...baseConfig,
  title: "Hockey PR",
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

// Exportar la configuración como valor predeterminado
export default windowConfig;
