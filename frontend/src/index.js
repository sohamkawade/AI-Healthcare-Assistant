import React from 'react';
import ReactDOM from 'react-dom'; // No 'client' for older versions
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
