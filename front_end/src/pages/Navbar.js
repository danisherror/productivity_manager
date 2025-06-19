import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status using backend cookie-based auth
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/me', {
          method: 'GET',
          credentials: 'include',
        });
        setIsLoggedIn(res.ok);
      } catch (err) {
        console.error('Error checking auth:', err);
        setIsLoggedIn(false);
      }
    };

    checkLogin();
  }, [location]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Logout successful!');
        setIsLoggedIn(false);
        navigate('/signin');
      } else {
        alert('Logout failed. Please try again.');
        console.error('Error:', await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const linkStyle = (path) => ({
    padding: '10px 15px',
    marginRight: '10px',
    textDecoration: 'none',
    color: location.pathname === path ? '#fff' : '#333',
    backgroundColor: location.pathname === path ? '#007bff' : '#f1f1f1',
    borderRadius: '5px',
  });

  return (
    <nav style={{
      padding: '15px',
      backgroundColor: '#eee',
      borderBottom: '1px solid #ccc',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'center',
    }}>
      {isLoggedIn ? (
        <>
          <Link to="/" style={linkStyle('/')}>Home</Link>
          <Link to="/profile" style={linkStyle('/profile')}>Profile</Link>
          <Link to="/CreateScheduleTask" style={linkStyle('/CreateScheduleTask')}>Create Task</Link>
          <Link to="/AllScheduleTasks" style={linkStyle('/AllScheduleTasks')}>All Tasks</Link>
          <button onClick={handleLogout} style={{ marginLeft: '20px' }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/signin" style={linkStyle('/signin')}>Sign In</Link>
          <Link to="/signup" style={linkStyle('/signup')}>Sign Up</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
