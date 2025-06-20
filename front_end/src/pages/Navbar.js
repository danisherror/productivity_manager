import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // state for collapse toggle

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/me`, {
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/logout`, {
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
    margin: '5px 0',
    textDecoration: 'none',
    color: location.pathname === path ? '#fff' : '#333',
    backgroundColor: location.pathname === path ? '#007bff' : '#f1f1f1',
    borderRadius: '5px',
    display: 'block',
  });

  return (
    <nav style={{
      padding: '15px',
      backgroundColor: '#eee',
      borderBottom: '1px solid #ccc',
    }}>
      {/* Hamburger Toggle Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>My App</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            fontSize: '20px',
            padding: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ☰
        </button>
      </div>

      {/* Collapsible links */}
      {isOpen && (
        <div style={{ marginTop: '10px' }}>
          {isLoggedIn ? (
            <>
              <Link to="/" style={linkStyle('/')}>Home</Link>
              <Link to="/profile" style={linkStyle('/profile')}>Profile</Link>
              <Link to="/CreateScheduleTask" style={linkStyle('/CreateScheduleTask')}>Create Task</Link>
              <Link to="/AllScheduleTasks" style={linkStyle('/AllScheduleTasks')}>All Tasks</Link>
              <Link to="/analysis" style={linkStyle('/analysis')}>Analysis</Link>
              <button onClick={handleLogout} style={{ ...linkStyle(), backgroundColor: '#dc3545', color: '#fff' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/signin" style={linkStyle('/signin')}>Sign In</Link>
              <Link to="/signup" style={linkStyle('/signup')}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
