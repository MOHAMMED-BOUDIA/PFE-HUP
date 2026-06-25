import { useState, useEffect } from 'react';
import { FaProjectDiagram, FaUsers, FaTasks, FaCalendarAlt, FaPlus, FaChalkboardTeacher, FaUserGraduate, FaLayerGroup, FaArrowRight, FaBell, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import StatsCard from '../components/common/StatsCard';
import ProjectCard from '../components/project/ProjectCard';
import Loader from '../components/common/Loader';


const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ projectsCount: 0, teamsCount: 0, tasksCount: 0, meetingsCount: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [statusChartData, setStatusChartData] = useState([]);
  const [progressChartData, setProgressChartData] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (user?.role !== 'student') return;
    let cancelled = false;
    axiosInstance.get('/groups/my-membership').then(res => {
      if (cancelled) return;
      if (res.data.status !== 'approved' && location.pathname !== '/instructors') {
        navigate('/instructors', { replace: true });
      }
    }).catch(() => {
      if (!cancelled && location.pathname !== '/instructors') {
        navigate('/instructors', { replace: true });
      }
    });
    return () => { cancelled = true; };
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsRes, teamsRes] = await Promise.all([
          axiosInstance.get('/projects'),
          axiosInstance.get('/teams'),
        ]);
        const projects = projectsRes.data || [];
        const teams = teamsRes.data || [];

        let totalTasks = 0;
        let totalMeetings = 0;
        await Promise.all(projects.map(async (p) => {
          try { const r = await axiosInstance.get(`/tasks/project/${p._id}`); totalTasks += (r.data || []).length; } catch { /* ignore */ }
          try { const r = await axiosInstance.get(`/meetings/project/${p._id}`); totalMeetings += (r.data || []).length; } catch { /* ignore */ }
        }));

        setStats({ projectsCount: projects.length, teamsCount: teams.length, tasksCount: totalTasks, meetingsCount: totalMeetings });

        const sorted = [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
        setRecentProjects(sorted);

        const statusCounts = projects.reduce((acc, curr) => { const s = curr.status || 'pending'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
        const statusMap = { 'pending': 'Pending', 'approved': 'Approved', 'in-progress': 'In Progress', 'completed': 'Completed', 'rejected': 'Rejected' };
        setStatusChartData(Object.keys(statusCounts).map(k => ({ name: statusMap[k] || k, value: statusCounts[k] })));
        setProgressChartData(projects.slice(0, 8).map(p => ({ name: p.title.length > 15 ? p.title.slice(0, 15) + '...' : p.title, progress: p.progress || 0 })));

        if (user?.role === 'student') {
          try {
            const groupsRes = await axiosInstance.get('/groups');
            const allGroups = groupsRes.data || [];
            setJoinedGroups(allGroups.filter(g => g.members?.some(m => (m._id || m) === user.id)));
          } catch { /* ignore */ }
        }
        if (user?.role === 'instructor') {
          try {
            const groupsRes = await axiosInstance.get('/groups/my');
            setMyGroups(groupsRes.data || []);
          } catch { /* ignore */ }
          try {
            const pendingRes = await axiosInstance.get('/groups/pending-requests');
            setPendingRequests(pendingRes.data.requests || []);
          } catch { /* ignore */ }
        }
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleApprove = async (groupId, userId) => {
    setProcessing(`approve-${groupId}-${userId}`);
    try {
      await axiosInstance.post(`/groups/${groupId}/approve/${userId}`);
      setPendingRequests(prev => prev.filter(r => !(r.groupId === groupId && r.student.id === userId)));
      toast.success('Student approved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (groupId, userId) => {
    setProcessing(`reject-${groupId}-${userId}`);
    try {
      await axiosInstance.post(`/groups/${groupId}/reject/${userId}`);
      setPendingRequests(prev => prev.filter(r => !(r.groupId === groupId && r.student.id === userId)));
      toast.success('Request rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const COLORS = { 'Pending': '#f59e0b', 'Approved': '#0284c7', 'In Progress': '#8b5cf6', 'Completed': '#10b981', 'Rejected': '#ef4444' };

  if (loading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader size="lg" /></div>;
  }

  return (
    <div className="space-y-8 p-1">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#F59E0B] to-white p-6 shadow-lg md:flex-row md:items-center md:justify-between md:p-8">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-white md:text-3xl">
            Welcome to NAJAH, {user?.name}!
          </h1>
          <p className="text-sm font-medium text-gray-700">
            {user?.role === 'student' && "Track your projects, tasks, and group activities."}
            {user?.role === 'instructor' && "Manage your groups, projects, and students."}
            {user?.role === 'admin' && "Overview of system-wide statistics."}
          </p>
        </div>
        {user?.role === 'student' && (
          <div className="flex-shrink-0">
            <Link to="/projects" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold shadow-sm hover:bg-amber-50 transition" style={{ color: '#0284C7' }}>
              <FaPlus className="h-4 w-4" /> New Project Proposal
            </Link>
          </div>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Projects" value={stats.projectsCount} icon={FaProjectDiagram} color="indigo" />
        <StatsCard title="Active Teams" value={stats.teamsCount} icon={FaUsers} color="purple" />
        <StatsCard title="Overall Tasks" value={stats.tasksCount} icon={FaTasks} color="amber" />
        <StatsCard title="Upcoming Meetings" value={stats.meetingsCount} icon={FaCalendarAlt} color="emerald" />
      </div>

      {/* Student-specific: My Joined Groups */}
      {user?.role === 'student' && joinedGroups.length > 0 && (
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaUsers className="h-5 w-5 text-indigo-500" /> My Groups
            </h3>
            <Link to="/instructors" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Browse All Groups <FaArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {joinedGroups.map(group => (
              <div key={group._id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40">
                <h4 className="font-bold text-gray-900 dark:text-white">{group.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{group.specialty}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <FaChalkboardTeacher className="h-3 w-3" />
                  <span>{group.instructor?.name || 'Instructor'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructor-specific: My Groups Overview */}
      {user?.role === 'instructor' && (
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaLayerGroup className="h-5 w-5 text-amber-500" /> My Groups ({myGroups.length})
            </h3>
            <Link to="/my-groups" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Manage Groups <FaArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myGroups.slice(0, 3).map(group => (
              <div key={group._id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40">
                <h4 className="font-bold text-gray-900 dark:text-white">{group.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <FaUserGraduate className="inline h-3 w-3 mr-1" />
                  {group.members?.length || 0} / {group.maxMembers} students
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructor-specific: Pending Join Requests */}
      {user?.role === 'instructor' && pendingRequests.length > 0 && (
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-4">
            <FaBell className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Pending Join Requests ({pendingRequests.length})
            </h3>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={`${req.groupId}-${req.student.id}`} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    {req.student.avatar ? (
                      <img src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${req.student.avatar.replace(/\\/g, '/')}`} alt={req.student.name} className="h-full w-full object-cover object-top" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                        {req.student.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{req.student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Wants to join: <span className="font-medium text-gray-700 dark:text-gray-300">{req.groupName}</span></p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(req.groupId, req.student.id)}
                    disabled={processing === `approve-${req.groupId}-${req.student.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/20 dark:text-emerald-400"
                  >
                    <FaCheckCircle className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.groupId, req.student.id)}
                    disabled={processing === `reject-${req.groupId}-${req.student.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-400"
                  >
                    <FaTimesCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="flex flex-col rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Project Status Overview</h3>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            {statusChartData.length === 0 ? (
              <span className="text-sm text-gray-400">No project status data</span>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {statusChartData.map((entry) => (<Cell key={entry.name} fill={COLORS[entry.name] || '#6366f1'} />))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Project Progress (%)</h3>
          <div className="flex-1 min-h-[300px]">
            {progressChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center"><span className="text-sm text-gray-400">No projects to plot progress</span></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="progress" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                    {progressChartData.map((entry, idx) => (<Cell key={idx} fill={idx % 2 === 0 ? '#6366f1' : '#a855f7'} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recently Added Projects</h2>
            <Link to="/projects" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View all projects</Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (<ProjectCard key={project._id} project={project} />))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
