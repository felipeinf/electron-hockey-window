import React from 'react';
import ReactDOM from 'react-dom/client';
import Hockey from './hockey';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Hockey />
  </React.StrictMode>
); 