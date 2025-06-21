import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './pages/Sidebar'; // your updated Sidebar
import Home from './pages/Home';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Signin from './pages/Signin';
import CreateScheduleTask from './pages/CreateScheduleTask';
import AllScheduleTasks from './pages/AllScheduleTasks';
import EditTask from './pages/EditTask';
import TaskAnalysis from './pages/TaskAnalysis';
import KanbanBoardListPage from './pages/KanbanBoardListPage';
import KanbanBoardPage from './pages/KanbanBoardPage';
import CreateBoard from './pages/CreateBoard';
import CreateDailyProductivity from './pages/CreateDailyProductivity';
import DailyProductivityAll from './pages/AllDailyProductivity';
import EditDailyProductivity from './pages/EditDailyProductivity';
import ProductivityHeatmap from './pages/ProductivityHeatmap';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      {/* Sidebar stays fixed on the left */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content shifts on large screens */}
      <div className="pt-4 md:ml-64 transition-all duration-300">
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
          <Route path="/heatmap" element={<ProductivityHeatmap />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
