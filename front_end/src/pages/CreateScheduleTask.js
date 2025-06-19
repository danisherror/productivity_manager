import React, { useState, useEffect } from 'react';

export default function CreateScheduleTask() {
    const [formData, setFormData] = useState({
        taskName: '',
        description: '',
        category: '',
        tags: '',
        startTime: '',
        endTime: '',
        isCompleted: true,
        productivityScore: '',
        mood: 'Neutral',
        energyLevel: 5,
    });

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (!formData.taskName || !formData.category || !formData.startTime || !formData.endTime) {
            setError('Please fill in required fields: Task Name, Category, Start Time, End Time');
            return;
        }

        const {
            taskName,
            description,
            category,
            startTime,
            endTime,
            isCompleted,
            mood,
        } = formData;

        const tags = category;
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

        console.log(payload);

        try {
            const response = fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_create`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.data;

            if (response.status === 400 || response.status === 500) {
                setError(data.error || 'Failed to create task');
            } else {
                alert(`Registered successfully!`);
                setMessage('Task created successfully!');
                setFormData({
                    taskName: '',
                    description: '',
                    category: '',
                    tags: '',
                    startTime: '',
                    endTime: '',
                    isCompleted: false,
                    productivityScore: '',
                    mood: 'Neutral',
                    energyLevel: 5,
                });
            }
        } catch (err) {
            setError('Server error. Please try again.');
            console.error(err);
        }
    };

    // Auto-hide success message after 3s
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 13000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div style={{ maxWidth: 600, margin: 'auto' }}>
            <h2>Create Schedule Task</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            <form onSubmit={handleSubmit}>
                <label>
                    Task Name*:<br />
                    <input
                        type="text"
                        name="taskName"
                        value={formData.taskName}
                        onChange={handleChange}
                        required
                        style={{ width: '100%' }}
                    />
                </label>
                <br /><br />

                <label>
                    Description:<br />
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        style={{ width: '100%' }}
                    />
                </label>
                <br /><br />

                <label>
                    Category*:<br />
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Work, Study, Exercise"
                        style={{ width: '100%' }}
                    />
                </label>
                <br /><br />

                {/* <label>
                    Tags (comma separated):<br />
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g. urgent, client"
                        style={{ width: '100%' }}
                    />
                </label>
                <br /><br /> */}

                <label>
                    Start Time*:<br />
                    <input
                        type="datetime-local"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                        style={{ width: '100%' }}
                    />
                </label>
                <br /><br />

                <label>
                    End Time*:<br />
                    <input
                        type="datetime-local"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                        style={{ width: '100%' }}
                    />
                </label>
                <br /><br />

                {/* <label>
                    Completed:<br />
                    <input
                        type="checkbox"
                        name="isCompleted"
                        checked={formData.isCompleted}
                        onChange={handleChange}
                    />
                </label>
                <br /><br /> */}

                <label>
                    Productivity Score (0-10):<br />
                    <input
                        type="number"
                        name="productivityScore"
                        value={formData.productivityScore}
                        min="0"
                        max="10"
                        onChange={handleChange}
                        style={{ width: '100%' }}
                    />
                </label>
                <br /><br />

                {/* <label>
                    Mood:<br />
                    <select name="mood" value={formData.mood} onChange={handleChange} style={{ width: '100%' }}>
                        <option value="Happy">Happy</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Sad">Sad</option>
                        <option value="Tired">Tired</option>
                        <option value="Motivated">Motivated</option>
                        <option value="Stressed">Stressed</option>
                    </select>
                </label>
                <br /><br />

                <label>
                    Energy Level (1-10):<br />
                    <input
                        type="number"
                        name="energyLevel"
                        value={formData.energyLevel}
                        min="1"
                        max="10"
                        onChange={handleChange}
                        style={{ width: '100%' }}
                    />
                </label>
                <br /><br /> */}

                <button type="submit">Create Task</button>
            </form>
        </div>
    );
}
