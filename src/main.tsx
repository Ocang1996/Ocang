import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './lib/ThemeContext';
import { EmployeeProvider } from './lib/EmployeeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <EmployeeProvider>
          <App />
        </EmployeeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);