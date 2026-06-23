const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Group = require('./models/Group');
const Project = require('./models/project');
const Team = require('./models/team');
const Task = require('./models/task');
const Meeting = require('./models/meeting');
const Document = require('./models/document');
const Resource = require('./models/Resource');
const Challenge = require('./models/Challenge');
const Notification = require('./models/notification');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Group.deleteMany({}),
      Project.deleteMany({}),
      Team.deleteMany({}),
      Task.deleteMany({}),
      Meeting.deleteMany({}),
      Document.deleteMany({}),
      Resource.deleteMany({}),
      Challenge.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const hashed = (pw) => bcrypt.hashSync(pw, salt);

    // ─── USERS ──────────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: hashed('Admin@1234'),
      role: 'admin',
      department: 'Administration',
      isVerified: true,
    });

    const instructors = await User.create([
      {
        name: 'Dr. Sarah Benali',
        email: 'sarah@gmail.com',
        password: hashed('Instr@1234'),
        role: 'instructor',
        department: 'Computer Science',
        phone: '+213-555-0101',
        isVerified: true,
      },
      {
        name: 'Prof. Ahmed Mansouri',
        email: 'ahmed@gmail.com',
        password: hashed('Instr@1234'),
        role: 'instructor',
        department: 'Software Engineering',
        phone: '+213-555-0102',
        isVerified: true,
      },
      {
        name: 'Dr. Leila Bouchareb',
        email: 'leila@gmail.com',
        password: hashed('Instr@1234'),
        role: 'instructor',
        department: 'Data Science',
        phone: '+213-555-0103',
        isVerified: true,
      },
    ]);

    const studentData = [
      { name: 'Amine Khaled', email: 'amine.k@gmail.com', department: 'Computer Science' },
      { name: 'Meriem Ouali', email: 'meriem.o@gmail.com', department: 'Computer Science' },
      { name: 'Yacine Belaid', email: 'yacine.b@gmail.com', department: 'Software Engineering' },
      { name: 'Ines Ferhat', email: 'ines.f@gmail.com', department: 'Software Engineering' },
      { name: 'Riad Sahnoun', email: 'riad.s@gmail.com', department: 'Data Science' },
      { name: 'Nadia Kaci', email: 'nadia.k@gmail.com', department: 'Computer Science' },
      { name: 'Mohamed Lamine', email: 'mohamed.l@gmail.com', department: 'Software Engineering' },
      { name: 'Sofia Hadj', email: 'sofia.h@gmail.com', department: 'Data Science' },
      { name: 'Karim Bensaid', email: 'karim.b@gmail.com', department: 'Computer Science' },
      { name: 'Lina Cherif', email: 'lina.c@gmail.com', department: 'Software Engineering' },
    ];

    const students = await User.create(
      studentData.map((s) => ({
        ...s,
        password: hashed('Student@1234'),
        role: 'student',
        isVerified: true,
      }))
    );

    console.log(`Created: 1 admin, ${instructors.length} instructors, ${students.length} students`);

    // ─── GROUPS ─────────────────────────────────────────────────────────
    const groups = await Group.create([
      {
        name: 'AI Research Group',
        description: 'Exploring deep learning and NLP applications for final year projects.',
        specialty: 'Artificial Intelligence',
        maxMembers: 5,
        instructor: instructors[0]._id,
        members: [students[0]._id, students[1]._id, students[5]._id],
        status: 'open',
      },
      {
        name: 'Web Development Squad',
        description: 'Building modern full-stack web applications with React and Node.js.',
        specialty: 'Web Development',
        maxMembers: 6,
        instructor: instructors[1]._id,
        members: [students[2]._id, students[3]._id],
        status: 'open',
      },
      {
        name: 'Data Engineering Team',
        description: 'Working on big data pipelines, ETL, and data visualization projects.',
        specialty: 'Data Engineering',
        maxMembers: 4,
        instructor: instructors[2]._id,
        members: [students[4]._id, students[7]._id],
        status: 'open',
      },
      {
        name: 'Cybersecurity Lab',
        description: 'Researching network security, penetration testing, and secure coding.',
        specialty: 'Cybersecurity',
        maxMembers: 5,
        instructor: instructors[0]._id,
        members: [students[8]._id],
        status: 'open',
      },
      {
        name: 'Mobile Apps Studio',
        description: 'Cross-platform mobile development with Flutter and React Native.',
        specialty: 'Mobile Development',
        maxMembers: 5,
        instructor: instructors[1]._id,
        members: [students[9]._id],
        status: 'closed',
      },
    ]);

    console.log(`Created: ${groups.length} groups`);

    // ─── TEAMS ──────────────────────────────────────────────────────────
    const teams = await Team.create([
      {
        name: 'Team Alpha',
        members: [students[0]._id, students[1]._id, students[5]._id],
        leader: students[0]._id,
      },
      {
        name: 'Team Beta',
        members: [students[2]._id, students[3]._id],
        leader: students[2]._id,
      },
      {
        name: 'Team Gamma',
        members: [students[4]._id, students[7]._id],
        leader: students[4]._id,
      },
      {
        name: 'Team Delta',
        members: [students[6]._id, students[8]._id, students[9]._id],
        leader: students[6]._id,
      },
    ]);

    console.log(`Created: ${teams.length} teams`);

    // ─── PROJECTS ───────────────────────────────────────────────────────
    const projects = await Project.create([
      {
        title: 'AI-Powered Medical Diagnosis Assistant',
        description: 'A deep learning system that analyzes medical imaging to assist doctors in diagnosing diseases with high accuracy.',
        status: 'in-progress',
        team: teams[0]._id,
        supervisor: instructors[0]._id,
        technologies: ['Python', 'TensorFlow', 'CNN', 'Flask', 'Docker'],
        startDate: new Date('2025-10-01'),
        endDate: new Date('2026-05-30'),
        progress: 45,
      },
      {
        title: 'E-Commerce Platform for Local Artisans',
        description: 'A full-stack marketplace connecting local artisans with customers, featuring payment processing and real-time chat.',
        status: 'approved',
        team: teams[1]._id,
        supervisor: instructors[1]._id,
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Socket.io'],
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-06-15'),
        progress: 20,
      },
      {
        title: 'Real-Time Traffic Analytics Dashboard',
        description: 'A data pipeline and visualization dashboard for analyzing urban traffic patterns using streaming data.',
        status: 'in-progress',
        team: teams[2]._id,
        supervisor: instructors[2]._id,
        technologies: ['Apache Kafka', 'Spark', 'Python', 'D3.js', 'PostgreSQL'],
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-04-30'),
        progress: 60,
      },
      {
        title: 'Blockchain-Based Academic Credentials',
        description: 'A decentralized platform for issuing and verifying academic certificates using smart contracts.',
        status: 'pending',
        team: teams[3]._id,
        supervisor: instructors[0]._id,
        technologies: ['Solidity', 'Ethereum', 'React', 'IPFS', 'Hardhat'],
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-07-01'),
        progress: 5,
      },
      {
        title: 'Smart Campus IoT Management System',
        description: 'An IoT platform for monitoring campus energy usage, room occupancy, and environmental conditions.',
        status: 'completed',
        team: teams[0]._id,
        supervisor: instructors[1]._id,
        technologies: ['Arduino', 'AWS IoT', 'Node-RED', 'React', 'InfluxDB'],
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-12-20'),
        progress: 100,
      },
    ]);

    console.log(`Created: ${projects.length} projects`);

    // ─── TASKS ──────────────────────────────────────────────────────────
    const taskData = [];
    projects.forEach((p) => {
      taskData.push(
        { title: 'Project setup & environment configuration', status: 'done', priority: 'high', project: p._id, assignedTo: p.team?.members?.[0] || students[0]._id, createdBy: instructors[0]._id },
        { title: 'Design system architecture', status: 'done', priority: 'high', project: p._id, assignedTo: p.team?.members?.[1] || students[1]._id, createdBy: instructors[0]._id },
        { title: 'Implement core API endpoints', status: 'in-progress', priority: 'medium', project: p._id, assignedTo: p.team?.members?.[2] || students[2]._id, createdBy: instructors[0]._id },
        { title: 'Write unit tests', status: 'todo', priority: 'medium', project: p._id, assignedTo: p.team?.members?.[0] || students[0]._id, createdBy: instructors[0]._id },
        { title: 'Deploy to staging environment', status: 'todo', priority: 'low', project: p._id, assignedTo: p.team?.members?.[1] || students[1]._id, createdBy: instructors[0]._id },
      );
    });

    const tasks = await Task.create(taskData.flat());
    console.log(`Created: ${tasks.length} tasks`);

    // ─── MEETINGS ───────────────────────────────────────────────────────
    const meetings = await Meeting.create([
      {
        title: 'Project Kickoff',
        date: new Date('2026-03-10'),
        time: '10:00',
        location: 'Room 201',
        project: projects[0]._id,
        organizer: instructors[0]._id,
        participants: [students[0]._id, students[1]._id, students[5]._id],
        notes: 'Discuss project scope, milestones, and tech stack.',
        status: 'completed',
      },
      {
        title: 'Sprint Review - Week 8',
        date: new Date('2026-04-05'),
        time: '14:30',
        location: 'Online (Meet)',
        project: projects[0]._id,
        organizer: instructors[0]._id,
        participants: [students[0]._id, students[1]._id, students[5]._id],
        notes: 'Review progress on the ML model training pipeline.',
        status: 'scheduled',
      },
      {
        title: 'Architecture Review',
        date: new Date('2026-03-20'),
        time: '11:00',
        location: 'Lab 3',
        project: projects[1]._id,
        organizer: instructors[1]._id,
        participants: [students[2]._id, students[3]._id],
        notes: 'Review system architecture and API design decisions.',
        status: 'completed',
      },
      {
        title: 'Data Pipeline Sync',
        date: new Date('2026-04-12'),
        time: '09:00',
        location: 'Online (Zoom)',
        project: projects[2]._id,
        organizer: instructors[2]._id,
        participants: [students[4]._id, students[7]._id],
        notes: 'Sync on Kafka stream processing implementation.',
        status: 'scheduled',
      },
    ]);

    console.log(`Created: ${meetings.length} meetings`);

    // ─── DOCUMENTS ──────────────────────────────────────────────────────
    const documents = await Document.create([
      { name: 'Project Proposal.pdf', file: 'uploads/proposals/proposal-1.pdf', type: 'rapport', project: projects[0]._id, uploadedBy: students[0]._id, comment: 'Initial project proposal draft.' },
      { name: 'System Architecture.png', file: 'uploads/diagrams/arch-1.png', type: 'other', project: projects[0]._id, uploadedBy: students[1]._id, comment: 'High-level system architecture diagram.' },
      { name: 'Sprint 1 Presentation.pptx', file: 'uploads/presentations/sprint1.pptx', type: 'presentation', project: projects[1]._id, uploadedBy: students[2]._id, comment: 'First sprint review presentation.' },
      { name: 'API Documentation.pdf', file: 'uploads/docs/api-docs.pdf', type: 'rapport', project: projects[2]._id, uploadedBy: students[4]._id, comment: 'Auto-generated API documentation.' },
      { name: 'Database Schema.sql', file: 'uploads/code/schema.sql', type: 'code', project: projects[3]._id, uploadedBy: students[6]._id, comment: 'Initial database schema with migrations.' },
    ]);

    console.log(`Created: ${documents.length} documents`);

    // ─── RESOURCES ──────────────────────────────────────────────────────
    const resources = await Resource.create([
      { title: 'React Documentation', description: 'Official React docs for building user interfaces.', url: 'https://react.dev', category: 'Frontend', postedBy: instructors[0]._id },
      { title: 'Machine Learning Crash Course', description: 'Google\'s free ML course with hands-on exercises.', url: 'https://developers.google.com/machine-learning/crash-course', category: 'AI/ML', postedBy: instructors[1]._id },
      { title: 'Node.js Best Practices', description: 'A comprehensive guide to Node.js production best practices.', url: 'https://github.com/goldbergyoni/nodebestpractices', category: 'Backend', postedBy: instructors[0]._id },
      { title: 'Clean Architecture Book', description: 'Robert C. Martin\'s guide to clean software architecture.', url: 'https://www.oreilly.com/library/view/clean-architecture/9780134494272/', category: 'Architecture', postedBy: instructors[2]._id },
      { title: 'Figma UI Design Tutorial', description: 'Learn Figma for prototyping and UI/UX design.', url: 'https://www.figma.com/resources/learn-design/', category: 'Design', postedBy: instructors[1]._id },
    ]);

    console.log(`Created: ${resources.length} resources`);

    // ─── CHALLENGES ─────────────────────────────────────────────────────
    const challenges = await Challenge.create([
      {
        title: 'Smart Parking System',
        description: 'An IoT-powered parking management system that detects available spots and guides drivers via a mobile app.',
        category: 'IoT',
        technologies: ['ESP32', 'React Native', 'Firebase'],
        author: 'Amine Khaled',
        projectUrl: 'https://github.com/aminek/smart-parking',
        postedBy: instructors[0]._id,
        votes: [students[0]._id, students[1]._id],
        rank: 1,
      },
      {
        title: 'Real-Time Sign Language Translator',
        description: 'A computer vision app that translates Algerian Sign Language to text and speech in real-time.',
        category: 'AI/ML',
        technologies: ['Python', 'MediaPipe', 'LSTM', 'Flutter'],
        author: 'Meriem Ouali',
        projectUrl: 'https://github.com/meriemo/sign-translator',
        postedBy: instructors[1]._id,
        votes: [students[2]._id],
        rank: 2,
      },
      {
        title: 'Crowdsourced Road Hazard Reporter',
        description: 'A mobile app for reporting road hazards and potholes with automatic geolocation and photo uploads.',
        category: 'Mobile',
        technologies: ['Flutter', 'Google Maps API', 'Node.js', 'PostgreSQL'],
        author: 'Yacine Belaid',
        projectUrl: 'https://github.com/yacineb/road-reporter',
        postedBy: instructors[2]._id,
        votes: [],
        rank: 3,
      },
    ]);

    console.log(`Created: ${challenges.length} challenges`);

    // ─── NOTIFICATIONS ──────────────────────────────────────────────────
    const notifications = await Notification.create([
      { message: 'Your project "AI-Powered Medical Diagnosis Assistant" has been approved.', type: 'success', user: students[0]._id, link: '/projects' },
      { message: 'New meeting scheduled: Sprint Review on April 5th.', type: 'info', user: students[0]._id, link: '/meetings' },
      { message: 'Dr. Sarah Benali posted a new resource: "Machine Learning Crash Course".', type: 'info', user: students[0]._id, link: '/resources' },
      { message: 'Task "Implement core API endpoints" has been assigned to you.', type: 'warning', user: students[1]._id, link: '/tasks' },
      { message: 'Your group "Web Development Squad" has a new member.', type: 'success', user: instructors[1]._id, link: '/my-groups' },
    ]);

    console.log(`Created: ${notifications.length} notifications`);

    console.log('\n═══════════════════════════════════════════');
    console.log('  SEED COMPLETE');
    console.log('═══════════════════════════════════════════');
    console.log('\n  Test Accounts:');
    console.log('  ─────────────────────────────────────');
    console.log('  Admin:      admin@gmail.com / Admin@1234');
    console.log('  Instructor: sarah@gmail.com / Instr@1234');
    console.log('  Instructor: ahmed@gmail.com / Instr@1234');
    console.log('  Instructor: leila@gmail.com / Instr@1234');
    console.log('  Student:    amine.k@gmail.com / Student@1234');
    console.log('  Student:    meriem.o@gmail.com / Student@1234');
    console.log('  Student:    yacine.b@gmail.com / Student@1234');
    console.log('  Student:    ines.f@gmail.com / Student@1234');
    console.log('  ... and 6 more students (password: Student@1234)');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
