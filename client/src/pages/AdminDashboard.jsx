import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {
  FiUsers, FiUser, FiUserCheck, FiLayers,
  FiTrendingUp, FiTarget, FiAward, FiActivity
} from 'react-icons/fi';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
    <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center text-white text-2xl`}>
      {icon}
    </div>
  </div>
);

const CompletionCard = ({ title, rate, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-2xl" style={{ color }}>{icon}</div>
      <h3 className="font-semibold">{title}</h3>
    </div>
    <div className="flex items-end gap-2 mb-3">
      <span className="text-4xl font-bold" style={{ color }}>{rate}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${rate}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    axiosInstance.get('/analytics')
      .then(res => { if (mounted) setData(res.data); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-center text-gray-500">No data available</div>;

  const growthData = data.userGrowth.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    Students: item.students,
    Instructors: item.instructors,
    Total: item.total
  }));

  const projectStatusData = [
    { name: 'Completed', value: data.stats.completedProjects, color: '#10b981' },
    { name: 'In Progress', value: data.stats.inProgressProjects, color: '#0084D1' },
    { name: 'Pending', value: data.stats.pendingProjects, color: '#FFB900' },
  ];

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Analytics</h1>
        <p className="text-gray-500">Comprehensive overview of platform activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<FiUsers />} label="Total Users" value={data.stats.totalUsers} color="bg-[#0084D1]" />
        <StatCard icon={<FiUser />} label="Students" value={data.stats.totalStudents} color="bg-green-500" />
        <StatCard icon={<FiUserCheck />} label="Instructors" value={data.stats.totalInstructors} color="bg-[#FFB900]" />
        <StatCard icon={<FiLayers />} label="Total Groups" value={data.stats.totalGroups} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletionCard title="Project Completion Rate" rate={data.stats.completionRate} icon={<FiTarget />} color="#0084D1" />
        <CompletionCard title="Task Completion Rate" rate={data.stats.taskCompletionRate} icon={<FiAward />} color="#FFB900" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-[#0084D1]" /> User Growth (Last 12 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={growthData}>
            <defs>
              <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0084D1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0084D1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorInstructors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB900" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FFB900" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="Students" stroke="#0084D1" fillOpacity={1} fill="url(#colorStudents)" />
            <Area type="monotone" dataKey="Instructors" stroke="#FFB900" fillOpacity={1} fill="url(#colorInstructors)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={projectStatusData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}>
                {projectStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Users by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.departmentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0084D1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiActivity className="text-[#FFB900]" /> Activity Heatmap (Last Year)
        </h3>
        <div className="overflow-x-auto">
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={data.activityData}
            classForValue={(value) => {
              if (!value) return 'color-empty';
              if (value.count >= 10) return 'color-scale-4';
              if (value.count >= 5) return 'color-scale-3';
              if (value.count >= 2) return 'color-scale-2';
              return 'color-scale-1';
            }}
            tooltipDataAttrs={(value) => ({
              'data-tip': value?.date ? `${value.date}: ${value.count} activities` : 'No data'
            })}
          />
        </div>
        <style>{`
          .color-empty { fill: #ebedf0; }
          .color-scale-1 { fill: #c6e6f5; }
          .color-scale-2 { fill: #7cc3e3; }
          .color-scale-3 { fill: #2196f3; }
          .color-scale-4 { fill: #0084D1; }
        `}</style>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiAward className="text-[#FFB900]" /> Most Active Instructors
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Instructor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Department</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Groups</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Students</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.topInstructors.map((inst, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    {i === 0 && <span>🥇</span>}
                    {i === 1 && <span>🥈</span>}
                    {i === 2 && <span>🥉</span>}
                    {i > 2 && <span className="text-gray-500">#{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{inst.name}</div>
                      <div className="text-xs text-gray-500">{inst.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{inst.department || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {inst.groupsCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {inst.studentsCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
