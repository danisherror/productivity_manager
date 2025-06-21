import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Signin from './pages/Signin';
import CreateScheduleTask from './pages/CreateScheduleTask';
import AllScheduleTasks from './pages/AllScheduleTasks';
import EditTask from './pages/EditTask';
import Sidebar from './pages/Sidebar';  // Updated to Sidebar component
import TaskAnalysis from './pages/TaskAnalysis';
import KanbanBoardListPage from './pages/KanbanBoardListPage';
import KanbanBoardPage from './pages/KanbanBoardPage';
import CreateBoard from './pages/CreateBoard'; 
import CreateDailyProductivity from './pages/CreateDailyProductivity';
import DailyProductivityAll from './pages/AllDailyProductivity';
import EditDailyProductivity from './pages/EditDailyProductivity';

function App() {
  // Optionally, keep track of sidebar open state here and pass down if you want global control
  // But since Sidebar handles its own open state, this is optional.
  
  return (
    <Router>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 p-4 ml-0 md:ml-64 transition-all duration-300">
          {/* 
            ml-64 on md and above to provide space for sidebar width (64 = 16rem)
            On smaller screens sidebar overlays content so margin left is zero.
          */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/CreateScheduleTask" element={<CreateScheduleTask />} />
            <Route path="/AllScheduleTasks" element={<AllScheduleTasks />} />
            <Route path="/EditTask/:id" element={<EditTask />} />
            <Route path="/analysis" element={<TaskAnalysis />} />
            <Route path="/kanban" element={<KanbanBoardListPage />} />
            <Route path="/kanban/board/:id" element={<KanbanBoardPage />} />
            <Route path="/kanban/create" element={<CreateBoard />} />
            <Route path="/daily-productivity/create" element={<CreateDailyProductivity />} />
            <Route path="/daily-productivity" element={<DailyProductivityAll />} />
            <Route path="/daily-productivity/edit/:id" element={<EditDailyProductivity />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
