import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
function isStrongPassword(password) {
  const minLength = password.length >= 8;
  const maxLength = password.length <= 20;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_\+\-=\[\]{}|;:,.<>?]/.test(password);
  return minLength && maxLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}
function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if(!isStrongPassword(password))
    {
      setError('Password must be 8–20 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }
    try {
      const res=await fetch(`${process.env.REACT_APP_BACKEND_URL}/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }), // `newPassword` should be a valid non-empty string
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setMessage('Password successfully reset!');
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="password"
          placeholder="Enter new password"
          className="w-full px-3 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
          Reset Password
        </button>
      </form>
      {message && <p className="text-green-600 mt-4">{message}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}

export default ResetPasswordPage;
