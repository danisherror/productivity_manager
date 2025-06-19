import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/user_schedule_getByID/${id}`, {
            method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) setFormData(data);
        else setError(data.error || 'Could not fetch task');
      } catch (err) {
        setError('Server error');
      }
    };
    fetchTask();
  }, [id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const {
            taskName,
            description,
            category,
            tags,
            startTime,
            endTime,
            isCompleted,
            mood,
        } = formData;

        const productivityScore = formData.productivityScore ? Number(formData.productivityScore) : null;
        const energyLevel = formData.energyLevel ? Number(formData.energyLevel) : 5;
         const payload = {
            taskName,
            description,
            category,
            tags,
            startTime,
            endTime,
            isCompleted,
            productivityScore,
            mood,
            energyLevel
        };

      const res = await fetch(`http://localhost:4000/api/user_schedule_update/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok){
        alert('edited successfully');
        navigate('/AllScheduleTasks');
      }
      else {
        const data = await res.json();
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  if (!formData) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Edit Task</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Task Name:<br />
          <input name="taskName" value={formData.taskName} onChange={handleChange} required style={{ width: '100%' }} /></label><br /><br />

        <label>Description:<br />
          <textarea name="description" value={formData.description} onChange={handleChange} style={{ width: '100%' }} /></label><br /><br />

        <label>Category:<br />
          <input name="category" value={formData.category} onChange={handleChange} required style={{ width: '100%' }} /></label><br /><br />

        <label>Tags (comma separated):<br />
          <input name="tags" value={formData.tags} onChange={handleChange} style={{ width: '100%' }} /></label><br /><br />

        <label>Start Time:<br />
          <input type="datetime-local" name="startTime" value={formData.startTime.slice(0, 16)} onChange={handleChange} required style={{ width: '100%' }} /></label><br /><br />

        <label>End Time:<br />
          <input type="datetime-local" name="endTime" value={formData.endTime.slice(0, 16)} onChange={handleChange} required style={{ width: '100%' }} /></label><br /><br />

        <label>Completed:
          <input type="checkbox" name="isCompleted" checked={formData.isCompleted} onChange={handleChange} /></label><br /><br />

        <label>Productivity Score:<br />
          <input name="productivityScore" type="number" value={formData.productivityScore} onChange={handleChange} style={{ width: '100%' }} /></label><br /><br />

        <label>Mood:<br />
          <select name="mood" value={formData.mood} onChange={handleChange} style={{ width: '100%' }}>
            <option value="Happy">Happy</option>
            <option value="Neutral">Neutral</option>
            <option value="Sad">Sad</option>
            <option value="Tired">Tired</option>
            <option value="Motivated">Motivated</option>
            <option value="Stressed">Stressed</option>
          </select></label><br /><br />

        <label>Energy Level:<br />
          <input name="energyLevel" type="number" value={formData.energyLevel} min="1" max="10" onChange={handleChange} style={{ width: '100%' }} /></label><br /><br />

        <button type="submit">Update Task</button>
      </form>
    </div>
  );
}