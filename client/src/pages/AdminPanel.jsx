import { useState, useEffect } from 'react';
import { FaUsers, FaProjectDiagram, FaTrash, FaCheck, FaTimes, FaExchangeAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import { useConfirm } from '../context/ModalContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Guard: if user role is not admin, show unauthorized (though protected route covers it)
  if (user?.role !== 'admin') {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-3">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-sm text-gray-500">Only system administrators can access this page.</p>
      </div>
    );
  }

  const loadData = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        axiosInstance.get('/users'),
        axiosInstance.get('/projects'),
      ]);
      setUsersList(usersRes.data || []);
      setProjectsList(projectsRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administration data.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      toast.error('You cannot delete your own admin account.');
      return;
    }
    if (!await confirm({ title: 'Delete User', message: 'Are you sure you want to delete this user? This will remove all their associations.', confirmLabel: 'Delete', destructive: true })) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${userId}`);
      setUsersList((prev) => prev.filter((u) => u._id !== userId && u.id !== userId));
      toast.success('User deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!await confirm({ title: 'Delete Project', message: 'Are you sure you want to delete this project? This cannot be undone.', confirmLabel: 'Delete', destructive: true })) {
      return;
    }

    try {
      await axiosInstance.delete(`/projects/${projectId}`);
      setProjectsList((prev) => prev.filter((p) => p._id !== projectId));
      toast.success('Project deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete project.');
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    setStatusUpdating(true);
    try {
      await axiosInstance.patch(`/projects/${projectId}/status`, { status: newStatus });
      setProjectsList((prev) =>
        prev.map((proj) => (proj._id === projectId ? { ...proj, status: newStatus } : proj))
      );
      toast.success('Project status updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update project status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/40';
      case 'instructor':
        return 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/40';
      case 'student':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          System Administration
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage system users, approve project proposals, and audit files.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('users')}
          type="button"
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all outline-none ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FaUsers className="h-4 w-4" />
          Users Directory ({usersList.length})
        </button>
        
        <button
          onClick={() => setActiveTab('projects')}
          type="button"
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all outline-none ${
            activeTab === 'projects'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FaProjectDiagram className="h-4 w-4" />
          Projects Registry ({projectsList.length})
        </button>
      </div>

      {/* Tabs Content */}
      <div className="rounded-3xl border border-gray-150 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-sm">
                {usersList.map((usr) => (
                  <tr key={usr._id || usr.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-850/20">
                    <td className="py-4 px-6 font-bold text-gray-950 dark:text-white flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs dark:bg-indigo-950/40 dark:text-indigo-400">
                        {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      {usr.name}
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {usr.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        getRoleBadgeClass(usr.role)
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                      {usr.department || '-'}
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                      {usr.phone || '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteUser(usr._id || usr.id)}
                        disabled={usr._id === user.id || usr.id === user.id}
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40"
                        title="Delete User"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
                  <th className="py-4 px-6">Project Title</th>
                  <th className="py-4 px-6">Supervisor</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Progress</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-sm">
                {projectsList.map((proj) => (
                  <tr key={proj._id} className="hover:bg-gray-50/40 dark:hover:bg-gray-850/20">
                    <td className="py-4 px-6 font-bold text-gray-950 dark:text-white max-w-[200px] truncate">
                      {proj.title}
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {proj.supervisor?.name || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={proj.status} />
                        <select
                          value={proj.status}
                          onChange={(e) => handleStatusChange(proj._id, e.target.value)}
                          disabled={statusUpdating}
                          className="rounded-lg border border-gray-250 bg-gray-50 px-2 py-1 text-xs outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-gray-300"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 w-[120px]">
                        <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${proj.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                          {proj.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteProject(proj._id)}
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Delete Project"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
