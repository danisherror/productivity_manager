import React, { useEffect, useState } from 'react';
import ProductivityHeatmap from './ProductivityHeatmap';
import DailyLoginHeatmap from './DailyLoginHeatmap';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For change password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePassError('');
    setChangePassSuccess('');
    setChangePassLoading(true);

    if (!currentPassword || !newPassword) {
      setChangePassError('Please fill in both fields');
      setChangePassLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/updatePassword`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChangePassError(data.message || 'Failed to update password');
      } else {
        setChangePassSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
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
        <p>
          <strong className="font-semibold">Name:</strong> {user.name}
        </p>
        <p>
          <strong className="font-semibold">Username:</strong> {user.username}
        </p>
        <p>
          <strong className="font-semibold">Email:</strong> {user.email}
        </p>
        <p>
          <strong className="font-semibold">Email Verified:</strong>{' '}
          {user.emailVerified ? (
            <span className="text-green-600 font-semibold">Verified ✅</span>
          ) : (
            <span className="text-red-600 font-semibold">Not Verified ❌</span>
          )}
        </p>
      </div>

      {/* Change Password Section */}
      <div className="mt-12 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block font-medium mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {changePassError && (
            <p className="text-red-600 font-medium">{changePassError}</p>
          )}
          {changePassSuccess && (
            <p className="text-green-600 font-medium">{changePassSuccess}</p>
          )}

          <button
            type="submit"
            disabled={changePassLoading}
            className={`w-full py-2 rounded text-white font-semibold ${
              changePassLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {changePassLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
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
