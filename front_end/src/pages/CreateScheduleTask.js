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

    const [taskNameOptions, setTaskNameOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTaskHelperData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_helper`, {
                    credentials: 'include',
                });
                const data = await response.json();
                setTaskNameOptions(data.taskNames || []);
                setCategoryOptions(data.categories || []);
            } catch (err) {
                console.error('Failed to fetch task helper data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTaskHelperData();
    }, []);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

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

        const productivityScore = formData.productivityScore ? Number(formData.productivityScore) : null;
        const energyLevel = formData.energyLevel ? Number(formData.energyLevel) : 5;

        const payload = {
            taskName,
            description,
            category,
            tags: category,
            startTime,
            endTime,
            isCompleted,
            productivityScore,
            mood,
            energyLevel
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user_schedule_create`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to create task');
            } else {
                alert('Registered successfully!');
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

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
                    <span className="ml-3 text-blue-600 text-lg">Loading tasks...</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* Task Name */}
                    <label>
                        Task Name*:<br />
                        <select
                            value={formData.taskName}
                            onChange={e => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
                            style={{ width: '100%' }}
                        >
                            <option value="">-- Select a task or enter below --</option>
                            {taskNameOptions.map((name, idx) => (
                                <option key={idx} value={name}>{name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Or enter new task name"
                            value={formData.taskName}
                            onChange={handleChange}
                            name="taskName"
                            style={{ width: '100%', marginTop: '4px' }}
                        />
                    </label>
                    <br /><br />

                    {/* Description */}
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

                    {/* Category */}
                    <label>
                        Category*:<br />
                        <select
                            value={formData.category}
                            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            style={{ width: '100%' }}
                        >
                            <option value="">-- Select a category or enter below --</option>
                            {categoryOptions.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Or enter new category"
                            value={formData.category}
                            onChange={handleChange}
                            name="category"
                            style={{ width: '100%', marginTop: '4px' }}
                        />
                    </label>
                    <br /><br />

                    {/* Start Time */}
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

                    {/* End Time */}
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

                    {/* Productivity Score */}
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

                    <button type="submit">Create Task</button>
                </form>
            )}
        </div>
    );
}
