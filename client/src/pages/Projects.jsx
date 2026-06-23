import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import ProjectCard from '../components/project/ProjectCard';
import ProjectForm from '../components/project/ProjectForm';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useConfirm } from '../context/ModalContext';

const Projects = () => {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [projects, setProjects] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get('/projects');
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load projects.');
    }
  };

  const fetchFormMetadata = async () => {
    try {
      const supervisorsRes = await axiosInstance.get('/users/instructors');
      setSupervisors(supervisorsRes.data || []);
      const teamsRes = await axiosInstance.get('/teams');
      setTeams(teamsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchFormMetadata()]);
      setLoading(false);
    };
    initPage();
  }, []);

  const handleCreateSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const response = await axiosInstance.post('/projects', formData);
      setProjects((prev) => [response.data, ...prev]);
      setIsCreateOpen(false);
      toast.success('Project proposed successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create project proposal.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (project) => {
    setCurrentProject(project);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const response = await axiosInstance.put(`/projects/${currentProject._id}`, formData);
      setProjects((prev) =>
        prev.map((proj) => (proj._id === currentProject._id ? response.data : proj))
      );
      setIsEditOpen(false);
      toast.success('Project updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = async (projectId) => {
    const ok = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This will delete associated tasks, meetings, and documents.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;

    try {
      await axiosInstance.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((proj) => proj._id !== projectId));
      toast.success('Project deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete project.');
    }
  };

  // Filter projects by search query and status filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? project.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Final Year Projects
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Browse, search, and manage project proposals and assignments.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsCreateOpen(true)}
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 sm:w-auto"
          >
            <FaPlus className="h-4 w-4" />
            Propose Project
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-150 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FaSearch className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-800/40 dark:text-white"
            placeholder="Search projects by title or description..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter status */}
        <div className="relative min-w-[200px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FaFilter className="h-3.5 w-3.5" />
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-xl border border-gray-250 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try broadening your search or propose a new project project."
          actionText={searchQuery || statusFilter ? "Clear Filters" : "Propose Project"}
          onActionClick={() => {
            if (searchQuery || statusFilter) {
              setSearchQuery('');
              setStatusFilter('');
            } else {
              setIsCreateOpen(true);
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div key={project._id} className="relative group h-full">
              <ProjectCard project={project} />
              
              {/* Overlay controls for Edit/Delete (visible on hover) */}
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                {(user.role === 'admin' || user.role === 'instructor' || project.supervisor?._id === user.id) && (
                  <>
                    <button
                      onClick={() => handleEditClick(project)}
                      className="rounded-lg bg-white p-2 text-gray-600 shadow-sm border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition dark:bg-gray-800 dark:text-gray-300 dark:border-gray-750 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(project._id)}
                      className="rounded-lg bg-white p-2 text-red-600 shadow-sm border border-gray-100 hover:bg-red-50 hover:text-red-700 transition dark:bg-gray-800 dark:text-red-400 dark:border-gray-750 dark:hover:bg-red-950/30"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Propose Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Propose New Project">
        <ProjectForm
          supervisors={supervisors}
          teams={teams}
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          loading={formLoading}
          userRole={user.role}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Project">
        <ProjectForm
          initialData={currentProject}
          supervisors={supervisors}
          teams={teams}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditOpen(false)}
          loading={formLoading}
          isEdit={true}
          userRole={user.role}
        />
      </Modal>
    </div>
  );
};

export default Projects;
