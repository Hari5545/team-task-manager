/**
 * Seed Script — creates demo admin + member users, projects, and tasks
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Alex Admin',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Jordan Member',
      email: 'jordan@demo.com',
      password: 'member123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Sam Developer',
      email: 'sam@demo.com',
      password: 'member123',
      role: 'member',
    });

    console.log('👥 Created users');

    // Create projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Full overhaul of the company website with modern design.',
      status: 'active',
      owner: admin._id,
      members: [admin._id, member1._id, member2._id],
      color: '#6366f1',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const project2 = await Project.create({
      name: 'Mobile App MVP',
      description: 'Build and ship the first version of our mobile app.',
      status: 'active',
      owner: admin._id,
      members: [admin._id, member2._id],
      color: '#10b981',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    console.log('📁 Created projects');

    // Create tasks
    const taskData = [
      { title: 'Design new homepage mockup', status: 'done',        priority: 'high',   project: project1._id, assignedTo: member1._id, createdBy: admin._id },
      { title: 'Set up CI/CD pipeline',      status: 'in-progress', priority: 'urgent', project: project1._id, assignedTo: member2._id, createdBy: admin._id },
      { title: 'Write API documentation',    status: 'todo',        priority: 'medium', project: project1._id, assignedTo: member1._id, createdBy: admin._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }, // overdue
      { title: 'Fix login page bug',         status: 'review',      priority: 'high',   project: project1._id, assignedTo: member2._id, createdBy: member1._id },
      { title: 'Set up React Native project', status: 'done',       priority: 'high',   project: project2._id, assignedTo: member2._id, createdBy: admin._id },
      { title: 'Implement push notifications', status: 'todo',      priority: 'medium', project: project2._id, assignedTo: member2._id, createdBy: admin._id },
      { title: 'User onboarding flow',       status: 'in-progress', priority: 'high',   project: project2._id, assignedTo: member2._id, createdBy: admin._id },
    ];

    await Task.insertMany(taskData);
    console.log('✅ Created tasks');

    console.log('\n🎉 Seed complete! Login credentials:');
    console.log('   Admin  → admin@demo.com  / admin123');
    console.log('   Member → jordan@demo.com / member123');
    console.log('   Member → sam@demo.com    / member123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
