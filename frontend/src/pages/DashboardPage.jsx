import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CheckCircle, Clock, AlertTriangle, Folder, TrendingUp, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const PRIORITY_STYLES = {
  low:    'bg-gray-100 text-gray-600',
  medium: 'bg-blue-50 text-blue-600',
  high:   'bg-orange-50 text-orange-600',
  urgent: 'bg-red-50 text-red-600',
};

const STATUS_STYLES = {
  'todo':        'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-50 text-blue-600',
  'review':      'bg-purple-50 text-purple-600',
  'done':        'bg-green-50 text-green-600',
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const taskStats   = isAdmin ? stats?.tasks    : stats?.myTasks;
  const donePercent = taskStats?.total > 0
    ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard size={24} className="text-brand-500" />
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Good to see you, <strong>{user?.name?.split(' ')[0]}</strong>!
          {isAdmin ? ' Here\'s your team\'s overview.' : ' Here\'s your personal task overview.'}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Folder} label="Projects"
          value={stats?.projects.total ?? 0}
          sub={`${stats?.projects.active ?? 0} active`}
          color="bg-brand-50 text-brand-500"
        />
        <StatCard
          icon={TrendingUp} label={isAdmin ? 'Total Tasks' : 'My Tasks'}
          value={taskStats?.total ?? 0}
          sub={`${donePercent}% complete`}
          color="bg-green-50 text-green-500"
        />
        <StatCard
          icon={Clock} label="In Progress"
          value={taskStats?.inProgress ?? 0}
          sub="tasks active"
          color="bg-blue-50 text-blue-500"
        />
        <StatCard
          icon={AlertTriangle} label="Overdue"
          value={taskStats?.overdue ?? 0}
          sub="need attention"
          color={taskStats?.overdue > 0 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}
        />
      </div>

      {/* Progress Bar */}
      <div className="card p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-gray-700">
            {isAdmin ? 'Overall Task Progress' : 'Your Progress'}
          </p>
          <span className="text-sm font-bold text-brand-500">{donePercent}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-700"
            style={{ width: `${donePercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span>Todo: {taskStats?.todo ?? 0}</span>
          <span>In Progress: {taskStats?.inProgress ?? 0}</span>
          <span>Done: {taskStats?.done ?? 0}</span>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle size={16} className="text-brand-500" />
            Recent Tasks
          </h2>
          <Link to="/projects" className="text-xs text-brand-500 hover:underline flex items-center gap-1">
            View projects <ArrowRight size={12} />
          </Link>
        </div>

        {!stats?.recentTasks?.length ? (
          <div className="px-5 py-12 text-center">
            <p className="text-gray-400 text-sm">No tasks yet.</p>
            <Link to="/projects" className="text-brand-500 text-sm mt-1 inline-block hover:underline">
              Go to projects →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentTasks.map(task => (
              <div key={task._id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {task.project?.name} · {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${PRIORITY_STYLES[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`badge ${STATUS_STYLES[task.status]}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
