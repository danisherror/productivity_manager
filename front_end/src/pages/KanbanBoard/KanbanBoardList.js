import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function KanbanBoardList({ onSelect }) {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    api.get('/kanban_board_getAll')
      .then(res => setBoards(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {boards.map(b => (
        <button
          key={b._id}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-blue-200"
          onClick={() => onSelect(b)}
        >
          {b.title}
        </button>
      ))}
    </div>
  );
}
