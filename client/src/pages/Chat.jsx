import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSpinner, FaCommentDots } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const Chat = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const getAvatarUrl = (p) => {
    if (!p) return '';
    return `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${p.replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        if (user?.role === 'instructor') {
          const res = await axiosInstance.get('/groups/my');
          setGroups(res.data || []);
        } else if (user?.role === 'student') {
          const membershipRes = await axiosInstance.get('/groups/my-membership');
          if (membershipRes.data.status === 'approved' && membershipRes.data.group) {
            setGroups([membershipRes.data.group]);
            setActiveGroup(membershipRes.data.group);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [user]);

  const fetchMessages = async (groupId, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
      setMessages(res.data || []);
    } catch {
      if (!silent) toast.error('Failed to load messages');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeGroup?._id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMessages(activeGroup._id);
      pollRef.current = setInterval(() => fetchMessages(activeGroup._id, true), 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [activeGroup?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await axiosInstance.post('/messages', {
        groupId: activeGroup._id,
        content: input.trim()
      });
      setMessages(prev => [...prev, res.data]);
      setInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return time;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
  };

  if (loadingGroups) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader size="lg" /></div>;
  }

  if (groups.length === 0) {
    return (
      <div className="p-1">
        <EmptyState title="No groups" description={user?.role === 'student' ? 'Join and get approved into a group to start chatting.' : 'Create a group to start chatting with students.'} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 p-1">
      {/* Group list — sidebar */}
      <div className="hidden w-64 shrink-0 flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:flex">
        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Groups</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {groups.map(g => (
            <button
              key={g._id}
              onClick={() => setActiveGroup(g)}
              className={`w-full border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-0 dark:border-gray-800/50 ${
                activeGroup?._id === g._id ? 'bg-indigo-50 dark:bg-indigo-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{g.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{g.members?.length || 0} members</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {activeGroup ? (
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{activeGroup.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeGroup.members?.length || 0} members
                {activeGroup.instructor?.name ? ` • ${activeGroup.instructor.name}` : ''}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center"><Loader size="md" /></div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <FaCommentDots className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <p className="mt-2 text-sm text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map(msg => {
                const isOwn = (msg.sender?._id || msg.sender) === user.id;
                const senderName = msg.sender?.name || 'Unknown';
                const senderAvatar = msg.sender?.avatar;
                return (
                  <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[75%] gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <div className="mt-1 h-7 w-7 shrink-0 overflow-hidden rounded-full">
                        {senderAvatar ? (
                          <img src={getAvatarUrl(senderAvatar)} alt={senderName} className="h-full w-full object-cover object-top" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-[9px] font-bold text-white">
                            {senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className={`rounded-2xl px-4 py-2 text-sm ${
                          isOwn
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200 rounded-tl-sm'
                        }`}>
                          {!isOwn && (
                            <p className="mb-0.5 text-[10px] font-semibold text-indigo-500 dark:text-indigo-400">{senderName}</p>
                          )}
                          <p>{msg.content}</p>
                        </div>
                        <p className={`mt-0.5 text-[10px] text-gray-400 ${isOwn ? 'text-right' : ''}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-gray-100 px-5 py-3 dark:border-gray-800">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {sending ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaPaperPlane className="h-4 w-4" />}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="text-center">
            <FaCommentDots className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-lg font-semibold text-gray-500 dark:text-gray-400">Select a group to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
