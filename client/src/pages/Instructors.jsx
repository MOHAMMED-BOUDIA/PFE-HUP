import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaArrowRight, FaBookOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const Instructors = () => {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState([]);
  const [groupsMap, setGroupsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'student') {
          const membershipRes = await axiosInstance.get('/groups/my-membership');
          const approved = membershipRes.data.status === 'approved';

          if (approved) {
            const instructorRes = await axiosInstance.get('/users/my-instructor');
            const instructor = instructorRes.data;
            setInstructors([instructor]);

            if (instructor?._id) {
              const groupsRes = await axiosInstance.get(`/groups/instructor/${instructor._id}`);
              setGroupsMap({ [instructor._id]: groupsRes.data || [] });
            }
            return;
          }
        }

        const [usersRes, groupsRes] = await Promise.all([
          axiosInstance.get('/users/instructors'),
          axiosInstance.get('/groups'),
        ]);
        const instrs = usersRes.data || [];
        const groups = groupsRes.data || [];
        
        const groupMap = {};
        instrs.forEach(inst => {
          const instGroups = groups.filter(g => g.instructor?._id === inst._id || g.instructor === inst._id);
          groupMap[inst._id] = instGroups;
        });
        
        setInstructors(instrs);
        setGroupsMap(groupMap);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load instructors');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Instructors</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Browse instructors and their groups to find your project supervisor.
        </p>
      </div>

      {instructors.length === 0 ? (
        <EmptyState
          title="No instructors found"
          description="There are no instructors registered in the system yet."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {instructors.map((inst) => {
            const instGroups = groupsMap[inst._id] || [];
            return (
              <div
                key={inst._id}
                className="group relative rounded-3xl border border-gray-150 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center gap-4">
                  {inst.avatar ? (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-md">
                      <img
                        src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${inst.avatar.replace(/\\/g, '/')}`}
                        alt={inst.name}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-md">
                      {inst.name ? inst.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'I'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {inst.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {inst.department || 'No department'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <FaBookOpen className="h-4 w-4 text-indigo-400" />
                    <span>{instGroups.length} {instGroups.length === 1 ? 'group' : 'groups'}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {[...new Set(instGroups.map(g => g.specialty).filter(Boolean))].slice(0, 3).map((spec, i) => (
                    <span key={i} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="mt-5">
                  <Link
                    to={`/instructors/${inst._id}/groups`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700"
                  >
                    <FaUsers className="h-4 w-4" />
                    View Groups
                    <FaArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Instructors;
