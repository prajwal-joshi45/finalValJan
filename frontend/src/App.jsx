import React from 'react';
import LoginPage from './component/LoginPage';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './component/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/" element={<Navigate to="/login" replace />} />     
      </Routes>
    </Router>
  );
}

export default App;