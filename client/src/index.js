import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import App1 from './App1';
import ProfilePage from './profile';
import Register from './register';
import AdminPage from './AdminPage';
import Login from './login';

// Custom HOC to check if user is authenticated
const ProtectedRoute = ({ component: Component, ...rest }) => {
  // Implement your authentication check here
  const isAuthenticated = true;

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProtectedRoute component={ProfilePage} />} />
        <Route path="/App1" element={<App1 />} />
        <Route path="/admin" element={<ProtectedRoute component={AdminPage} />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
