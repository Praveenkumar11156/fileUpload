import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import "./register.css";

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:3001/register', {
        firstName,
        lastName,
        email,
        password,
      });
      navigate('/login');
      console.log(response.data); // Should display a success message
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('loggedInUserEmail'); // Remove email from local storage
    // Perform any other necessary actions for logout
  };

  return (
    <div className="container my-5 p-4 border rounded bg-light register-container">
      <h2 className="text-center mb-4">Register</h2>
      {!isLoggedIn ? (
        <div className="form-container">
          <h3 className="mb-3">Create an Account</h3>
          <input
            type="text"
            className="form-control mb-2 mx-auto" // Added mx-auto class to center the input
            style={{ width: '50%' }} // Set input width to 50%
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            className="form-control mb-2 mx-auto" // Added mx-auto class to center the input
            style={{ width: '50%' }} // Set input width to 50%
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="email"
            className="form-control mb-2 mx-auto" // Added mx-auto class to center the input
            style={{ width: '50%' }} // Set input width to 50%
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="form-control mb-3 mx-auto" // Added mx-auto class to center the input
            style={{ width: '50%' }} // Set input width to 50%
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary btn-block mx-auto d-block" style={{ width: '20%' }} onClick={handleRegister}>
            Register
          </button>
          <p className="mt-3 text-center">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="user-logged-in text-success mt-3">User logged in!</p>
          <button className="btn btn-secondary btn-block mt-3" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Register;
