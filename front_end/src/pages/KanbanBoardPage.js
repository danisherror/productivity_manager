import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import KanbanBoard from './components/KanbanBoard';

export default function KanbanBoardPage() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);

  useEffect(() => {
    api.get(`/kanban_board_getByID/${id}`)
      .then(res => setBoard(res.data))
      .catch(console.error);
  }, [id]);

  if (!board) return <p className="p-4">Loading board...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">{board.title}</h2>
      <KanbanBoard board={board} />
    </div>
  );
}
