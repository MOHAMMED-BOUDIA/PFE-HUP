import { useState, useEffect } from 'react';
import { FaBookOpen, FaExternalLinkAlt, FaPlus, FaEdit, FaTrash, FaLink } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

const initialForm = { title: '', description: '', url: '', category: '' };

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const canManage = user?.role === 'instructor' || user?.role === 'admin';

  const fetchResources = async () => {
    try {
      const res = await axiosInstance.get('/resources');
      setResources(res.data || []);
    } catch {
      toast.error('Failed to load resources.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchResources();
      setLoading(false);
    };
    init();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (resource) => {
    setEditing(resource);
    setForm({
      title: resource.title,
      description: resource.description,
      url: resource.url,
      category: resource.category
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.url || !form.category) {
      toast.error('All fields are required.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await axiosInstance.put(`/resources/${editing._id}`, form);
        setResources((prev) =>
          prev.map((r) => (r._id === editing._id ? res.data : r))
        );
        toast.success('Resource updated!');
      } else {
        const res = await axiosInstance.post('/resources', form);
        setResources((prev) => [res.data, ...prev]);
        toast.success('Resource added!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting === id) return;
    setDeleting(id);
    try {
      await axiosInstance.delete(`/resources/${id}`);
      setResources((prev) => prev.filter((r) => r._id !== id));
      toast.success('Resource deleted.');
    } catch {
      toast.error('Failed to delete resource.');
    } finally {
      setDeleting(null);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Resources
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Useful links, courses, docs, and tutorials shared by supervisors and admins.
          </p>
        </div>
        {canManage && (
          <button
            onClick={openAdd}
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition dark:bg-indigo-600 dark:hover:bg-indigo-500 sm:w-auto"
          >
            <FaPlus className="h-3.5 w-3.5" />
            Add Resource
          </button>
        )}
      </div>

      {/* Resource Cards */}
      {resources.length === 0 ? (
        <EmptyState
          icon={FaBookOpen}
          title="No resources yet"
          description="No resources have been shared yet."
          actionText={canManage ? 'Add Resource' : undefined}
          onActionClick={canManage ? openAdd : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <div
              key={resource._id}
              className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Category badge */}
              <span className="mb-3 inline-flex self-start rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                {resource.category}
              </span>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {resource.title}
              </h3>

              {/* Description */}
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
                {resource.description}
              </p>

              {/* Posted by & Date */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400 dark:border-gray-800 dark:text-gray-500">
                <span>
                  by {resource.postedBy?.name || 'Unknown'}
                </span>
                <span>
                  {new Date(resource.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions row */}
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
                >
                  <FaExternalLinkAlt className="h-3 w-3" />
                  Open Link
                </a>
                {canManage && (
                  <>
                    <button
                      onClick={() => openEdit(resource)}
                      type="button"
                      className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                      title="Edit"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource._id)}
                      disabled={deleting === resource._id}
                      type="button"
                      className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <FaTrash className={`h-4 w-4 ${deleting === resource._id ? 'animate-pulse' : ''}`} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Resource' : 'Add Resource'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. React Documentation"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the resource..."
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL
            </label>
            <div className="relative">
              <FaLink className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Documentation, Course, Tutorial, Tool"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              {saving ? (
                <Loader size="sm" />
              ) : editing ? (
                'Update Resource'
              ) : (
                'Add Resource'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Resources;
