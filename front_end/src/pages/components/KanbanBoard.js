import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../../api'; // your axios instance or fetch wrapper
import TaskModal from './TaskModal';

export default function KanbanBoard({ board }) {
  const [tasks, setTasks] = useState([]);
  const [modalTask, setModalTask] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Handle drag and drop of tasks
  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const movingTask = tasks.find((t) => t._id === draggableId);
    if (!movingTask) return;

    // Create updated task with new column and order
    const updatedTask = {
      ...movingTask,
      columnTitle: destination.droppableId,
      order: destination.index,
    };

    // Optimistically update UI
    setTasks((prev) => {
      // Remove task from old position
      let newTasks = prev.filter((t) => t._id !== draggableId);

      // Insert task at new position with updated columnTitle and order
      // But since order is simple index, we rely on backend to fix others' orders

      newTasks.push(updatedTask);
      return newTasks;
    });

    try {
      await api.put(
        `/kanban_task/${board._id}/tasks/${draggableId}`,
        updatedTask
      );
      // Optionally refetch tasks after update
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      // On failure, refetch to restore correct state
      fetchTasks();
    }
  };

  // Group tasks by column title
  const grouped = board.columns.map((col) => ({
    ...col,
    items: tasks
      .filter((t) => t.columnTitle === col.title)
      .sort((a, b) => a.order - b.order),
  }));

  // Open modal for creating new task
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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {grouped.map((col) => (
              <Droppable key={col._id} droppableId={col.title}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 p-4 rounded shadow min-h-[300px]"
                  >
                    <h3 className="font-semibold mb-3">{col.title}</h3>

                    {col.items.length === 0 && (
                      <p className="text-gray-400 italic">No tasks</p>
                    )}

                    {col.items.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(providedDraggable) => (
                          <div
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                            className="bg-white p-3 mb-2 rounded shadow cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              setModalTask(task);
                              setIsCreateMode(false);
                            }}
                          >
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-500">
                              Priority: {task.priority}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              ID: {task._id}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
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
