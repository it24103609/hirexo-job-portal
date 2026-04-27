import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import GoogleAnalytics from './components/analytics/GoogleAnalytics';
import './styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleAnalytics />
      <AuthProvider>
        <App />
        <ToastContainer position="top-right" autoClose={2500} newestOnTop closeOnClick pauseOnHover />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
