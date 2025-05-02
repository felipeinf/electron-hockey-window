import React from 'react';
import ReactDOM from 'react-dom';
import Hockey from './app/hockey';

console.log('Iniciando HockeyPR... versión simplificada');

// Verificar acceso a localStorage
try {
  const testKey = '_test_localStorage_access';
  localStorage.setItem(testKey, 'test');
  localStorage.removeItem(testKey);
  console.log('✅ localStorage es accesible');
} catch (error) {
  console.error('❌ Error al acceder a localStorage:', error);
}

// Renderizar la aplicación
try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Error: No se pudo encontrar el elemento #root');
  } else {
    console.log('Renderizando aplicación...');
    ReactDOM.render(<Hockey />, rootElement);
  }
} catch (error) {
  console.error('Error al renderizar la aplicación:', error);
} 