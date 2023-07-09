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
      <Route path='/projects/studentManagement' element={<Login />} />
      <Route path='/projects/studentManagement/404' element={<No404Page />} />
      <Route path='/projects/studentManagement/dashboard' element={<Dashboard />} />
      <Route path='/projects/studentManagement/*' element={<Navigate to="/404" state={{ from: location.pathname }} />}/>
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