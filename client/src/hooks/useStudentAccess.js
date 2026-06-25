import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const useStudentAccess = () => {
  const { user } = useAuth();
  const [membership, setMembership] = useState({ status: 'none', group: null });
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMembership({ status: 'none', group: null });
      setLoading(false);
      return;
    }
    if (fetched.current && membership.status !== 'none') return;
    fetched.current = true;
    const fetch = async () => {
      try {
        const res = await axiosInstance.get('/groups/my-membership');
        setMembership(res.data);
      } catch {
        setMembership({ status: 'none', group: null });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    isApproved: membership.status === 'approved',
    isPending: membership.status === 'pending',
    isNone: membership.status === 'none',
    group: membership.group,
    loading,
    refetch: () => {
      setLoading(true);
      fetched.current = true;
      axiosInstance.get('/groups/my-membership').then(res => {
        setMembership(res.data);
      }).catch(() => {
        setMembership({ status: 'none', group: null });
      }).finally(() => setLoading(false));
    }
  };
};

export default useStudentAccess;
