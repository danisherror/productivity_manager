// src/pages/UserProfile.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function UserProfile() {
  const [user, setUser] = useState(null);        // store user data
  const [loading, setLoading] = useState(true);  // show loader
  const [error, setError] = useState(null);      // show error

  useEffect(() => {
    fetch('http://localhost:4000/api/userProfile', {
      method: 'GET',
      credentials: 'include', // important for cookies
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>No user found.</p>;

  return (
    <div>
      <h1>User Profile</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p>
        <Link to="/CreateScheduleTask" style={{ marginRight: '1rem' }}>create task</Link>
        <Link to="/AllScheduleTasks"style={{ marginRight: '1rem' }}>see all task</Link>
      </p>
    </div>
  );
}

export default UserProfile;
