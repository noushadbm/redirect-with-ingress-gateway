import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import './App.css';

function RedirectToLogin() {
  const location = useLocation();
  return <Navigate to={`/login${location.search}`} replace />;
}

function App() {
  return (
    <Router basename="/gateway/sso-ui-app">
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RedirectToLogin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;