import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import Login from './pages/studentManagement/Login';
import No404Page from './pages/studentManagement/404';
import Dashboard from './pages/studentManagement/Dashboard';
import Portfolio from './pages/home/portfolio';
import Resume from './pages/Resume'

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route exact path='/' element={<Portfolio />} />
          <Route path='/resume' element={<Resume />} />
          <Route path='/projects/studentManagement' element={<Login />} />
          <Route path='/projects/studentManagement/404' element={<No404Page />} />
          <Route path='/projects/studentManagement/dashboard' element={<Dashboard />} />
          <Route path="/projects/studentManagement/*" element={<Navigate to="/projects/studentManagement/404" />} />
        </Routes>
      </div>
    </Router>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
);