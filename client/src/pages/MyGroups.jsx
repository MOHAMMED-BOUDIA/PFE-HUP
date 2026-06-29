import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaSave, FaTimes, FaUserCheck, FaCamera, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useConfirm } from '../context/ModalContext';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const MyGroups = () => {
  const { t } = useTranslation();
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

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get('/groups/my');
      setGroups(res.data || []);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroups();
  }, []);

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

  const [processing, setProcessing] = useState(null);

  const handleDelete = async (group) => {
    if (!await confirm({ title: t('common.delete'), message: `Delete "${group.name}"? This cannot be undone.`, confirmLabel: t('common.delete'), destructive: true })) return;
    try {
      await axiosInstance.delete(`/groups/${group._id}`);
      setGroups(prev => prev.filter(g => g._id !== group._id));
      toast.success('Group deleted');
    } catch {
      toast.error('Failed to delete group');
    }
  };

  const handleApprove = async (groupId, userId) => {
    setProcessing(`approve-${groupId}-${userId}`);
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/approve/${userId}`);
      setGroups(prev => prev.map(g => g._id === groupId ? res.data : g));
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
      const res = await axiosInstance.post(`/groups/${groupId}/reject/${userId}`);
      setGroups(prev => prev.map(g => g._id === groupId ? res.data : g));
      toast.success('Request rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
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
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t('groups.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('groups.subtitle')}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0084D1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0277BD] transition-all"
        >
          <FaPlus className="h-4 w-4" />
          {t('groups.newGroup')}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-3xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editing ? t('groups.editModal') : t('groups.createModal')}
            </h3>
            <button onClick={() => { setShowForm(false); setEditing(null); setImageFile(null); setImagePreview(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('groups.groupName')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0084D1] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                placeholder={t('groups.groupNamePlaceholder')}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('groups.groupImage')}</label>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-[#0084D1] hover:text-[#0084D1] dark:border-gray-600 dark:text-gray-400 transition-colors">
                  <FaCamera className="h-4 w-4" />
                  <span>{imageFile ? imageFile.name : t('groups.chooseImage')}</span>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('groups.description')}</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0084D1] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                rows={3}
                placeholder={t('groups.descriptionPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('groups.specialty')}</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={e => setFormData({...formData, specialty: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0084D1] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                placeholder={t('groups.specialtyPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('groups.maxMembers')}</label>
              <input
                type="number"
                value={formData.maxMembers}
                onChange={e => setFormData({...formData, maxMembers: parseInt(e.target.value) || 10})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0084D1] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                min={1}
                max={50}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => { setShowForm(false); setEditing(null); setImageFile(null); setImagePreview(null); }} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
              {t('common.cancel')}
            </button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0084D1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0277BD] disabled:opacity-50">
              <FaSave className="h-4 w-4" />
              {saving ? t('groups.saving') : editing ? t('groups.updateGroup') : t('groups.createGroup')}
            </button>
          </div>
        </div>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <EmptyState
          title={t('groups.noGroups')}
          description={t('groups.noGroupsDesc')}
          actionText={t('groups.createGroup')}
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
                      <img src={(() => {
                        if (group.image.startsWith('http') || group.image.startsWith('data:')) return group.image;
                        const origin = (import.meta.env.VITE_API_URL).replace('/api', '');
                        return `${origin}${group.image.startsWith('/') ? '' : '/'}${group.image.replace(/\\/g, '/')}`;
                      })()} alt={group.name} className="h-full w-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} />
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
                      {group.status === 'open' ? t('groups.open') : t('groups.closed')}
                    </span>
                    {group.pendingRequests?.length > 0 && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                        {group.pendingRequests.length} {t('groups.pending')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(group)} className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-[#0084D1] dark:hover:bg-gray-800">
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
                <span className="mt-3 inline-block rounded-full bg-[#0084D1]/10 px-3 py-1 text-xs font-medium text-[#0084D1]">
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
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('groups.enrolledStudents')}</p>
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

                {group.pendingRequests?.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider dark:text-amber-400">
                      {t('groups.pendingRequests', { count: group.pendingRequests.length })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.pendingRequests.map((student) => (
                        <div key={student._id} className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/20">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {student.name || 'Student'}
                          </span>
                          <button
                            onClick={() => handleApprove(group._id, student._id)}
                            disabled={processing === `approve-${group._id}-${student._id}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 disabled:opacity-50 dark:bg-emerald-950/30 dark:text-emerald-400"
                            title={t('groups.approve')}
                          >
                            <FaCheckCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleReject(group._id, student._id)}
                            disabled={processing === `reject-${group._id}-${student._id}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 disabled:opacity-50 dark:bg-red-950/30 dark:text-red-400"
                            title={t('groups.reject')}
                          >
                            <FaTimesCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
