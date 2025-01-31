import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './component/Layout';
import LoginPage from './component/LoginPage';
import Dashboard from './component/Dashboard';
import Analytics from './component/Analytics';
import Links from './component/Links';
import Settings from './component/Settings';
import { getUser } from './services/authService';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout user={user}>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="links" element={<Links />} />
                  <Route path="settings" element={<Settings user={user} />} />
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;