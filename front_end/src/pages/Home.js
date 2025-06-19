// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to the Home Page</h1>
      <p>
        <Link to="/signin" style={{ marginRight: '1rem' }}>Sign In</Link>
        <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Home;
