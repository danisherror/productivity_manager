import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { name, username, email, password } = formData;

    // Basic validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/signup', {
        username,
        name,
        email,
        password,
      });

      if (response.status === 200 || response.status === 201) {
        alert(`Registered successfully!`);
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
                  Name
                </label>
                <div >
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label>
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter your unique username"
                  />
                </div>
              </div>

              <div >
                <label >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter your email"
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

export default Signup;
