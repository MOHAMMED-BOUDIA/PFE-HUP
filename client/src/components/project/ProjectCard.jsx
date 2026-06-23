import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaChalkboardTeacher, FaUsers } from 'react-icons/fa';
import StatusBadge from '../common/StatusBadge';
import { formatDate, truncateString } from '../../utils/helpers';

const ProjectCard = ({ project }) => {
  const {
    _id,
    title,
    description,
    status = 'pending',
    technologies = [],
    startDate,
    endDate,
    progress = 0,
    supervisor,
    team,
  } = project;

  // Format progress
  const progressPercent = Math.min(Math.max(parseInt(progress || 0, 10), 0), 100);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-150 bg-white p-6 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div>
        {/* Header: Status badge */}
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={status} />
          {team && (
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <FaUsers className="h-3.5 w-3.5" />
              {team.name || 'Assigned'}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <Link to={`/projects/${_id}`} className="group mt-4 block">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors duration-200">
            {title}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
            {truncateString(description, 140)}
          </p>
        </Link>

        {/* Technologies List */}
        {technologies && technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Footer info: Supervisor & Timeline */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          {supervisor && (
            <div className="flex items-center gap-1.5 font-medium">
              <FaChalkboardTeacher className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="truncate max-w-[120px]">{supervisor.name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5">
            <FaCalendarAlt className="h-3.5 w-3.5 text-gray-400" />
            <span>{formatDate(endDate || startDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
