import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const linkClasses = (path) =>
    `block px-4 py-2 rounded-md my-1 transition-colors duration-200 ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
    }`;

  return (
    <>
      <nav className="bg-gray-100 border-b border-gray-300 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800">My App</h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {isOpen && (
          <div className="mt-3 max-w-7xl mx-auto">
            {isLoggedIn ? (
              <>
                <Link to="/" className={linkClasses('/')}>
                  Home
                </Link>
                <Link to="/profile" className={linkClasses('/profile')}>
                  Profile
                </Link>
                <Link to="/CreateScheduleTask" className={linkClasses('/CreateScheduleTask')}>
                  Create Task
                </Link>
                <Link to="/AllScheduleTasks" className={linkClasses('/AllScheduleTasks')}>
                  All Tasks
                </Link>
                <Link to="/analysis" className={linkClasses('/analysis')}>
                  Analysis
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 my-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className={linkClasses('/signin')}>
                  Sign In
                </Link>
                <Link to="/signup" className={linkClasses('/signup')}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Floating Action Button */}
      {isLoggedIn && (
        <button
          onClick={() => navigate('/CreateScheduleTask')}
          title="Create Task"
          className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-blue-600 text-white text-3xl flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
        >
          +
        </button>
      )}
    </>
  );
};

export default Navbar;
