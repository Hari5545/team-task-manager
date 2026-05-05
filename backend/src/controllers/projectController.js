const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

/**
 * GET /api/projects
 * Return projects the current user owns or is a member of.
 */
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .sort({ updatedAt: -1 });

    // Attach task stats to each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const stats = {
          total: tasks.length,
          todo: tasks.filter((t) => t.status === 'todo').length,
          inProgress: tasks.filter((t) => t.status === 'in-progress').length,
          done: tasks.filter((t) => t.status === 'done').length,
          overdue: tasks.filter((t) => t.isOverdue).length,
        };
        return { ...project.toObject(), stats };
      })
    );

    res.json({ projects: projectsWithStats });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects.' });
  }
};

/**
 * GET /api/projects/:id
 * Get a single project with full details.
 */
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    // Check access
    const isMember = project.members.some((m) => m._id.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Access denied.' });

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project.' });
  }
};

/**
 * POST /api/projects
 * Admin only: create a new project.
 */
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description, dueDate, color, memberIds } = req.body;

    // Validate members exist
    let members = [req.user._id];
    if (memberIds && memberIds.length > 0) {
      const validUsers = await User.find({ _id: { $in: memberIds } });
      const validIds = validUsers.map((u) => u._id.toString());
      const validMemberIds = memberIds.filter((id) => validIds.includes(id));
      members = [...new Set([...members, ...validMemberIds])];
    }

    const project = await Project.create({
      name,
      description,
      dueDate,
      color: color || '#6366f1',
      owner: req.user._id,
      members,
    });

    await project.populate('owner', 'name email role');
    await project.populate('members', 'name email role');

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project.' });
  }
};

/**
 * PUT /api/projects/:id
 * Admin only: update a project.
 */
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    // Only the owner can update
    if (!project.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the project owner can update it.' });
    }

    const allowed = ['name', 'description', 'status', 'dueDate', 'color', 'members'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    // If memberIds provided, replace members list
    if (req.body.memberIds) {
      project.members = [...new Set([project.owner.toString(), ...req.body.memberIds])];
    }

    await project.save();
    await project.populate('owner', 'name email role');
    await project.populate('members', 'name email role');

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project.' });
  }
};

/**
 * DELETE /api/projects/:id
 * Admin only: delete a project and all its tasks.
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (!project.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the project owner can delete it.' });
    }

    // Delete all tasks in this project first
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and all its tasks deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project.' });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
