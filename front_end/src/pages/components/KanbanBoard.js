import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../../api'; // your axios instance or fetch wrapper
import TaskModal from './TaskModal';

export default function KanbanBoard({ board }) {
  const [tasks, setTasks] = useState([]);
  const [modalTask, setModalTask] = useState(null); // task to edit/create
  const [isCreateMode, setIsCreateMode] = useState(false); // true if creating new task

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/kanban_task/${board._id}/tasks`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if(res.status===404 || !data)
      {
        return;
      }
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
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
    ) return;

    const movingTask = tasks.find(t => t._id === draggableId);
    if (!movingTask) return;

    // Update task columnTitle and order (simplified)
    const updatedTask = {
      ...movingTask,
      columnTitle: destination.droppableId,
      order: destination.index,
    };

    try {
      await api.put(`/kanban_task/${board._id}/tasks/${draggableId}`, updatedTask);
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Group tasks by column
  const grouped = board.columns.map(col => ({
    ...col,
    items: tasks
      .filter(t => t.columnTitle === col.title)
      .sort((a, b) => a.order - b.order),
  }));

  // Open modal to create new task in the first column by default
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

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {grouped.map(col => (
            <Droppable key={col.title} droppableId={col.title}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded shadow min-h-[300px]"
                >
                  <h3 className="font-semibold mb-3">{col.title}</h3>
                  {col.items.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
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
                          <p className="text-sm text-gray-500">{task.priority}</p>
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
