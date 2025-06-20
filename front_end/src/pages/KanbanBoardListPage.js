import React, { useState } from 'react';
import KanbanBoardList from './components/KanbanBoardList';
import { useNavigate } from 'react-router-dom';

export default function KanbanBoardListPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Select a Kanban Board</h2>
        <button
          onClick={() => navigate('/kanban/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Board
        </button>
      </div>
      <KanbanBoardList onSelect={(board) => navigate(`/kanban/board/${board._id}`)} />
    </div>
  );
}
