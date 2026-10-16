import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AtelierProvider } from './context/AtelierContext';
import { ROUTER_BASENAME } from './data/tenant';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={ROUTER_BASENAME}>
      <AtelierProvider>
        <App />
      </AtelierProvider>
    </BrowserRouter>
  </React.StrictMode>
);