import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const TaskColumn = ({
  title,
  status,
  tasks = [],
  onEdit,
  onDelete,
  onStatusChange,
  teamMembers = [],
}) => {
  const columnColorMap = {
    'todo': 'border-t-4 border-t-gray-400 bg-gray-50/50 dark:bg-gray-900/30',
    'in-progress': 'border-t-4 border-t-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/5',
    'review': 'border-t-4 border-t-amber-500 bg-amber-50/10 dark:bg-amber-950/5',
    'done': 'border-t-4 border-t-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5',
  };

  const badgeColorMap = {
    'todo': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    'in-progress': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
    'review': 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    'done': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  };

  return (
    <div className={`flex flex-col rounded-2xl border border-gray-200 p-4 transition-colors duration-200 dark:border-gray-800 ${
      columnColorMap[status] || columnColorMap.todo
    }`}>
      {/* Column Header */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
          {title}
        </h3>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
          badgeColorMap[status] || badgeColorMap.todo
        }`}>
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-3 min-h-[400px] rounded-xl p-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver ? (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 p-6 text-center dark:border-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  No tasks
                </span>
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  teamMembers={teamMembers}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskColumn;
