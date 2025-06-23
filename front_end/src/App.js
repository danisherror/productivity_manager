import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './pages/Helper/Sidebar'; // your updated Sidebar
import Home from './pages/Helper/Home';
import Signup from './pages/Login/Signup';
import Profile from './pages/User_Profile/Profile';
import Signin from './pages/Login/Signin';
import CreateScheduleTask from './pages/ScheduleTask/CreateScheduleTask';
import AllScheduleTasks from './pages/ScheduleTask/AllScheduleTasks';
import EditTask from './pages/ScheduleTask/EditTask';
import TaskAnalysis from './pages/Analysis/TaskAnalysis';
import KanbanBoardListPage from './pages/KanbanBoard/KanbanBoardListPage';
import KanbanBoardPage from './pages/KanbanBoard/KanbanBoardPage';
import CreateBoard from './pages/KanbanBoard/CreateBoard';
import CreateDailyProductivity from './pages/DailyProductivity/CreateDailyProductivity';
import DailyProductivityAll from './pages/DailyProductivity/AllDailyProductivity';
import EditDailyProductivity from './pages/DailyProductivity/EditDailyProductivity';
import VerifyEmailPage from './pages/Password_mail/VerifyEmailPage';
import ForgotPasswordPage from './pages/Password_mail/ForgotPasswordPage';
import ResetPasswordPage from './pages/Password_mail/ResetPasswordPage';
// =====
import CreateUserExpenses from './pages/Expenses/CreateUserExpenses';
import AllExpenses from './pages/Expenses/AllUserExpenses';
import EditExpense from './pages/Expenses/EditExpenses';
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
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/CreateUserExpenses" element={<CreateUserExpenses />} />
          <Route path="/AllExpenses" element={<AllExpenses />} />
          <Route path="/editExpense/:id" element={<EditExpense />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
