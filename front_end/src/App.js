import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Signin from './pages/Signin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />         {/* Home page */}
        <Route path="/signup" element={<Signup />} />   {/* About page */}
        <Route path="/profile" element={<Profile />} /> {/* Profile page */}
        <Route path="/signin" element={<Signin />} />     {/* Catch-all route */}
      </Routes>
    </Router>
  );
}

export default App;
