import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showTasksDropdown, setShowTasksDropdown] = useState(false);
  const [showAnalysisDropdown, setShowAnalysisDropdown] = useState(false);

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
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        alert('Logout successful!');
        setIsLoggedIn(false);
        navigate('/signin');
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  const toggleTasksDropdown = () => setShowTasksDropdown(!showTasksDropdown);
  const toggleAnalysisDropdown = () => setShowAnalysisDropdown(!showAnalysisDropdown);

  const linkClasses = (path) =>
    `block px-4 py-2 rounded-md my-1 transition-colors duration-200 ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
    }`;

  return (
    <>
      {/* Toggle button on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md md:hidden"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4 font-bold text-xl border-b border-gray-700">My App</div>
        <nav className="p-4 space-y-2">
          {isLoggedIn ? (
            <>
              <Link to="/" className={linkClasses('/')}>
                Home
              </Link>
              <Link to="/profile" className={linkClasses('/profile')}>
                Profile
              </Link>

              {/* Tasks Dropdown */}
              <button
                onClick={toggleTasksDropdown}
                className="w-full flex justify-between items-center px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-left focus:outline-none"
              >
                <span>Tasks</span>
                <span className={`transform transition-transform ${showTasksDropdown ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </button>

              {showTasksDropdown && (
                <div className="pl-4">
                  <Link to="/AllScheduleTasks" className={linkClasses('/AllScheduleTasks')}>
                    All Scheduled Tasks
                  </Link>
                  <Link to="/daily-productivity" className={linkClasses('/daily-productivity')}>
                    All Daily Productivity
                  </Link>
                  <Link to="/AllExpenses" className={linkClasses('/AllExpenses')}>
                    All Expenses
                  </Link>
                </div>
              )}

              {/* Analysis Dropdown */}
              <button
                onClick={toggleAnalysisDropdown}
                className="w-full flex justify-between items-center px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-left focus:outline-none"
              >
                <span>Analysis</span>
                <span className={`transform transition-transform ${showAnalysisDropdown ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </button>

              {showAnalysisDropdown && (
                <div className="pl-4">
                  <Link to="/analysis" className={linkClasses('/analysis')}>
                    Task Analysis
                  </Link>
                  <Link to="/expenseanalysis" className={linkClasses('/expenseanalysis')}>
                    Expense Analysis
                  </Link>
                </div>
              )}

              <Link to="/kanban" className={linkClasses('/kanban')}>
                Kanban Board
              </Link>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
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
      </aside>

      {/* Mobile backdrop */}
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black opacity-30 z-30 md:hidden" />}

      {/* Floating Action Buttons */}
      {isLoggedIn && (
        <>
          <button
            onClick={() => navigate('/CreateUserExpenses')}
            title="Create Expense"
            className="fixed bottom-52 right-5 w-14 h-14 rounded-full bg-purple-600 text-white text-3xl flex items-center justify-center shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 z-50"
          >
            💸
          </button>

          <button
            onClick={() => navigate('/CreateScheduleTask')}
            title="Create Schedule Task"
            className="fixed bottom-36 right-5 w-14 h-14 rounded-full bg-blue-600 text-white text-3xl flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
          >
            +
          </button>

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
}
