import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import Login from './pages/studentManagement/Login';
import StudentManagementNo404Page from './pages/studentManagement/StudentManagementNo404Page';
import Dashboard from './pages/studentManagement/Dashboard';
import Error404 from './pages/Error404';
import Home from './pages/home/Home';
import Resume from './pages/Resume'
import DsaShit from './pages/dsaShit/dsaShit'
import Projects from './pages/Projects'

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route exact path='/' element={<Home />} />
          <Route path='/404' element={<Error404 />} />
          <Route path='/resume' element={<Resume />} />
          <Route path='/projects' element={<Projects />} />
          <Route path='/projects/dsaShit' element={<DsaShit />} />
          <Route path='/projects/studentManagement' element={<Login />} />
          <Route path='/projects/studentManagement/404' element={<StudentManagementNo404Page />} />
          <Route path='/projects/studentManagement/dashboard' element={<Dashboard />} />
          <Route path="/projects/studentManagement/*" element={<Navigate to="/projects/studentManagement/404" />} />
          <Route path="*" element={<Navigate to="/404" />} />
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