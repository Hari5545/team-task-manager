import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, User, Calendar, MoreVertical } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const COLUMNS = [
  { id: 'todo',        label: 'To Do',      color: 'bg-gray-400' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-400' },
  { id: 'review',      label: 'Review',     color: 'bg-purple-400' },
  { id: 'done',        label: 'Done',       color: 'bg-green-400' },
];

const PRIORITY_STYLES = {
  low:    { badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  medium: { badge: 'bg-blue-50 text-blue-600',  dot: 'bg-blue-400' },
  high:   { badge: 'bg-orange-50 text-orange-600', dot: 'bg-orange-400' },
  urgent: { badge: 'bg-red-50 text-red-600',    dot: 'bg-red-400' },
};

function TaskCard({ task, onUpdate, onDelete, isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOverdue = task.dueDate && task.status !== 'done' && isPast(new Date(task.dueDate));

  const moveTask = async (newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status: newStatus });
      onUpdate(data.task);
    } catch { toast.error('Failed to update task'); }
  };

  // FIX: no longer shadows 'projectId' from useParams
  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onDelete(task._id);
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  return (
    <div className={`bg-white rounded-lg border p-3 shadow-sm group ${isOverdue ? 'border-red-200' : 'border-gray-100'} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_STYLES[task.priority]?.dot}`} />
          <span className={`badge text-xs ${PRIORITY_STYLES[task.priority]?.badge}`}>{task.priority}</span>
          {isOverdue && <span className="badge bg-red-50 text-red-500 text-xs">Overdue</span>}
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(v => !v)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all p-0.5">
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-5 bg-white border border-gray-100 rounded-lg shadow-lg z-10 w-32 py-1">
              <select className="w-full px-3 py-1.5 text-xs text-gray-700 bg-transparent hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                value={task.status} onChange={e => { moveTask(e.target.value); setMenuOpen(false); }}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              {isAdmin && (
                <button onClick={handleDelete}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-1.5">
                  <Trash2 size={11} /> Delete
                </button>
              )}
              <button onClick={() => setMenuOpen(false)}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      <p className={`text-sm font-medium text-gray-900 leading-snug mb-2 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
        {task.title}
      </p>

      <div className="space-y-1">
        {task.assignedTo && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User size={11} />
            <span className="truncate">{task.assignedTo.name}</span>
          </div>
        )}
        {task.dueDate && (
          <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
            <Calendar size={11} />
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </div>
        )}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {task.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateTaskModal({ projectId, members, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    assignedTo: '', dueDate: '', tags: '',
  });
  const [loading, setLoading] = useState(false);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
      toast.success('Task created!');
      onCreated(data.task);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">Create Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input name="title" value={form.title} onChange={handleChange}
              required placeholder="What needs to be done?" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Add more details…" className="input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input">
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input">
                <option value="">Unassigned</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
              <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input name="tags" value={form.tags} onChange={handleChange}
              placeholder="frontend, bug, api" className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  // FIX: renamed 'id' -> 'projectId' to avoid variable shadowing in callbacks
  const { id: projectId } = useParams();
  const navigate          = useNavigate();
  const { isAdmin }       = useAuth();
  const [project, setProject]     = useState(null);
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]       = useState({ priority: '', assignedTo: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/tasks`),
        ]);
        setProject(projRes.data.project);
        setTasks(taskRes.data.tasks);
      } catch {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const filteredTasks = tasks.filter(t => {
    if (filter.priority && t.priority !== filter.priority) return false;
    if (filter.assignedTo && t.assignedTo?._id !== filter.assignedTo) return false;
    return true;
  });

  const tasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

  const handleUpdate = (updatedTask) =>
    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));

  // FIX: param renamed from 'id' to 'taskId' — was shadowing useParams 'id'
  const handleDelete = (taskId) =>
    setTasks(prev => prev.filter(t => t._id !== taskId));

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-96 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-full">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            </div>
            {project.description && (
              <p className="text-sm text-gray-500 mt-0.5 ml-6">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
            className="input w-auto text-xs py-1.5">
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select value={filter.assignedTo} onChange={e => setFilter(f => ({ ...f, assignedTo: e.target.value }))}
            className="input w-auto text-xs py-1.5">
            <option value="">All members</option>
            {project.members?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-8">
        {COLUMNS.map(col => {
          const colTasks = tasksByStatus(col.id);
          return (
            <div key={col.id} className="bg-gray-50 rounded-xl p-3 min-h-[400px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <h3 className="font-semibold text-sm text-gray-700">{col.label}</h3>
                </div>
                <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {colTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    isAdmin={isAdmin}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-300">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <CreateTaskModal
          projectId={projectId}
          members={project.members || []}
          onClose={() => setShowModal(false)}
          onCreated={t => setTasks(prev => [t, ...prev])}
        />
      )}
    </div>
  );
}
