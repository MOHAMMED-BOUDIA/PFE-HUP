import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

const TaskForm = ({
  initialData = null,
  teamMembers = [],
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedTo: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'todo',
        dueDate: initialData.dueDate ? initialData.dueDate.substring(0, 10) : '',
        assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submissionData = {
      ...formData,
      assignedTo: formData.assignedTo || null,
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Task Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1.5 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
            errors.title
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-250 focus:border-indigo-500 dark:border-gray-750'
          }`}
          placeholder="e.g. Set up MongoDB Schemas"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Description *
        </label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className={`mt-1.5 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
            errors.description
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-250 focus:border-indigo-500 dark:border-gray-750'
          }`}
          placeholder="Outline the steps required to complete this task..."
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Due Date *
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`mt-1.5 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
              errors.dueDate
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-250 focus:border-indigo-500 dark:border-gray-750'
            }`}
          />
          {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>}
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Assignee
          </label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member._id || member.id} value={member._id || member.id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
        <button
          onClick={onCancel}
          type="button"
          disabled={loading}
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-750 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400 focus:outline-none dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          {loading && <FaSpinner className="animate-spin" />}
          {isEdit ? 'Save Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
