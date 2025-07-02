import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CandidateForm from './components/CandidateForm';
import CandidateList from './components/CandidateList';
import Analytics from './components/Analytics';
import Navbar from './components/Navbar';
import NotFound from './pages/NotFound';

// Ensure default admin exists on app load
const ensureDefaultAdmin = () => {
  if (typeof window === 'undefined') return;
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('users') || '[]');
  } catch {
    users = [];
  }
  const adminExists = users.some(u => u.email === 'admin@gmail.com' && u.role === 'admin');
  if (!adminExists) {
    users.push({
      id: '1',
      name: 'Hari',
      email: 'admin@gmail.com',
      password: 'Hari@9652',
      role: 'admin'
    });
    localStorage.setItem('users', JSON.stringify(users));
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureDefaultAdmin(); // Always create admin on app load
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={logout} />}
        <div className="container">
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/dashboard" /> : <Register onRegister={login} />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/candidate-form" 
              element={user ? <CandidateForm user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/candidates" 
              element={user && (user.role === 'admin' || user.role === 'lead') ? 
                <CandidateList user={user} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/analytics" 
              element={user && (user.role === 'admin' || user.role === 'lead') ? 
                <Analytics user={user} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App; 
