const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * Helper: Check if user has access to a project
 * Returns { project } on success, or { error, status } on failure
 */
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found.', status: 404 };
  const isMember = project.members.some((m) => m.toString() === userId.toString());
  if (!isMember) return { error: 'Access denied to this project.', status: 403 };
  return { project };
};

/**
 * GET /api/projects/:projectId/tasks
 */
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignedTo } = req.query;

    const { error, status: errStatus } = await checkProjectAccess(projectId, req.user._id);
    if (error) return res.status(errStatus).json({ message: error });

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

/**
 * POST /api/projects/:projectId/tasks
 * BUG FIX: original code destructured `errStatus` but checkProjectAccess returns `status`
 * causing `errStatus` to always be undefined → res.status(undefined) crash on access-denied
 */
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { projectId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;

    // FIXED: was `{ error, errStatus, project }` — errStatus doesn't exist in the return value
    const { error, status: errStatus, project } = await checkProjectAccess(projectId, req.user._id);
    if (error) return res.status(errStatus).json({ message: error });

    if (assignedTo) {
      const isMember = project.members.some((m) => m.toString() === assignedTo);
      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user is not a project member.' });
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      tags: tags || [],
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Failed to create task.' });
  }
};

/**
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const { error, status: errStatus } = await checkProjectAccess(task.project._id, req.user._id);
    if (error) return res.status(errStatus).json({ message: error });

    if (req.user.role === 'member') {
      const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({ message: 'Members can only update their own tasks.' });
      }
      const { status } = req.body;
      if (status) task.status = status;
    } else {
      const allowed = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'tags'];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) task[field] = req.body[field];
      });
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task.' });
  }
};

/**
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isCreator) {
      return res.status(403).json({ message: 'Only admins or the task creator can delete tasks.' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
};

/**
 * GET /api/tasks/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    });
    const projectIds = projects.map((p) => p._id);

    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name')
      .populate('project', 'name color');

    const myTasks = allTasks.filter(
      (t) => t.assignedTo && t.assignedTo._id.toString() === userId.toString()
    );

    const now = new Date();

    const stats = {
      projects: {
        total: projects.length,
        active: projects.filter((p) => p.status === 'active').length,
        completed: projects.filter((p) => p.status === 'completed').length,
      },
      tasks: {
        total: allTasks.length,
        todo: allTasks.filter((t) => t.status === 'todo').length,
        inProgress: allTasks.filter((t) => t.status === 'in-progress').length,
        review: allTasks.filter((t) => t.status === 'review').length,
        done: allTasks.filter((t) => t.status === 'done').length,
        overdue: allTasks.filter(
          (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now
        ).length,
      },
      myTasks: {
        total: myTasks.length,
        todo: myTasks.filter((t) => t.status === 'todo').length,
        inProgress: myTasks.filter((t) => t.status === 'in-progress').length,
        done: myTasks.filter((t) => t.status === 'done').length,
        overdue: myTasks.filter(
          (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now
        ).length,
      },
      recentTasks: allTasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    };

    res.json({ stats });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getDashboardStats };
