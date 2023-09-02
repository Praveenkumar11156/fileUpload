import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import "./register.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/login', {
        email: email,
        password: password,
      });
      if (response.data.token) {
        localStorage.setItem('loggedInUserToken', response.data.token);
        setIsLoggedIn(true);

        // Navigate to App1.js upon successful login
        navigate('/app1'); // Path should match your App1 route
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="container my-5">
    <div className="row justify-content-center">
      <div className="col-lg-6 col-md-8 col-sm-10 bg-light p-4 rounded">
        <h2 className="text-center mb-4">Login</h2>
        {!isLoggedIn ? (
          <>
            <div className="form-group">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-block mx-auto d-block" style={{ width: '20%' }} onClick={handleLogin}>
              Login
            </button>
            <p className="text-center mt-3">
                <Link to="/">Create an Account</Link>
            </p>
          </>
        ) : (
          <p className="text-success text-center mt-3">User logged in!</p>
        )}
      </div>
    </div>
  </div>
  );
};

export default Login;
