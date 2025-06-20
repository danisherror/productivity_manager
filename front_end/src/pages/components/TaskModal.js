import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function TaskModal({ boardId, task, onClose }) {
  const [form, setForm] = useState(task);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    api.get(`/kanban_comment/${task._id}/comments`).then(r => setComments(r.data));
  }, [task]);

  const saveTask = async () => {
    await api.put(`/kanban_task/${boardId}/tasks/${task._id}`, form);
    onClose();
  };

  const addComment = async () => {
    await api.post(`/kanban_comment/${task._id}/comments`, { content: newComment });
    const r = await api.get(`/kanban_comment/${task._id}/comments`);
    setComments(r.data);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h3 className="text-xl font-semibold mb-4">Edit Task</h3>
        <input
          className="w-full mb-2 p-2 border rounded"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="w-full mb-2 p-2 border rounded"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <select
          className="w-full mb-2 p-2 border rounded"
          value={form.columnTitle}
          onChange={e => setForm({ ...form, columnTitle: e.target.value })}
        >
          {form.columnTitle && form.columnTitle}
        </select>
        <button
          onClick={saveTask}
          className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
        >
          Save
        </button>
        <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
          Cancel
        </button>

        <div className="mt-4">
          <h4 className="font-semibold">Comments</h4>
          <div className="space-y-2 mb-2">
            {comments.map(c => (
              <p key={c._id} className="border rounded p-2">— {c.content}</p>
            ))}
          </div>
          <textarea
            className="w-full p-2 border rounded mb-2"
            rows={2}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button
            onClick={addComment}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
}
