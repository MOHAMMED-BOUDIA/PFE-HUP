import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

const ProjectForm = ({
  initialData = null,
  supervisors = [],
  teams = [],
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
  userRole = 'student',
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    supervisor: '',
    team: '',
    status: 'pending',
    startDate: '',
    endDate: '',
    progress: 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        technologies: Array.isArray(initialData.technologies)
          ? initialData.technologies.join(', ')
          : initialData.technologies || '',
        supervisor: initialData.supervisor?._id || initialData.supervisor || '',
        team: initialData.team?._id || initialData.team || '',
        status: initialData.status || 'pending',
        startDate: initialData.startDate ? initialData.startDate.substring(0, 10) : '',
        endDate: initialData.endDate ? initialData.endDate.substring(0, 10) : '',
        progress: initialData.progress || 0,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value, 10) : value,
    }));
    // Clear validation error when editing field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.technologies.trim()) newErrors.technologies = 'At least one technology is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    // Validate that end date is after start date
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert comma-separated technologies to clean array
    const techArray = formData.technologies
      .split(',')
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);

    const submissionData = {
      ...formData,
      technologies: techArray,
      // If team or supervisor is empty string, send null
      team: formData.team || null,
      supervisor: formData.supervisor || null,
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Project Title *
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
          placeholder="e.g. Decentralized Voting System"
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
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className={`mt-1.5 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
            errors.description
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-250 focus:border-indigo-500 dark:border-gray-750'
          }`}
          placeholder="Detailed breakdown of the project goals, scope, and target outcomes..."
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Technologies */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Technologies * (comma-separated)
        </label>
        <input
          type="text"
          name="technologies"
          value={formData.technologies}
          onChange={handleChange}
          className={`mt-1.5 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
            errors.technologies
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-250 focus:border-indigo-500 dark:border-gray-750'
          }`}
          placeholder="e.g. React, Node.js, MongoDB, Tailwind"
        />
        {errors.technologies && (
          <p className="mt-1 text-xs text-red-500">{errors.technologies}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Supervisor Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Supervisor
          </label>
          <select
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select Instructor</option>
            {supervisors.map((supervisor) => (
              <option key={supervisor._id || supervisor.id} value={supervisor._id || supervisor.id}>
                {supervisor.name} ({supervisor.department})
              </option>
            ))}
          </select>
        </div>

        {/* Team Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Assigned Team
          </label>
          <select
            name="team"
            value={formData.team}
            onChange={handleChange}
            className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team._id || team.id} value={team._id || team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Start Date *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`mt-1.5 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
              errors.startDate
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-250 focus:border-indigo-500 dark:border-gray-750'
            }`}
          />
          {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            End Date *
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`mt-1.5 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
              errors.endDate
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-250 focus:border-indigo-500 dark:border-gray-750'
            }`}
          />
          {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
        </div>
      </div>

      {isEdit && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Status (Admin and Supervisor only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Project Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={userRole === 'student'}
              className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/40"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Progress (Only editable if not student, or if student is allowed - usually status/progress is editable during updates) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress: {formData.progress}%
            </label>
            <input
              type="range"
              name="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleChange}
              className="mt-4 h-2 w-full cursor-pointer rounded-lg bg-gray-200 accent-indigo-600 dark:bg-gray-800"
            />
          </div>
        </div>
      )}

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
          {isEdit ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
