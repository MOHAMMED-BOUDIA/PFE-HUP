import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaSave, FaTimes, FaUserCheck, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ModalContext';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const MyGroups = () => {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', specialty: '', maxMembers: 10
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get('/groups/my');
      setGroups(res.data || []);
    } catch (err) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', description: '', specialty: '', maxMembers: 10 });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (group) => {
    setEditing(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      specialty: group.specialty || '',
      maxMembers: group.maxMembers || 10,
    });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('specialty', formData.specialty);
      fd.append('maxMembers', formData.maxMembers);
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        const res = await axiosInstance.put(`/groups/${editing._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setGroups(prev => prev.map(g => g._id === editing._id ? res.data : g));
        toast.success('Group updated!');
      } else {
        const res = await axiosInstance.post('/groups', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setGroups(prev => [...prev, res.data]);
        toast.success('Group created!');
      }
      setShowForm(false);
      setEditing(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group) => {
    if (!await confirm({ title: 'Delete Group', message: `Delete "${group.name}"? This cannot be undone.`, confirmLabel: 'Delete', destructive: true })) return;
    try {
      await axiosInstance.delete(`/groups/${group._id}`);
      setGroups(prev => prev.filter(g => g._id !== group._id));
      toast.success('Group deleted');
    } catch (err) {
      toast.error('Failed to delete group');
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
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Groups</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage student groups for your projects.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all"
        >
          <FaPlus className="h-4 w-4" />
          New Group
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editing ? 'Edit Group' : 'Create New Group'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditing(null); setImageFile(null); setImagePreview(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                placeholder="e.g. PFE Group A"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Image</label>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-500 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-500 transition-colors">
                  <FaCamera className="h-4 w-4" />
                  <span>{imageFile ? imageFile.name : 'Choose image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                rows={3}
                placeholder="Group description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialty</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={e => setFormData({...formData, specialty: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                placeholder="e.g. AI, Web Development"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Members</label>
              <input
                type="number"
                value={formData.maxMembers}
                onChange={e => setFormData({...formData, maxMembers: parseInt(e.target.value) || 10})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                min={1}
                max={50}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => { setShowForm(false); setEditing(null); setImageFile(null); setImagePreview(null); }} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              <FaSave className="h-4 w-4" />
              {saving ? 'Saving...' : editing ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </div>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <EmptyState
          title="No groups yet"
          description="Create your first group to start managing students."
          actionText="Create Group"
          onActionClick={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group._id}
              className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {group.image ? (
                    <div className="h-14 w-14 overflow-hidden rounded-xl flex-shrink-0">
                      <img src={import.meta.env.VITE_API_URL.replace('/api', '') + group.image} alt={group.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm flex-shrink-0">
                      <FaUsers className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{group.name}</h3>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1 ${
                      group.status === 'open' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {group.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(group)} className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800 dark:hover:text-indigo-400">
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(group)} className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400">
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {group.description && (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
              )}

              {group.specialty && (
                <span className="mt-3 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                  {group.specialty}
                </span>
              )}

              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    <FaUsers className="inline h-3.5 w-3.5 mr-1" />
                    {group.members?.length || 0} / {group.maxMembers} members
                  </span>
                </div>

                {group.members?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Enrolled Students</p>
                    <div className="flex flex-wrap gap-2">
                      {group.members.map((member) => (
                        <span key={member._id} className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          <FaUserCheck className="h-3 w-3 text-emerald-500" />
                          {member.name || 'Student'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGroups;
