import { useState, useEffect } from 'react';
import { FaFileAlt, FaFolderOpen, FaPlus, FaTrash, FaDownload, FaFileUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useConfirm } from '../context/ModalContext';

const Documents = () => {
  const confirm = useConfirm();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);

  // Modal / Form state
  const [isOpen, setIsOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // File upload state
  const [name, setName] = useState('');
  const [type, setType] = useState('rapport');
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  // Fetch projects list
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/projects');
        const projData = response.data || [];
        setProjects(projData);
        if (projData.length > 0) {
          setSelectedProjectId(projData[0]._id);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load projects list.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch documents when selected project changes
  useEffect(() => {
    if (!selectedProjectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDocuments([]);
      return;
    }

    const fetchDocs = async () => {
      setDocsLoading(true);
      try {
        const response = await axiosInstance.get(`/documents/project/${selectedProjectId}`);
        setDocuments(response.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load documents.');
      } finally {
        setDocsLoading(false);
      }
    };

    fetchDocs();
  }, [selectedProjectId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      // Auto fill name if empty
      if (!name) {
        setName(selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('type', type);
      formData.append('project', selectedProjectId);
      formData.append('comment', comment);
      formData.append('file', file);

      const response = await axiosInstance.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDocuments((prev) => [response.data, ...prev]);
      setIsOpen(false);
      resetForm();
      toast.success('Document uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    const ok = await confirm({ title: 'Delete Document', message: 'Are you sure you want to delete this document?', confirmLabel: 'Delete', destructive: true });
    if (!ok) return;

    try {
      await axiosInstance.delete(`/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      toast.success('Document deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete document.');
    }
  };

  const resetForm = () => {
    setName('');
    setType('rapport');
    setComment('');
    setFile(null);
    setFileName('');
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
            Document Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload and access project deliverables, reports, and code submissions.
          </p>
        </div>
        
        {/* Project Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 whitespace-nowrap">
            <FaFolderOpen className="text-indigo-600 dark:text-indigo-400 h-4 w-4" />
            Project:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="block w-full max-w-[280px] rounded-xl border border-gray-250 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Choose a Project</option>
            {projects.map((proj) => (
              <option key={proj._id} value={proj._id}>
                {proj.title}
              </option>
            ))}
          </select>

          {selectedProjectId && (
            <button
              onClick={() => setIsOpen(true)}
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus:outline-none dark:bg-indigo-600 dark:hover:bg-indigo-500"
              title="Upload Document"
            >
              <FaPlus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Documents Registry */}
      {!selectedProjectId ? (
        <EmptyState
          icon={FaFileAlt}
          title="Select a project first"
          description="Please choose a Final Year Project to browse and manage uploaded documents."
        />
      ) : docsLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FaFileAlt}
          title="No documents uploaded"
          description="Be the first to upload a project proposal, interim report, or presentation slide."
          actionText="Upload Document"
          onActionClick={() => setIsOpen(true)}
        />
      ) : (
        <div className="rounded-3xl border border-gray-150 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Comments</th>
                  <th className="py-4 px-6">Date Uploaded</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-sm">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50/40 dark:hover:bg-gray-850/20">
                    <td className="py-4 px-6 font-semibold text-gray-950 dark:text-white flex items-center gap-3">
                      <FaFileAlt className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{doc.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block rounded-lg bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 capitalize">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 max-w-[250px] truncate">
                      {doc.comment || '-'}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      {doc.file && (
                        <a
                          href={`http://localhost:5000/uploads/${doc.file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          title="Download document"
                        >
                          <FaDownload className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteDoc(doc._id)}
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Delete document"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Upload Document">
        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {/* File Picker Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Select File *
            </label>
            <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-6 dark:border-gray-850 bg-gray-50/50 hover:bg-white transition-colors duration-200">
              <label className="flex flex-col items-center justify-center cursor-pointer text-center w-full">
                <FaFileUpload className="h-8 w-8 text-indigo-500 mb-2" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {fileName || 'Choose a file...'}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PDF, DOCX, ZIP, PPTX (max 10MB)
                </span>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Document Display Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
              placeholder="e.g. Interim Progress Report"
            />
          </div>

          <div className="grid grid-cols-1 gap-5">
            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Document Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
              >
                <option value="rapport">Rapport (Report)</option>
                <option value="presentation">Presentation</option>
                <option value="code">Source Code (Zip)</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Comment
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
              placeholder="e.g. Draft version 1.0 for supervisor review"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-750 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400"
            >
              Upload
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Documents;
