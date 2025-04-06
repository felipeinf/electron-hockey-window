import React from 'react';
import ReactDOM from 'react-dom';
import Hockey from './hockey';

console.log('Iniciando HockeyPR... versión simplificada');

// Envolver el renderizado en un bloque try-catch para detectar errores
try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    document.body.innerHTML = `
      <div style="
        background: rgba(30, 30, 30, 0.9); 
        color: white; 
        padding: 20px; 
        font-family: sans-serif; 
        position: fixed; 
        top: 0; 
        left: 0; 
        right: 0; 
        bottom: 0; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center;
      ">
        <h2>Error: No se encontró el elemento root</h2>
        <p>La aplicación no puede iniciarse correctamente.</p>
      </div>
    `;
    console.error('Error: No se pudo encontrar el elemento #root');
  } else {
    console.log('Elemento root encontrado, renderizando app...');
    
    // Usar ReactDOM.render en lugar de createRoot para mayor compatibilidad
    ReactDOM.render(
      <Hockey />,
      rootElement
    );
    
    console.log('App renderizada correctamente');
  }
} catch (error: unknown) {
  console.error('Error al renderizar la aplicación:', error);
  
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  
  // Mostrar error en la interfaz
  document.body.innerHTML = `
    <div style="
      background: rgba(30, 30, 30, 0.9); 
      color: white; 
      padding: 20px; 
      font-family: sans-serif; 
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0;
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center;
    ">
      <h2>Error al iniciar la aplicación</h2>
      <p style="color: #ff6b6b;">${errorMessage}</p>
      <button onclick="window.location.reload()" style="
        background: #3498db; 
        color: white; 
        border: none; 
        padding: 8px 16px; 
        margin-top: 16px; 
        border-radius: 4px; 
        cursor: pointer;
      ">
        Reintentar
      </button>
    </div>
  `;
} 