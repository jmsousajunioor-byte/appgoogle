import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { initToolbar } from '@21st-extension/toolbar';
import App from './App';
import './index.css';

const stagewiseConfig = {
  plugins: [],
};

let toolbarInitialized = false;
function setupStagewise() {
  // Inicializa somente em ambiente de desenvolvimento e com flag explícita
  const enabled = import.meta.env.VITE_TOOLBAR_ENABLE === 'true';
  if (!toolbarInitialized && import.meta.env.DEV && enabled) {
    try {
      initToolbar(stagewiseConfig);
      toolbarInitialized = true;
    } catch (err) {
      // Evita erros de descoberta/ping poluírem o console
      console.warn('[toolbar] desabilitado em dev:', err instanceof Error ? err.message : String(err));
    }
  }
}

setupStagewise();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Não foi possível encontrar o elemento root para montar');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
