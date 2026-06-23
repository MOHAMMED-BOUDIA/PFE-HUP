import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaPlus, FaTrash, FaUserPlus, FaUserMinus, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useConfirm } from '../context/ModalContext';

const Teams = () => {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [teams, setTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedLeader, setSelectedLeader] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');

  // Manage members form state
  const [studentToAdd, setStudentToAdd] = useState('');

  const loadData = async () => {
    try {
      const [teamsRes, studentsRes, projectsRes] = await Promise.all([
        axiosInstance.get('/teams'),
        axiosInstance.get('/users/students'),
        axiosInstance.get('/projects'),
      ]);
      setTeams(teamsRes.data || []);
      setStudents(studentsRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team data.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        name: newTeamName,
        leader: selectedLeader || null,
        members: selectedMembers,
        project: selectedProject || null,
      };

      const response = await axiosInstance.post('/teams', payload);
      setTeams((prev) => [...prev, response.data]);
      setIsCreateOpen(false);
      resetForm();
      toast.success('Team created successfully!');
      loadData(); // Reload to populated structures
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create team.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    const ok = await confirm({ title: 'Delete Team', message: 'Are you sure you want to delete this team?', confirmLabel: 'Delete', destructive: true });
    if (!ok) return;

    try {
      await axiosInstance.delete(`/teams/${teamId}`);
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
      toast.success('Team deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete team.');
    }
  };

  const handleMemberToggle = (studentId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!studentToAdd) return;

    try {
      const response = await axiosInstance.post(`/teams/${currentTeam._id}/add-member`, {
        userId: studentToAdd,
      });
      
      // Update team inside current state
      setTeams((prev) =>
        prev.map((t) => (t._id === currentTeam._id ? response.data : t))
      );
      
      // Sync with current team modal
      setCurrentTeam(response.data);
      setStudentToAdd('');
      toast.success('Member added successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add member.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    const ok = await confirm({ title: 'Remove Member', message: 'Remove this member from the team?', confirmLabel: 'Remove', destructive: true });
    if (!ok) return;

    try {
      const response = await axiosInstance.post(`/teams/${currentTeam._id}/remove-member`, {
        userId: memberId,
      });

      // Update state
      setTeams((prev) =>
        prev.map((t) => (t._id === currentTeam._id ? response.data : t))
      );
      
      setCurrentTeam(response.data);
      toast.success('Member removed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove member.');
    }
  };

  const resetForm = () => {
    setNewTeamName('');
    setSelectedLeader('');
    setSelectedMembers([]);
    setSelectedProject('');
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const isLeader = (team, member) => {
    const leaderId = team.leader?._id || team.leader;
    const memberId = member._id || member.id;
    return leaderId === memberId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Workspace Teams
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create groups, link them to projects, and organize student members.
          </p>
        </div>
        {user?.role !== 'student' && (
          <div>
            <button
              onClick={() => setIsCreateOpen(true)}
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 sm:w-auto"
            >
              <FaPlus className="h-4 w-4" />
              Create Team
            </button>
          </div>
        )}
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <EmptyState
          icon={FaUsers}
          title="No teams created yet"
          description="Build teams and link them to Final Year Projects to start assigning tasks."
          actionText="Create Team"
          onActionClick={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team._id}
              className="flex flex-col justify-between rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {team.name}
                  </h3>
                  <span className="rounded-xl bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    {team.members ? team.members.length : 0} members
                  </span>
                </div>

                {/* Linked Project */}
                <div className="mt-3">
                  <p className="text-xs text-gray-400">LINKED PROJECT</p>
                  {team.project ? (
                    <Link
                      to={`/projects/${team.project._id || team.project}`}
                      className="mt-0.5 inline-block text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 line-clamp-1"
                    >
                      {team.project.title || 'View Linked Project'}
                    </Link>
                  ) : (
                    <p className="mt-0.5 text-sm text-gray-500 italic">None</p>
                  )}
                </div>

                {/* Members List */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-400">MEMBERS</p>
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                    {team.members && team.members.map((member) => (
                      <div key={member._id || member.id} className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 py-0.5">
                        <span className="flex items-center gap-1">
                          {isLeader(team, member) && (
                            <FaCrown className="h-3 w-3 text-amber-500" title="Team Leader" />
                          )}
                          <span className={isLeader(team, member) ? 'font-bold' : ''}>
                            {member.name}
                          </span>
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {member.department}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                {user?.role !== 'student' && (
                  <button
                    onClick={() => {
                      setCurrentTeam(team);
                      setIsManageOpen(true);
                    }}
                    type="button"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    Manage Members
                  </button>
                )}
                
                {(user.role === 'admin' || user.role === 'instructor') && (
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                    title="Delete Team"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Team">
        <form onSubmit={handleCreateTeam} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Team Name *
            </label>
            <input
              type="text"
              required
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
              placeholder="e.g. Apollo Developers"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Leader */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Team Leader
              </label>
              <select
                value={selectedLeader}
                onChange={(e) => setSelectedLeader(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Leader</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Linked Project */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Linked Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Project</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Members checklist */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Select Initial Members
            </label>
            <div className="max-h-[160px] overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-2 dark:border-gray-850">
              {students.map((student) => (
                <label
                  key={student._id}
                  className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(student._id)}
                    onChange={() => handleMemberToggle(student._id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    {student.name} ({student.email} • {student.department})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <button
              onClick={() => setIsCreateOpen(false)}
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
              Create Team
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Members Modal */}
      <Modal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        title={currentTeam ? `Manage Members: ${currentTeam.name}` : 'Manage Members'}
      >
        {currentTeam && (
          <div className="space-y-6">
            {/* Add member form */}
            <form onSubmit={handleAddMember} className="flex gap-3">
              <select
                required
                value={studentToAdd}
                onChange={(e) => setStudentToAdd(e.target.value)}
                className="block flex-1 rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-gray-750 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Student to Add</option>
                {students
                  .filter((s) => !currentTeam.members?.some((m) => m._id === s._id))
                  .map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.department})
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <FaUserPlus /> Add
              </button>
            </form>

            {/* Members List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Current Members</h4>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 rounded-2xl dark:border-gray-800 px-4">
                {currentTeam.members?.length === 0 ? (
                  <p className="text-center py-4 text-xs text-gray-400">No members in this team</p>
                ) : (
                  currentTeam.members?.map((member) => (
                    <div key={member._id || member.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        {isLeader(currentTeam, member) && <FaCrown className="h-3 w-3 text-amber-500" />}
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {member.name} {isLeader(currentTeam, member) && '(Leader)'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member._id || member.id)}
                        type="button"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-lg"
                      >
                        <FaUserMinus /> Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Teams;
