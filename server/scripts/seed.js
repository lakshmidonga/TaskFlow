import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';

dotenv.config();

const seedData = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
  console.log(`[TaskFlow Seed] Connecting to MongoDB: ${uri}...`);

  try {
    await mongoose.connect(uri);
    console.log('[TaskFlow Seed] Connected to database.');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('[TaskFlow Seed] Existing users and tasks cleared.');

    // Create users (pre-hashing handled by User model pre-save hook)
    const admin = await User.create({
      name: 'Alex Morgan',
      email: 'admin@taskflow.dev',
      password: 'admin123',
      role: 'admin',
      department: 'Product & Management',
      avatarColor: '#6366f1',
    });

    const sarah = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@taskflow.dev',
      password: 'password123',
      role: 'member',
      department: 'Frontend Engineering',
      avatarColor: '#10b981',
    });

    const marcus = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@taskflow.dev',
      password: 'password123',
      role: 'member',
      department: 'Backend Architecture',
      avatarColor: '#06b6d4',
    });

    const elena = await User.create({
      name: 'Elena Rostova',
      email: 'elena@taskflow.dev',
      password: 'password123',
      role: 'member',
      department: 'Cloud & Infrastructure',
      avatarColor: '#f59e0b',
    });

    console.log('[TaskFlow Seed] Demo users created successfully.');

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const sampleTasks = [
      {
        title: 'Design System Migration to Reusable Components',
        description: 'Refactor client styles and atomic cards to follow the updated typography and color palette standards.',
        status: 'In Progress',
        priority: 'High',
        dueDate: tomorrow,
        assignedTo: sarah._id,
        createdBy: admin._id,
        history: [
          {
            status: 'To Do',
            note: 'Task initialized by Admin',
            updatedBy: admin._id,
            updatedAt: twoDaysAgo,
          },
          {
            status: 'In Progress',
            note: 'Began refactoring card components and color variables',
            updatedBy: sarah._id,
            updatedAt: yesterday,
          },
        ],
      },
      {
        title: 'Database Query Optimization & Indexing',
        description: 'Audit aggregation pipelines on tasks collection and ensure compound index on assignedTo + status for rapid dashboard queries.',
        status: 'In Progress',
        priority: 'High',
        dueDate: tomorrow,
        assignedTo: marcus._id,
        createdBy: admin._id,
        history: [
          {
            status: 'In Progress',
            note: 'Profiled query execution times on MongoDB',
            updatedBy: marcus._id,
            updatedAt: yesterday,
          },
        ],
      },
      {
        title: 'Production Docker Container Vulnerability Scan',
        description: 'Run automated container scan against latest Node 24 image and patch CVE dependencies.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: yesterday,
        assignedTo: elena._id,
        createdBy: admin._id,
        completedAt: yesterday,
        history: [
          {
            status: 'Completed',
            note: 'Scan passed with zero high severity vulnerabilities',
            updatedBy: elena._id,
            updatedAt: yesterday,
          },
        ],
      },
      {
        title: 'Overdue Legacy API Endpoint Cleanup',
        description: 'Remove deprecated v0 endpoints and redirect remaining consumers to v1 REST standard.',
        status: 'To Do',
        priority: 'High',
        dueDate: twoDaysAgo, // Deliberately overdue to test badge & filter
        assignedTo: marcus._id,
        createdBy: admin._id,
        history: [
          {
            status: 'To Do',
            note: 'Awaiting sprint allocation',
            updatedBy: admin._id,
            updatedAt: twoDaysAgo,
          },
        ],
      },
      {
        title: 'Mobile Responsive Touch Interactions Polish',
        description: 'Ensure touch targets on task status pills and action dropdowns meet minimum 44px WCAG touch guidelines.',
        status: 'To Do',
        priority: 'Medium',
        dueDate: inThreeDays,
        assignedTo: sarah._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement Multi-Region Database Replica Failover',
        description: 'Test automated failover between primary and secondary MongoDB instances under simulated network partitions.',
        status: 'To Do',
        priority: 'Low',
        dueDate: inFiveDays,
        assignedTo: elena._id,
        createdBy: admin._id,
      },
      {
        title: 'REST API JWT Token Expiration and Refresh Test',
        description: 'Write integration test suite verifying 401 response on expired token and seamless login redirection.',
        status: 'Completed',
        priority: 'High',
        dueDate: twoDaysAgo,
        assignedTo: marcus._id,
        createdBy: admin._id,
        completedAt: yesterday,
      },
    ];

    await Task.insertMany(sampleTasks);
    console.log(`[TaskFlow Seed] ${sampleTasks.length} sample tasks populated.`);

    console.log('\n=============================================');
    console.log('       TASKFLOW SEED DATA CREATED!           ');
    console.log('=============================================');
    console.log('Admin Account:');
    console.log('  Email:    admin@taskflow.dev');
    console.log('  Password: admin123');
    console.log('  Role:     Admin');
    console.log('\nTeam Member Accounts:');
    console.log('  Email:    sarah@taskflow.dev   | Pass: password123 (Frontend)');
    console.log('  Email:    marcus@taskflow.dev  | Pass: password123 (Backend)');
    console.log('  Email:    elena@taskflow.dev   | Pass: password123 (DevOps)');
    console.log('=============================================\n');

    await mongoose.connection.close();
    console.log('[TaskFlow Seed] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[TaskFlow Seed] Failed to seed database:', error);
    process.exit(1);
  }
};

seedData();
