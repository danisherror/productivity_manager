import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/signin`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (response.status === 200 || response.status === 201) {
        alert(`Registered successfully!`);
        navigate('/profile');
      }
      else if(response.status === 403)
        {
          alert('Email is not verified. Verification email resent. Please check your email.')
        } 
         else if(response.status === 405)
        {
          alert('Email is not verified. Please check your email for verification link.')
        } 
      else 
      {
        alert('Error registering. Please try again.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Sigin Up to eReside</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleFormChange}
              required
              placeholder="Enter your email/username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              required
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition-colors duration-300"
            >
              Create account
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Sign up
          </Link>
        </p>
        <p className="mt-6 text-center text-sm text-gray-600">
          Forgot Password?{' '}
          <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Forgot Password
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signin;
