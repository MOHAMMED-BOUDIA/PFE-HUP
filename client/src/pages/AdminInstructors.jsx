import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useConfirm } from '../context/ModalContext';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';

const AdminInstructors = () => {
  const confirm = useConfirm();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchInstructors(); }, []);

  const fetchInstructors = async () => {
    try {
      const res = await axiosInstance.get('/users/instructors');
      setInstructors(res.data || []);
    } catch (err) {
      toast.error('Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', email: '', password: '', department: '', phone: '' });
    setShowForm(true);
  };

  const openEdit = (inst) => {
    setEditing(inst);
    setFormData({ name: inst.name, email: inst.email, password: '', department: inst.department || '', phone: inst.phone || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const payload = { name: formData.name, department: formData.department, phone: formData.phone };
        const res = await axiosInstance.put(`/users/${editing._id}`, payload);
        setInstructors(prev => prev.map(i => i._id === editing._id ? { ...i, ...res.data } : i));
        toast.success('Instructor updated!');
      } else {
        if (!formData.password) {
          toast.error('Password is required for new instructors');
          setSaving(false);
          return;
        }
        await axiosInstance.post('/users', formData);
        toast.success('Instructor created!');
        fetchInstructors();
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (inst) => {
    if (!await confirm({ title: 'Delete Instructor', message: `Delete ${inst.name}?`, confirmLabel: 'Delete', destructive: true })) return;
    try {
      await axiosInstance.delete(`/users/${inst._id}`);
      setInstructors(prev => prev.filter(i => i._id !== inst._id));
      toast.success('Instructor deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleToggleStatus = async (inst) => {
    // Toggle isVerified as a proxy for activate/deactivate
    try {
      const res = await axiosInstance.put(`/users/${inst._id}`, { isVerified: !inst.isVerified });
      setInstructors(prev => prev.map(i => i._id === inst._id ? { ...i, isVerified: res.data.isVerified } : i));
      toast.success(res.data.isVerified ? 'Instructor activated' : 'Instructor deactivated');
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  if (loading) return <div className="flex h-[70vh] items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Instructors ({instructors.length})</h2>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <FaPlus className="h-4 w-4" /> Add Instructor
        </button>
      </div>

      {showForm && (
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Instructor' : 'Add Instructor'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!!editing} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 disabled:opacity-50" />
            </div>
            {!editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <option value="">Select department</option>
                <option value="IT">IT</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Network & Systems">Network & Systems</option>
                <option value="Software Engineering">Software Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              <FaSave className="h-4 w-4" /> {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

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
            {instructors.map((inst) => (
              <tr key={inst._id} className="hover:bg-gray-50/40 dark:hover:bg-gray-850/20">
                <td className="py-4 px-6 font-bold text-gray-950 dark:text-white flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs dark:bg-indigo-950/40 dark:text-indigo-400">
                    {inst.name?.charAt(0).toUpperCase() || 'I'}
                  </div>
                  {inst.name}
                </td>
                <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{inst.email}</td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-400">{inst.department || '-'}</td>
                <td className="py-4 px-6 text-gray-500 dark:text-gray-400">{inst.phone || '-'}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${inst.isVerified ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'}`}>
                    {inst.isVerified ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => handleToggleStatus(inst)} className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800" title="Toggle Status">
                      {inst.isVerified ? <FaToggleOn className="h-4 w-4 text-emerald-500" /> : <FaToggleOff className="h-4 w-4" />}
                    </button>
                    <button onClick={() => openEdit(inst)} className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800" title="Edit">
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(inst)} className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" title="Delete">
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

export default AdminInstructors;
