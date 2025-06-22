import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function isStrongPassword(password) {
  const minLength = password.length >= 8;
  const maxLength = password.length <= 20;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_\+\-=\[\]{}|;:,.<>?]/.test(password);
  return minLength && maxLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const cleanedValue =
      name === 'username' ? value.replace(/\s+/g, '') : value.trimStart();

    setFormData((prevData) => ({ ...prevData, [name]: cleanedValue }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { name, username, email, password } = formData;

    const newErrors = {};
    if (name.length < 4) {
      newErrors.name = 'Name must be at least 4 characters long.';
    }

    if (username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters long.';
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!isStrongPassword(password)) {
      newErrors.password =
        'Password must be 8–20 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/signup`,
        {
          username: username.trim(),
          name: name.trim(),
          email: email.trim(),
          password,
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Registered successfully!');
        navigate('/signin');
      } else {
        alert('Error registering. Please try again.');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Sign Up to eReside
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              autoComplete="off"
              value={formData.name}
              onChange={handleFormChange}
              required
              placeholder="Enter your full name"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              autoComplete="off"
              value={formData.username}
              onChange={handleFormChange}
              required
              placeholder="Enter your unique username"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="off"
              value={formData.email}
              onChange={handleFormChange}
              required
              placeholder="Enter your email"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                autoComplete="off"
                value={formData.password}
                onChange={handleFormChange}
                required
                placeholder="Enter your password"
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-2 text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition-colors duration-300"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Redirect to Login */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/signin" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
