import React, { useEffect, useState } from 'react';
import api from '../../api'; // your axios instance or fetch wrapper
import TaskModal from './TaskModal';

export default function KanbanBoard({ board }) {
  const [tasks, setTasks] = useState([]);
  const [modalTask, setModalTask] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);

  const [columns, setColumns] = useState(board.columns || []);
  const [newColumnName, setNewColumnName] = useState('');

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/kanban_task/${board._id}/tasks`,
        { method: 'GET', credentials: 'include' }
      );
      if (res.status === 404) {
        setTasks([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data) setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch updated board with columns
  const fetchBoardColumns = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/kanban_board/${board._id}`,
        { method: 'GET', credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.columns) setColumns(data.columns);
      }
    } catch (err) {
      console.error('Failed to fetch board columns:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchBoardColumns(); // Always fetch fresh board columns on mount
  }, [board._id]);

  // Add new column (POST)
  const addNewColumn = async () => {
    const trimmedName = newColumnName.trim();
    if (!trimmedName) return;

    if (columns.find((col) => col.title === trimmedName)) {
      alert('Column with this name already exists!');
      return;
    }

    try {
      console.log(trimmedName)
      const res = await api.post(
        `/kanban_board/${board._id}/columns`,
        { title: trimmedName }
      );

      if (res.status === 201 || res.status === 200) {
        await fetchBoardColumns();
        setNewColumnName('');
      } else {
        alert('Failed to add column');
      }
    } catch (error) {
      console.error('Error adding new column:', error);
      alert('Error adding new column');
    }
  };

  // Delete column (DELETE)
  const deleteColumn = async (columnId, columnTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the column "${columnTitle}"? This will also delete tasks in this column.`
      )
    )
      return;

    try {
      const res = await api.delete(
        `/kanban_board/${board._id}/columns/${columnId}`
      );

      if (res.status === 200) {
        await fetchBoardColumns();
        // Optionally refresh tasks to reflect deleted column tasks removed
        await fetchTasks();
      } else {
        alert('Failed to delete column');
      }
    } catch (error) {
      console.error('Error deleting column:', error);
      alert('Error deleting column');
    }
  };

  // Drag handlers...

  // Group tasks by current columns state
  const grouped = columns.map((col) => ({
    ...col,
    items: tasks
      .filter((t) => t.columnTitle === col.title)
      .sort((a, b) => a.order - b.order),
  }));

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-bold">{board.title}</h2>
        <button
          onClick={() => {
            setModalTask(null);
            setIsCreateMode(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Task
        </button>
      </div>

      {/* Add new column input */}
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="New column name"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <button
          onClick={addNewColumn}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Add Column
        </button>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {grouped.map((col) => (
            <div
              key={col._id}
              onDragOver={(e) => {
                e.preventDefault();
                setDraggedOverColumn(col.title);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                if (!draggedTaskId) return;

                const movingTask = tasks.find(
                  (t) => t._id.toString() === draggedTaskId
                );
                if (!movingTask) return;

                if (movingTask.columnTitle === col.title) {
                  setDraggedTaskId(null);
                  setDraggedOverColumn(null);
                  return;
                }

                const updatedTask = {
                  ...movingTask,
                  columnTitle: col.title,
                };

                try {
                  await api.put(
                    `/kanban_task/${board._id}/tasks/${draggedTaskId}`,
                    updatedTask
                  );
                  await fetchTasks();
                } catch (error) {
                  console.error('Failed to update task:', error);
                }

                setDraggedTaskId(null);
                setDraggedOverColumn(null);
              }}
              className={`bg-gray-100 p-4 rounded shadow min-h-[300px] relative ${draggedOverColumn === col.title ? 'bg-blue-100' : ''
                }`}
            >
              <h3 className="font-semibold mb-3 flex justify-between items-center">
                <span>{col.title}</span>
                <button
                  onClick={() => deleteColumn(col._id, col.title)}
                  className="text-red-600 hover:text-red-800 text-lg font-bold"
                  title="Delete column"
                  type="button"
                >
                  &times;
                </button>
              </h3>

              {col.items.length === 0 && (
                <p className="text-gray-400 italic">No tasks</p>
              )}

              {col.items.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedTaskId(task._id.toString());
                    e.dataTransfer.setData('text/plain', task._id.toString());
                  }}
                  className="bg-white p-3 mb-2 rounded shadow cursor-pointer hover:bg-gray-50 relative"
                >
                  {/* Delete button */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation(); // Prevent modal open
                      const confirmDelete = window.confirm(`Are you sure you want to delete task "${task.title}"?`);
                      if (!confirmDelete) return;

                      try {
                        await api.delete(`/kanban_task/${board._id}/tasks/${task._id}`);
                        await fetchTasks();
                      } catch (err) {
                        console.error('Error deleting task:', err);
                        alert('Failed to delete task');
                      }
                    }}
                    className="absolute top-1 right-2 text-red-500 hover:text-red-700 font-bold text-lg"
                    title="Delete task"
                  >
                    &times;
                  </button>

                  {/* Click to open modal */}
                  <div onClick={() => {
                    setModalTask(task);
                    setIsCreateMode(false);
                  }}>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-500">Priority: {task.priority}</p>
                    <p className="text-xs text-gray-400 truncate">ID: {task._id}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {(modalTask || isCreateMode) && (
        <TaskModal
          boardId={board._id}
          task={modalTask}
          isCreate={isCreateMode}
          onClose={() => {
            setModalTask(null);
            setIsCreateMode(false);
            fetchTasks();
            fetchBoardColumns(); // Refresh columns in case a new column title is involved
          }}
          columns={columns}
        />
      )}
    </div>
  );
}
