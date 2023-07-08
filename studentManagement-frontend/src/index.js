import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import No404Page from './pages/404';
import Dashboard from './pages/Dashboard';

function App() {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="*" element={<Navigate to="/404" state={{ from: location.pathname }} />}/>
      <Route path="/404" element={<No404Page />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);