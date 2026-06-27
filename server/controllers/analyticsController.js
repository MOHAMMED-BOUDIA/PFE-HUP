const User = require('../models/User');
const Group = require('../models/Group');
const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getAnalytics = async (req, res) => {
  try {
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          instructors: { $sum: { $cond: [{ $eq: ['$role', 'instructor'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const topInstructors = await Group.aggregate([
      {
        $group: {
          _id: '$instructor',
          groupsCount: { $sum: 1 },
          studentsCount: { $sum: { $size: '$members' } }
        }
      },
      { $sort: { studentsCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      { $unwind: '$instructor' },
      {
        $project: {
          name: '$instructor.name',
          email: '$instructor.email',
          department: '$instructor.department',
          groupsCount: 1,
          studentsCount: 1
        }
      }
    ]);

    const totalProjects = await Project.countDocuments();
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const inProgressProjects = await Project.countDocuments({ status: 'in-progress' });
    const pendingProjects = await Project.countDocuments({ status: 'pending' });

    const completionRate = totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activityData = await User.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalGroups = await Group.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'done' });
    const taskCompletionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    const departmentStats = await User.aggregate([
      { $match: { role: { $in: ['student', 'instructor'] } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: {
        totalUsers, totalStudents, totalInstructors, totalGroups,
        totalProjects, completionRate, taskCompletionRate,
        completedProjects, inProgressProjects, pendingProjects
      },
      userGrowth, topInstructors, activityData, departmentStats
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};
