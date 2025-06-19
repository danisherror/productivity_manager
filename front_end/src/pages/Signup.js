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
    <div>
      <h2>Sign Up to eReside</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            autoComplete="off"
            value={formData.name}
            onChange={handleFormChange}
            required
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
          {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
        </div>

        {/* Username */}
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            autoComplete="off"
            value={formData.username}
            onChange={handleFormChange}
            required
            placeholder="Enter your unique username"
            disabled={isSubmitting}
          />
          {errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}
        </div>

        {/* Email */}
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            autoComplete="off"
            value={formData.email}
            onChange={handleFormChange}
            required
            placeholder="Enter your email"
            disabled={isSubmitting}
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="off"
              value={formData.password}
              onChange={handleFormChange}
              required
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
              style={{
                position: 'absolute',
                right: 10,
                top: '30%',
                background: 'none',
                border: 'none',
                color: 'blue',
                cursor: 'pointer',
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        {/* Redirect to Login */}
        <div>
          <p>
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Signup;
