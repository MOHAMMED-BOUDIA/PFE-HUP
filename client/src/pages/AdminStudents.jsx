import { useState, useEffect } from 'react';
import { FaTrash, FaToggleOn, FaToggleOff, FaGraduationCap } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useConfirm } from '../context/ModalContext';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';

const AdminStudents = () => {
  const confirm = useConfirm();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get('/users/students');
        setStudents(res.data || []);
      } catch (err) {
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (student) => {
    if (!await confirm({ title: 'Delete Student', message: `Delete ${student.name}?`, confirmLabel: 'Delete', destructive: true })) return;
    try {
      await axiosInstance.delete(`/users/${student._id}`);
      setStudents(prev => prev.filter(s => s._id !== student._id));
      toast.success('Student deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleToggleStatus = async (student) => {
    try {
      const res = await axiosInstance.put(`/users/${student._id}`, { isVerified: !student.isVerified });
      setStudents(prev => prev.map(s => s._id === student._id ? { ...s, isVerified: res.data.isVerified } : s));
      toast.success(res.data.isVerified ? 'Student activated' : 'Student deactivated');
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  if (loading) return <div className="flex h-[70vh] items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Students ({students.length})</h2>

      <div className="rounded-3xl border border-gray-150 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">Department</th>
              <th className="py-4 px-6">Phone</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-sm">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50/40 dark:hover:bg-gray-850/20">
                <td className="py-4 px-6 font-bold text-gray-950 dark:text-white flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs dark:bg-emerald-950/40 dark:text-emerald-400">
                    {student.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  {student.name}
                </td>
                <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{student.email}</td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-400">{student.department || '-'}</td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-400">{student.phone || '-'}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${student.isVerified ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'}`}>
                    {student.isVerified ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => handleToggleStatus(student)} className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800" title="Toggle Status">
                      {student.isVerified ? <FaToggleOn className="h-4 w-4 text-emerald-500" /> : <FaToggleOff className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleDelete(student)} className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" title="Delete">
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStudents;
