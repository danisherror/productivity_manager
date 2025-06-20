import React, { useState } from 'react';
import KanbanBoardList from './components/KanbanBoardList';
import { useNavigate } from 'react-router-dom';

export default function KanbanBoardListPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Select a Kanban Board</h2>
      <KanbanBoardList onSelect={(board) => navigate(`/kanban/board/${board._id}`)} />
    </div>
  );
}
