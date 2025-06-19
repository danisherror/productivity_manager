import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Signin() {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
    const navigate = useNavigate();
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { identifier, password } = formData;

    // Basic validation

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/signin`, {
        method: 'POST',
        credentials: 'include', // Important: allows cookies to be sent/received
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (response.status === 200 || response.status === 201) {
        alert(`Registered successfully!`);
        navigate('/profile');
      } else {
        console.error('Error:', response.status, response.data);
        alert('Error registering. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };

  return (

    <div >
      <h2 >
        Sign Up to eReside
      </h2>

      <form onSubmit={handleSubmit}>
        <div >
          <label >
            Email
          </label>
          <div className="relative">
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.email}
              onChange={handleFormChange}
              required
              placeholder="Enter your email/username"
            />
          </div>
        </div>

        <div >
          <label >
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              required
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
          >
            Create account
          </button>
        </div>

        <div>
          <p>
            Already have an account?

          </p>
        </div>
      </form>
    </div>

  );
}

export default Signin;
