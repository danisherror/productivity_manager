import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Signin from './pages/Signin';
import CreateScheduleTask from './pages/CreateScheduleTask';
import AllScheduleTasks from './pages/AllScheduleTasks';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />         {/* Home page */}
        <Route path="/signup" element={<Signup />} />   {/* About page */}
        <Route path="/profile" element={<Profile />} /> {/* Profile page */}
        <Route path="/signin" element={<Signin />} />     {/* Catch-all route */}
        <Route path="/CreateScheduleTask" element={<CreateScheduleTask />} />     {/* Catch-all route */}
         <Route path="/AllScheduleTasks" element={<AllScheduleTasks />} /> 
      </Routes>
    </Router>
  );
}

export default App;
