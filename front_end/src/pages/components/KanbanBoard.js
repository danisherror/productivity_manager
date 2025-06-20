import React, { useEffect, useState } from 'react';
import api from '../../api'; // your axios instance or fetch wrapper
import TaskModal from './TaskModal';

export default function KanbanBoard({ board }) {
  const [tasks, setTasks] = useState([]);
  const [modalTask, setModalTask] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Drag & drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);

  // Fetch tasks from backend
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

  useEffect(() => {
    fetchTasks();
  }, [board]);

  // Handle drag start on task card
  const onDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    // For Firefox compatibility
    e.dataTransfer.setData('text/plain', taskId);
  };

  // When a column is dragged over
  const onDragOver = (e, columnTitle) => {
    e.preventDefault(); // Needed to allow drop
    setDraggedOverColumn(columnTitle);
  };

  // When task dropped on a column
  const onDrop = async (e, columnTitle) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    // Find the dragged task
    const movingTask = tasks.find((t) => t._id.toString() === draggedTaskId);
    if (!movingTask) return;

    if (movingTask.columnTitle === columnTitle) {
      // Same column, do nothing or you can implement reorder if you want
      setDraggedTaskId(null);
      setDraggedOverColumn(null);
      return;
    }

    // Update the task's column on backend
    const updatedTask = {
      ...movingTask,
      columnTitle: columnTitle,
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
  };

  // Group tasks by column title
  const grouped = board.columns.map((col) => ({
    ...col,
    items: tasks
      .filter((t) => t.columnTitle === col.title)
      .sort((a, b) => a.order - b.order),
  }));

  const openCreateModal = () => {
    setModalTask(null);
    setIsCreateMode(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">{board.title}</h2>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Task
        </button>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {grouped.map((col) => (
            <div
              key={col._id}
              onDragOver={(e) => onDragOver(e, col.title)}
              onDrop={(e) => onDrop(e, col.title)}
              className={`bg-gray-100 p-4 rounded shadow min-h-[300px] ${
                draggedOverColumn === col.title ? 'bg-blue-100' : ''
              }`}
            >
              <h3 className="font-semibold mb-3">{col.title}</h3>

              {col.items.length === 0 && (
                <p className="text-gray-400 italic">No tasks</p>
              )}

              {col.items.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task._id.toString())}
                  className="bg-white p-3 mb-2 rounded shadow cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setModalTask(task);
                    setIsCreateMode(false);
                  }}
                >
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-500">Priority: {task.priority}</p>
                  <p className="text-xs text-gray-400 truncate">ID: {task._id}</p>
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
          }}
          columns={board.columns}
        />
      )}
    </div>
  );
}
