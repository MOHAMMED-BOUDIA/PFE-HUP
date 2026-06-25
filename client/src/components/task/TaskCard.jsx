import { Draggable } from '@hello-pangea/dnd';
import { FaCalendarAlt, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';

const TaskCard = ({ task, index, onEdit, onDelete, onStatusChange }) => {
  const { _id, title, description, status, priority = 'medium', dueDate, assignedTo } = task;

  const priorityColors = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40',
    medium: 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40',
    high: 'bg-red-50 text-red-700 border-red-250 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40',
  };

  const statusOptions = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Review', value: 'review' },
    { label: 'Done', value: 'done' },
  ];

  return (
    <Draggable draggableId={_id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition-all dark:bg-gray-900 ${
            snapshot.isDragging
              ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 rotate-2'
              : 'border-gray-150 shadow-sm hover:shadow-md dark:border-gray-800'
          }`}
          style={provided.draggableProps.style}
        >
      <div>
        {/* Header: Priority */}
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              priorityColors[priority] || priorityColors.medium
            }`}
          >
            {priority}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(task)}
              type="button"
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              title="Edit Task"
            >
              <FaEdit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(_id)}
              type="button"
              className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
              title="Delete Task"
            >
              <FaTrash className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h4 className="mt-3 text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
          {title}
        </h4>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {description}
        </p>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
        {/* Assignee & Due Date */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1 font-medium">
            <FaUser className="h-3 w-3 text-indigo-500" />
            <span className="truncate max-w-[100px]">
              {assignedTo?.name || (typeof assignedTo === 'object' ? assignedTo?.name : 'Unassigned')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaCalendarAlt className="h-3 w-3 text-gray-400" />
            <span>{formatDate(dueDate)}</span>
          </div>
        </div>

        {/* Change status selector */}
        <div className="mt-3">
          <select
            value={status}
            onChange={(e) => onStatusChange(_id, e.target.value)}
            className="block w-full rounded-lg border border-gray-250 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-gray-300"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Move to: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
