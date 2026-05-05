import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Users, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = {
  active:    'bg-green-50 text-green-600',
  completed: 'bg-gray-100 text-gray-500',
  'on-hold': 'bg-yellow-50 text-yellow-600',
  archived:  'bg-gray-100 text-gray-400',
};

function ProjectCard({ project }) {
  const { stats } = project;
  const progress = stats?.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <Link to={`/projects/${project._id}`} className="card p-5 hover:shadow-md transition-all group block">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${project.color}20`, color: project.color }}>
            <FolderKanban size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-gray-400">by {project.owner?.name}</p>
          </div>
        </div>
        <span className={`badge ${STATUS_COLORS[project.status]}`}>{project.status}</span>
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <CheckCircle size={12} className="text-green-500" /> {stats?.done ?? 0} done
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} className="text-blue-500" /> {stats?.inProgress ?? 0} active
        </span>
        {stats?.overdue > 0 && (
          <span className="flex items-center gap-1 text-red-500">
            <AlertTriangle size={12} /> {stats.overdue} overdue
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <Users size={12} /> {project.members?.length ?? 0}
        </span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: project.color }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-400">{progress}% complete</span>
        {project.dueDate && (
          <span className="text-xs text-gray-400">
            Due {format(new Date(project.dueDate), 'MMM d')}
          </span>
        )}
      </div>
    </Link>
  );
}

const PROJECT_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

function CreateProjectModal({ onClose, onCreated, allUsers }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', dueDate: '', memberIds: [] });
  const [loading, setLoading] = useState(false);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(id)
        ? f.memberIds.filter(m => m !== id)
        : [...f.memberIds, id]
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      toast.success('Project created!');
      onCreated(data.project);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-slide-up">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              required placeholder="e.g. Website Redesign" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="What's this project about?" className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
            <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-300' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          {allUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Team Members</label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {allUsers.map(u => (
                  <label key={u._id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50 px-2 py-1 rounded">
                    <input type="checkbox" checked={form.memberIds.includes(u._id)}
                      onChange={() => toggleMember(u._id)} className="rounded border-gray-300 text-brand-500" />
                    <span>{u.name}</span>
                    <span className="text-xs text-gray-400">({u.role})</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { isAdmin }           = useAuth();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          api.get('/projects'),
          api.get('/auth/users'),
        ]);
        setProjects(projRes.data.projects);
        setAllUsers(userRes.data.users);
      } catch { toast.error('Failed to load projects'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderKanban size={24} className="text-brand-500" /> Projects
          </h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card p-16 text-center">
          <FolderKanban size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No projects yet</p>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4 mx-auto">
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => <ProjectCard key={p._id} project={p} />)}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          allUsers={allUsers}
          onClose={() => setShowModal(false)}
          onCreated={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  );
}
