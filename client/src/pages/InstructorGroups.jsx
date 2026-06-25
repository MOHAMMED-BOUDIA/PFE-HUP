import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaUsers, FaUserPlus, FaCheck, FaArrowLeft, FaHourglassHalf, FaBan } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const InstructorGroups = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [instructor, setInstructor] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  const imgSrc = (p) => {
    if (!p) return '';
    return `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${p.startsWith('/') ? '' : '/'}${p.replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, groupsRes] = await Promise.all([
          axiosInstance.get(`/users/${id}`),
          axiosInstance.get(`/groups/instructor/${id}`),
        ]);
        setInstructor(userRes.data);
        setGroups(groupsRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRequestJoin = async (groupId) => {
    setJoining(groupId);
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/request-join`);
      setGroups(prev => prev.map(g => g._id === groupId ? res.data : g));
      toast.success('Join request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request join');
    } finally {
      setJoining(null);
    }
  };

  const isMember = (group) => group.members?.some(m => (m._id || m) === user.id);
  const isPending = (group) => group.pendingRequests?.some(m => (m._id || m) === user.id);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center gap-4">
        <Link
          to="/instructors"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <FaArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {instructor?.name || 'Instructor'}'s Groups
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {instructor?.department || ''} — {groups.length} {groups.length === 1 ? 'group' : 'groups'} available
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No groups available"
          description="This instructor hasn't created any groups yet."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const joined = isMember(group);
            const pending = isPending(group);
            const memberCount = group.members?.length || 0;
            const isFull = memberCount >= group.maxMembers;

            let btnContent;
            if (joined) {
              btnContent = (
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 cursor-default">
                  <FaCheck className="h-4 w-4" />
                  Joined ✓
                </span>
              );
            } else if (pending) {
              btnContent = (
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 cursor-default">
                  <FaHourglassHalf className="h-4 w-4" />
                  Pending Approval
                </span>
              );
            } else if (isFull) {
              btnContent = (
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-400 dark:bg-gray-800 cursor-default">
                  <FaBan className="h-4 w-4" />
                  Full
                </span>
              );
            } else {
              btnContent = (
                <button
                  onClick={() => handleRequestJoin(group._id)}
                  disabled={joining === group._id}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  <FaUserPlus className="h-4 w-4" />
                  {joining === group._id ? 'Sending...' : 'Request to Join'}
                </button>
              );
            }

            return (
              <div
                key={group._id}
                className="overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                {/* Group Image */}
                {group.image ? (
                  <div className="h-32 w-full overflow-hidden">
                    <img
                      src={imgSrc(group.image)}
                      alt={group.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500">
                    <FaUsers className="h-12 w-12 text-white/60" />
                  </div>
                )}

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {group.name}
                  </h3>
                  {group.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {group.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FaUsers className="h-4 w-4" />
                    <span>{memberCount} / {group.maxMembers} members</span>
                  </div>

                  <div className="mt-4">
                    {btnContent}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InstructorGroups;
