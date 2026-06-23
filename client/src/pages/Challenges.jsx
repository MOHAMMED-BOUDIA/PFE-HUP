import { useState, useEffect, useMemo } from 'react';
import { FaHeart, FaExternalLinkAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

const CATEGORIES = ['All', 'HTML/CSS', 'React', 'Node.js', 'MongoDB', 'Full Stack', 'Python', 'Mobile', 'Other'];

const initialForm = {
  title: '', description: '', category: '', technologies: '', author: '', projectUrl: '', image: '', rank: ''
};

const rankBadge = (index) => {
  if (index === 0) return { emoji: '\u{1F947}', label: '#1', color: 'text-amber-400' };
  if (index === 1) return { emoji: '\u{1F948}', label: '#2', color: 'text-gray-400' };
  if (index === 2) return { emoji: '\u{1F949}', label: '#3', color: 'text-amber-700' };
  return { emoji: '', label: `#${index + 1}`, color: 'text-gray-500' };
};

const rankBorder = (index) => {
  if (index === 0) return 'border-t-4 border-amber-400 shadow-md shadow-amber-400/10 bg-amber-50/30 dark:bg-amber-950/10';
  if (index === 1) return 'border-t-4 border-gray-300 shadow-md shadow-gray-300/10 bg-gray-50/30 dark:border-gray-600 dark:bg-gray-800/30';
  if (index === 2) return 'border-t-4 border-amber-700 shadow-md shadow-amber-700/10 bg-amber-950/5 dark:border-amber-800 dark:bg-amber-950/15';
  return 'border-gray-200 dark:border-gray-800';
};

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const canManage = user?.role === 'instructor' || user?.role === 'admin';

  const fetchChallenges = async () => {
    try {
      const res = await axiosInstance.get('/challenges');
      setChallenges(res.data || []);
    } catch (err) {
      toast.error('Failed to load challenges.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchChallenges();
      setLoading(false);
    };
    init();
  }, []);

  const sorted = useMemo(() => {
    const sorted = [...challenges].sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      if (a.rank) return -1;
      if (b.rank) return 1;
      const votesA = a.votes?.length || 0;
      const votesB = b.votes?.length || 0;
      if (votesB !== votesA) return votesB - votesA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return sorted;
  }, [challenges]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return sorted;
    return sorted.filter((c) => {
      const catMatch = c.category?.toLowerCase() === activeCategory.toLowerCase();
      const techMatch = c.technologies?.some(
        (t) => t.toLowerCase() === activeCategory.toLowerCase()
      );
      return catMatch || techMatch;
    });
  }, [sorted, activeCategory]);

  const userVoted = (challenge) => {
    return challenge.votes?.some((v) => {
      if (typeof v === 'object') return v._id === user?.id || v === user?.id;
      return v === user?.id;
    });
  };

  const handleVote = async (id) => {
    try {
      const res = await axiosInstance.post(`/challenges/${id}/vote`);
      setChallenges((prev) =>
        prev.map((c) => (c._id === id ? res.data : c))
      );
    } catch (err) {
      toast.error('Failed to vote.');
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (challenge) => {
    setEditing(challenge);
    setForm({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      technologies: challenge.technologies?.join(', ') || '',
      author: challenge.author,
      projectUrl: challenge.projectUrl,
      image: challenge.image || '',
      rank: challenge.rank || ''
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.author || !form.projectUrl) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      technologies: form.technologies ? form.technologies.split(',').map((t) => t.trim()).filter(Boolean) : [],
      rank: form.rank ? Number(form.rank) : null
    };
    try {
      if (editing) {
        const res = await axiosInstance.put(`/challenges/${editing._id}`, payload);
        setChallenges((prev) =>
          prev.map((c) => (c._id === editing._id ? res.data : c))
        );
        toast.success('Challenge updated!');
      } else {
        const res = await axiosInstance.post('/challenges', payload);
        setChallenges((prev) => [...prev, res.data]);
        toast.success('Challenge added!');
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
      await axiosInstance.delete(`/challenges/${id}`);
      setChallenges((prev) => prev.filter((c) => c._id !== id));
      toast.success('Challenge deleted.');
    } catch (err) {
      toast.error('Failed to delete challenge.');
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
            Challenges - Best Projects
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Discover the top projects ranked by technology
          </p>
        </div>
        {canManage && (
          <button
            onClick={openAdd}
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition dark:bg-indigo-600 dark:hover:bg-indigo-500 sm:w-auto"
          >
            <FaPlus className="h-3.5 w-3.5" />
            Add Challenge
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenge Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FiAward}
          title="No challenges yet"
          description="No projects have been added to the challenges yet."
          actionText={canManage ? 'Add Challenge' : undefined}
          onActionClick={canManage ? openAdd : undefined}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((challenge, idx) => {
            const rank = rankBadge(idx);
            const border = rankBorder(idx);
            const voted = userVoted(challenge);

            return (
              <div
                key={challenge._id}
                className={`group relative flex flex-col rounded-2xl border bg-white p-5 transition-all duration-200 hover:shadow-lg dark:bg-gray-900 ${border}`}
              >
                {/* Rank Badge */}
                <div className={`mb-3 flex items-center gap-1.5 ${rank.color}`}>
                  {rank.emoji && <span className="text-xl">{rank.emoji}</span>}
                  <span className={`text-lg font-black ${rank.color}`}>{rank.label}</span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {challenge.title}
                </h3>

                {/* Description */}
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
                  {challenge.description}
                </p>

                {/* Tech Stack */}
                {challenge.technologies?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {challenge.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author */}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    {challenge.author?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {challenge.author}
                  </span>
                </div>

                {/* Actions row */}
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                  {/* Vote button */}
                  <button
                    onClick={() => handleVote(challenge._id)}
                    type="button"
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      voted
                        ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/30'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FaHeart className={`h-3.5 w-3.5 ${voted ? 'fill-current' : ''}`} />
                    <span>{challenge.votes?.length || 0}</span>
                  </button>

                  {/* View Project */}
                  <a
                    href={challenge.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
                  >
                    <FaExternalLinkAlt className="h-3 w-3" />
                    View Project
                  </a>

                  {/* Admin actions */}
                  {canManage && (
                    <>
                      <button
                        onClick={() => openEdit(challenge)}
                        type="button"
                        className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                        title="Edit"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(challenge._id)}
                        disabled={deleting === challenge._id}
                        type="button"
                        className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <FaTrash className={`h-4 w-4 ${deleting === challenge._id ? 'animate-pulse' : ''}`} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Challenge' : 'Add Challenge'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Project title"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-500"
              >
                <option value="">Select category</option>
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the project..."
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Author <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Author name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                name="projectUrl"
                value={form.projectUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Technologies (comma separated)
              </label>
              <input
                type="text"
                name="technologies"
                value={form.technologies}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image URL (optional)
              </label>
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/image.png"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Manual Rank (optional - leave empty for auto-rank by votes)
            </label>
            <input
              type="number"
              name="rank"
              value={form.rank}
              onChange={handleChange}
              placeholder="e.g. 1"
              min="1"
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
                'Update Challenge'
              ) : (
                'Add Challenge'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Challenges;
