import { ipcMain } from 'electron';

export interface ServiceLoader {
  initialize: () => void;
  name: string;
}

// Registro de todos los servicios disponibles en la aplicación
export const services: ServiceLoader[] = [
];

/**
 * Inicializa todos los servicios registrados
 */
export function initializeAllServices() {
  console.log(`Cargando ${services.length} servicios...`);
  
  services.forEach(service => {
    try {
      console.log(`Inicializando servicio: ${service.name}`);
      service.initialize();
      console.log(`Servicio ${service.name} inicializado correctamente`);
    } catch (error) {
      console.error(`Error al inicializar servicio ${service.name}:`, error);
    }
  });
  
  console.log('Todos los servicios inicializados');
  console.log('Handlers IPC registrados:', ipcMain.eventNames());
} 