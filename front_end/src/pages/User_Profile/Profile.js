import React, { useEffect, useState } from 'react';
import ProductivityHeatmap from './ProductivityHeatmap';
import DailyLoginHeatmap from './DailyLoginHeatmap';
function isStrongPassword(password) {
  const minLength = password.length >= 8;
  const maxLength = password.length <= 20;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_\+\-=\[\]{}|;:,.<>?]/.test(password);
  return minLength && maxLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verified, setVerified] = useState(false);  // <-- track if current password verified
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassError, setChangePassError] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/userProfile`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to fetch profile');
        }
        return response.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Verify current password first
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyLoading(true);
    setChangePassError('');
    setChangePassSuccess('');

    if (!currentPassword) {
      setVerifyError('Please enter your current password');
      setVerifyLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/verifyPassword`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setVerifyError(data.message || 'Password verification failed');
        setVerified(false);
      } else {
        setVerified(true);
      }
    } catch (error) {
      setVerifyError('Something went wrong. Please try again.');
      setVerified(false);
    } finally {
      setVerifyLoading(false);
    }
  };

  // Now allow user to change to a new password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePassError('');
    setChangePassSuccess('');
    setChangePassLoading(true);

    if (!newPassword) {
      setChangePassError('Please enter a new password');
      setChangePassLoading(false);
      return;
    }
    if (currentPassword === newPassword) {
      setChangePassError('Please enter a other password, new password cant be same');
      setChangePassLoading(false);
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setChangePassError('Password must be 8–20 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
      setChangePassLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/updatePassword`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setChangePassError(data.message || 'Failed to update password');
      } else {
        alert('password changed!!')
        setChangePassSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setVerified(false); // reset verification after change
      }
    } catch (error) {
      setChangePassError('Something went wrong. Please try again.');
    } finally {
      setChangePassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
        <span className="ml-3 text-blue-600 text-lg">Loading profile...</span>
      </div>
    );
  }

  if (error)
    return <p className="text-red-600 font-semibold text-center mt-6">Error: {error}</p>;

  if (!user)
    return <p className="text-gray-600 font-medium text-center mt-6">No user found.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">User Profile</h1>
      <div className="space-y-4 text-gray-700">
        <p><strong className="font-semibold">Name:</strong> {user.name}</p>
        <p><strong className="font-semibold">Username:</strong> {user.username}</p>
        <p><strong className="font-semibold">Email:</strong> {user.email}</p>
        <p>
          <strong className="font-semibold">Email Verified:</strong>{' '}
          {user.emailVerified ? (
            <span className="text-green-600 font-semibold">Verified ✅</span>
          ) : (
            <span className="text-red-600 font-semibold">Not Verified ❌</span>
          )}
        </p>
      </div>

      {/* Password verification & change */}
      <div className="mt-12 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        {!verified ? (
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block font-medium mb-1">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            {verifyError && <p className="text-red-600 font-medium">{verifyError}</p>}

            <button
              type="submit"
              disabled={verifyLoading}
              className={`w-full py-2 rounded text-white font-semibold ${verifyLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {verifyLoading ? 'Verifying...' : 'Verify Current Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block font-medium mb-1">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            {changePassError && <p className="text-red-600 font-medium">{changePassError}</p>}
            {changePassSuccess && <p className="text-green-600 font-medium">{changePassSuccess}</p>}

            <button
              type="submit"
              disabled={changePassLoading}
              className={`w-full py-2 rounded text-white font-semibold ${changePassLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {changePassLoading ? 'Updating...' : 'Update Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setVerified(false);
                setCurrentPassword('');
                setNewPassword('');
                setVerifyError('');
                setChangePassError('');
                setChangePassSuccess('');
              }}
              className="mt-2 w-full py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Productivity Heatmap embedded here */}
      <div className="mt-12">
        <ProductivityHeatmap />
      </div>
      <div className="mt-12">
        <DailyLoginHeatmap />
      </div>
    </div>
  );
}

export default UserProfile;
