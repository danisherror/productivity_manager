import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
        <span className="ml-3 text-blue-600 text-lg">Loading profile...</span>
      </div>
    );
  }

  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!user) return <p>No user found.</p>;

  return (
    <div>
      <h1>User Profile</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p>
        <Link to="/CreateScheduleTask" style={{ marginRight: '1rem' }}>Create Task</Link>
        <Link to="/AllScheduleTasks" style={{ marginRight: '1rem' }}>See All Tasks</Link>
      </p>
    </div>
  );
}

export default UserProfile;
