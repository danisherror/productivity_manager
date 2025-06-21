import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Sidebar visible by default

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
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle sidebar"
      >
        {isOpen ? '←' : '☰'}
      </button>

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full bg-gray-100 border-r border-gray-300 p-4 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64 z-40 overflow-auto`}
      >
        <h2 className="text-xl font-semibold mb-4">My App</h2>
        {isLoggedIn ? (
          <>
            <Link to="/" className={linkClasses('/')}>
              Home
            </Link>
            <Link to="/profile" className={linkClasses('/profile')}>
              Profile
            </Link>
            <Link to="/AllScheduleTasks" className={linkClasses('/AllScheduleTasks')}>
              All Tasks
            </Link>
            <Link to="/analysis" className={linkClasses('/analysis')}>
              Analysis
            </Link>
            <Link to="/kanban" className={linkClasses('/kanban')}>
              Kanban Board
            </Link>
            <Link to="/daily-productivity" className={linkClasses('/daily-productivity')}>
              All daily productivity
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
      </nav>

      {/* Overlay for small screens */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
        />
      )}

      {/* Floating Action Buttons */}
      {isLoggedIn && (
        <>
          {/* Create Schedule Task FAB */}
          <button
            onClick={() => navigate('/CreateScheduleTask')}
            title="Create Schedule Task"
            className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-blue-600 text-white text-3xl flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
          >
            +
          </button>

          {/* Link to Daily Productivity FAB */}
          <button
            onClick={() => navigate('/daily-productivity/create')}
            title="Daily Productivity Tasks"
            className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-green-600 text-white text-3xl flex items-center justify-center shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 z-50"
          >
            📈
          </button>
        </>
      )}
    </>
  );
};

export default Sidebar;
