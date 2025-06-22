import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to the Home Page</h1>
      <p>
        <Link
          to="/signin"
          className="mr-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default Home;
