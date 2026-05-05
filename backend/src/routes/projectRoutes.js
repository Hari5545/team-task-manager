const express = require('express');
const { body } = require('express-validator');
const {
  getProjects, getProjectById, createProject, updateProject, deleteProject,
} = require('../controllers/projectController');
const { getTasks, createTask } = require('../controllers/taskController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── Validation ───────────────────────────────────────────────────────────────
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('description').optional().isLength({ max: 500 }),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be 2–200 characters'),
  body('description').optional().isLength({ max: 1000 }),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

// ── Project Routes (all require login) ──────────────────────────────────────
router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.post('/', protect, requireRole('admin'), projectValidation, createProject);
router.put('/:id', protect, requireRole('admin'), updateProject);
router.delete('/:id', protect, requireRole('admin'), deleteProject);

// ── Task Routes (nested under project) ──────────────────────────────────────
router.get('/:projectId/tasks', protect, getTasks);
router.post('/:projectId/tasks', protect, taskValidation, createTask);

module.exports = router;
