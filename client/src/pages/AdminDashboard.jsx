import { useState, useEffect } from 'react';
import { FaUsers, FaChalkboardTeacher, FaGraduationCap, FaLayerGroup } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import axiosInstance from '../api/axios';
import StatsCard from '../components/common/StatsCard';
import Loader from '../components/common/Loader';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalAdmins: 0,
    totalGroups: 0,
    totalProjects: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
  });
  const [statusChartData, setStatusChartData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [topInstructors, setTopInstructors] = useState([]);

  const COLORS = {
    'Pending': '#f59e0b',
    'Approved': '#0284c7',
    'In Progress': '#8b5cf6',
    'Completed': '#10b981',
    'Rejected': '#ef4444',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes, projectsRes] = await Promise.all([
          axiosInstance.get('/users'),
          axiosInstance.get('/groups'),
          axiosInstance.get('/projects'),
        ]);
        const users = usersRes.data || [];
        const groups = groupsRes.data || [];
        const projects = projectsRes.data || [];

        const students = users.filter(u => u.role === 'student');
        const instructors = users.filter(u => u.role === 'instructor');
        const admins = users.filter(u => u.role === 'admin');
        const verified = users.filter(u => u.isVerified);
        const unverified = users.filter(u => !u.isVerified);

        setStats({
          totalUsers: users.length,
          totalStudents: students.length,
          totalInstructors: instructors.length,
          totalAdmins: admins.length,
          totalGroups: groups.length,
          totalProjects: projects.length,
          verifiedUsers: verified.length,
          unverifiedUsers: unverified.length,
        });

        // Status pie chart
        const statusCounts = projects.reduce((acc, curr) => {
          const s = curr.status || 'pending';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});
        const statusMap = { 'pending': 'Pending', 'approved': 'Approved', 'in-progress': 'In Progress', 'completed': 'Completed', 'rejected': 'Rejected' };
        setStatusChartData(Object.keys(statusCounts).map(key => ({
          name: statusMap[key] || key,
          value: statusCounts[key],
        })));

        // Growth chart (registrations per month)
        const monthly = {};
        users.forEach(u => {
          const d = new Date(u.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthly[key] = (monthly[key] || 0) + 1;
        });
        setGrowthData(Object.entries(monthly).sort().map(([month, count]) => ({ month, count })));

        // Top instructors by group count
        const instrGroupCount = {};
        groups.forEach(g => {
          const id = g.instructor?._id || g.instructor;
          if (id) instrGroupCount[id] = (instrGroupCount[id] || 0) + 1;
        });
        const top = instructors.map(inst => ({
          name: inst.name,
          groups: instrGroupCount[inst._id] || 0,
        })).sort((a, b) => b.groups - a.groups).slice(0, 5);
        setTopInstructors(top);

      } catch (err) {
        console.error(err);
        toast.error('Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">System-wide overview and statistics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={stats.totalUsers} icon={FaUsers} color="indigo" />
        <StatsCard title="Students" value={stats.totalStudents} icon={FaGraduationCap} color="emerald" />
        <StatsCard title="Instructors" value={stats.totalInstructors} icon={FaChalkboardTeacher} color="amber" />
        <StatsCard title="Total Groups" value={stats.totalGroups} icon={FaLayerGroup} color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Project Status Pie Chart */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Project Status Distribution</h3>
          <div className="min-h-[300px] flex items-center justify-center">
            {statusChartData.length === 0 ? (
              <span className="text-sm text-gray-400">No projects</span>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {statusChartData.map(entry => (
                      <Cell key={entry.name} fill={COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Registration Growth Chart */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">User Registrations (Monthly)</h3>
          <div className="min-h-[300px]">
            {growthData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <span className="text-sm text-gray-400">No data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Users Overview */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Users Overview</h3>
          <div className="min-h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Verified', count: stats.verifiedUsers },
                { name: 'Unverified', count: stats.unverifiedUsers },
                { name: 'Students', count: stats.totalStudents },
                { name: 'Instructors', count: stats.totalInstructors },
                { name: 'Admins', count: stats.totalAdmins },
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {['#10b981', '#ef4444', '#6366f1', '#f59e0b', '#8b5cf6'].map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Instructors */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Top Instructors by Groups</h3>
          {topInstructors.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center">
              <span className="text-sm text-gray-400">No instructors</span>
            </div>
          ) : (
            <div className="space-y-3">
              {topInstructors.map((inst, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                      {i + 1}
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{inst.name}</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{inst.groups} groups</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
