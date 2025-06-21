import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Signin from './pages/Signin';
import CreateScheduleTask from './pages/CreateScheduleTask';
import AllScheduleTasks from './pages/AllScheduleTasks';
import EditTask from './pages/EditTask';
import Navbar from './pages/Navbar';
import TaskAnalysis from './pages/TaskAnalysis';
import KanbanBoardListPage from './pages/KanbanBoardListPage';
import KanbanBoardPage from './pages/KanbanBoardPage';
import CreateBoard from './pages/CreateBoard'; 
import CreateDailyProductivity from './pages/CreateDailyProductivity';
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />         {/* Home page */}
        <Route path="/signup" element={<Signup />} />   {/* About page */}
        <Route path="/profile" element={<Profile />} /> {/* Profile page */}
        <Route path="/signin" element={<Signin />} />     {/* Catch-all route */}
        <Route path="/CreateScheduleTask" element={<CreateScheduleTask />} />     {/* Catch-all route */}
         <Route path="/AllScheduleTasks" element={<AllScheduleTasks />} /> 
         <Route path="/EditTask/:id" element={<EditTask />} /> 
         <Route path="/analysis/" element={<TaskAnalysis />} /> 
         <Route path="/kanban" element={<KanbanBoardListPage />} />
        <Route path="/kanban/board/:id" element={<KanbanBoardPage />} />
        <Route path="/kanban/create" element={<CreateBoard />} />

        <Route path="/daily-productivity/create" element={<CreateDailyProductivity />} />
      </Routes>
    </Router>
  );
}

export default App;
