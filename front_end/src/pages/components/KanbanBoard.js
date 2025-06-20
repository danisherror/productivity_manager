import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../../api';
import TaskModal from './TaskModal';

export default function KanbanBoard({ board }) {
  const [tasks, setTasks] = useState([]);
  const [modalTask, setModalTask] = useState(null);

  const fetchTasks = async () => {
    try{
    const res = await api.get(`/kanban_task/${board._id}/tasks`);
    setTasks(res.data);
    }catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [board]);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const moving = tasks.find(t => t._id === draggableId);
    const updated = { ...moving, columnTitle: destination.droppableId };
    await api.put(`/kanban_task/${board._id}/tasks/${draggableId}`, updated);
    fetchTasks();
  };

  const grouped = board.columns.map(col => ({
    ...col,
    items: tasks
      .filter(t => t.columnTitle === col.title)
      .sort((a, b) => a.order - b.order),
  }));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {grouped.map(col => (
            <Droppable droppableId={col.title} key={col.title}>
              {p => (
                <div ref={p.innerRef} {...p.droppableProps} className="bg-gray-100 p-4 rounded">
                  <h3 className="font-bold mb-2">{col.title}</h3>
                  {col.items.map((t, i) => (
                    <Draggable key={t._id} draggableId={t._id} index={i}>
                      {p2 => (
                        <div
                          ref={p2.innerRef}
                          {...p2.draggableProps}
                          {...p2.dragHandleProps}
                          className="bg-white p-3 rounded mb-2 shadow cursor-pointer hover:bg-gray-50"
                          onClick={() => setModalTask(t)}
                        >
                          <p className="font-medium">{t.title}</p>
                          <p className="text-xs text-gray-500">{t.priority}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {p.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>

      {modalTask && (
        <TaskModal
          boardId={board._id}
          task={modalTask}
          onClose={() => { setModalTask(null); fetchTasks(); }}
        />
      )}
    </div>
  );
}
