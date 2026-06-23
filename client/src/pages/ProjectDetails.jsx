import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaChalkboardTeacher, 
  FaUsers, 
  FaTasks, 
  FaFileAlt, 
  FaCalendarCheck, 
  FaArrowLeft, 
  FaTrash, 
  FaDownload, 
  FaPlus 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/helpers';
import { useConfirm } from '../context/ModalContext';

const ProjectDetails = () => {
  const confirm = useConfirm();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status/Progress editing states
  const [statusVal, setStatusVal] = useState('pending');
  const [progressVal, setProgressVal] = useState(0);
  const [updating, setUpdating] = useState(false);

  const fetchProjectData = async () => {
    try {
      const res = await axiosInstance.get(`/projects/${id}`);
      setProject(res.data);
      setStatusVal(res.data.status || 'pending');
      setProgressVal(res.data.progress || 0);

      // Fetch related data
      const [tasksRes, docsRes, meetingsRes] = await Promise.all([
        axiosInstance.get(`/tasks/project/${id}`).catch(() => ({ data: [] })),
        axiosInstance.get(`/documents/project/${id}`).catch(() => ({ data: [] })),
        axiosInstance.get(`/meetings/project/${id}`).catch(() => ({ data: [] }))
      ]);

      setTasks(tasksRes.data || []);
      setDocuments(docsRes.data || []);
      setMeetings(meetingsRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load project details.');
      navigate('/projects');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProjectData();
    setLoading(false);
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await axiosInstance.patch(`/projects/${id}/status`, { status: newStatus });
      setStatusVal(newStatus);
      setProject(prev => ({ ...prev, status: newStatus }));
      toast.success('Status updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axiosInstance.patch(`/projects/${id}/progress`, { progress: progressVal });
      setProject(prev => ({ ...prev, progress: progressVal }));
      toast.success('Progress updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update progress.');
    } finally {
      setUpdating(false);
    }
  };

  // Delete document
  const handleDeleteDoc = async (docId) => {
    const ok = await confirm({ title: 'Delete Document', message: 'Delete this document?', confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    try {
      await axiosInstance.delete(`/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d._id !== docId));
      toast.success('Document deleted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete document.');
    }
  };

  // Delete meeting
  const handleDeleteMeeting = async (meetId) => {
    const ok = await confirm({ title: 'Delete Meeting', message: 'Delete this meeting?', confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    try {
      await axiosInstance.delete(`/meetings/${meetId}`);
      setMeetings(prev => prev.filter(m => m._id !== meetId));
      toast.success('Meeting deleted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete meeting.');
    }
  };

  if (loading || !project) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Calculate task counts by status
  const taskCounts = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    { todo: 0, 'in-progress': 0, review: 0, done: 0 }
  );

  const isSupervisorOrAdmin = user.role === 'admin' || user.role === 'instructor';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <FaArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      {/* Main Project Overview Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Core Info */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {project.title}
            </h1>
            <StatusBadge status={project.status} />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Technologies</h3>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map(tech => (
                  <span
                    key={tech}
                    className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timeline & Metadata */}
          <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 dark:border-gray-800 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 dark:bg-gray-800">
                <FaCalendarAlt className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">PROJECT TIMELINE</p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </p>
              </div>
            </div>

            {project.supervisor && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 dark:bg-gray-800">
                  <FaChalkboardTeacher className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">SUPERVISOR</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {project.supervisor.name} ({project.supervisor.department})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress & Controls Card */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Project Progress</h3>
            
            {/* Progress Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 dark:text-gray-400">Completion</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{project.progress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Controls for status updates */}
            {isSupervisorOrAdmin && (
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Update Project Status
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={updating}
                  className="block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:bg-gray-50 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            {/* Progress updating form (for everyone, but typically team/supervisor handles it) */}
            <form onSubmit={handleUpdateProgress} className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Update Progress: {progressVal}%
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progressVal}
                onChange={(e) => setProgressVal(parseInt(e.target.value, 10))}
                className="h-2 w-full cursor-pointer rounded-lg bg-gray-200 accent-indigo-600 dark:bg-gray-800"
              />
              <button
                type="submit"
                disabled={updating || progressVal === project.progress}
                className="w-full rounded-xl bg-indigo-50 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 transition dark:bg-indigo-950/40 dark:text-indigo-400"
              >
                Save Progress
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Grid: Team & Tasks */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Team Members card */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaUsers className="h-5 w-5 text-indigo-500" />
              Assigned Team
            </h3>
            {project.team && (
              <span className="text-xs font-semibold text-gray-400">{project.team.name}</span>
            )}
          </div>

          {!project.team ? (
            <div className="text-center py-6 text-sm text-gray-400">
              No team is currently assigned to this project.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {project.team.members && project.team.members.map((member) => (
                <div key={member._id || member.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-xs dark:bg-purple-950/40 dark:text-purple-400">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {member.name} {member._id === project.team.leader?._id && <span className="ml-1 text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase">Leader</span>}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.email} • {member.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks Summary card */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaTasks className="h-5 w-5 text-indigo-500" />
              Tasks Summary
            </h3>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Open Kanban Board
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/40 text-center space-y-1">
              <span className="text-xs font-bold text-gray-500">To Do</span>
              <p className="text-2xl font-black text-gray-800 dark:text-white">{taskCounts.todo}</p>
            </div>
            <div className="rounded-2xl bg-indigo-50/50 p-4 dark:bg-indigo-950/20 text-center space-y-1">
              <span className="text-xs font-bold text-indigo-500">In Progress</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{taskCounts['in-progress']}</p>
            </div>
            <div className="rounded-2xl bg-amber-50/50 p-4 dark:bg-amber-950/20 text-center space-y-1">
              <span className="text-xs font-bold text-amber-500">In Review</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{taskCounts.review}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50/50 p-4 dark:bg-emerald-950/20 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-500">Completed</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{taskCounts.done}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Documents & Meetings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Documents panel */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaFileAlt className="h-5 w-5 text-indigo-500" />
              Documents List
            </h3>
            <Link
              to="/documents"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 inline-flex items-center gap-1"
            >
              <FaPlus className="h-3 w-3" /> Upload
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              No documents uploaded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-150 dark:divide-gray-800 max-h-[300px] overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between py-3">
                  <div className="flex items-start gap-2.5 overflow-hidden pr-4">
                    <FaFileAlt className="h-5 w-5 mt-0.5 text-indigo-500 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-gray-400 capitalize">
                        {doc.type} • {doc.comment || 'No comment'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.file && (
                      <a
                        href={`http://localhost:5000/uploads/${doc.file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        title="Download file"
                      >
                        <FaDownload className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteDoc(doc._id)}
                      className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      title="Delete document"
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meetings panel */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaCalendarCheck className="h-5 w-5 text-indigo-500" />
              Scheduled Meetings
            </h3>
            <Link
              to="/meetings"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 inline-flex items-center gap-1"
            >
              <FaPlus className="h-3 w-3" /> Schedule
            </Link>
          </div>

          {meetings.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              No meetings scheduled yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-150 dark:divide-gray-800 max-h-[300px] overflow-y-auto pr-1">
              {meetings.map((meet) => (
                <div key={meet._id} className="flex items-center justify-between py-3">
                  <div className="flex items-start gap-2.5">
                    <FaCalendarAlt className="h-5 w-5 mt-0.5 text-indigo-500 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {meet.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(meet.date)} at {meet.time} ({meet.location})
                      </p>
                      {meet.notes && (
                        <p className="text-[11px] text-gray-400 italic">
                          Notes: {meet.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeleteMeeting(meet._id)}
                      className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      title="Cancel meeting"
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
