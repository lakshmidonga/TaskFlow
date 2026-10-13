import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard metrics, breakdown statistics, and upcoming deadlines
 * @access  Private (Admin and Team Members)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const { scope } = req.query; // 'all' or 'me'
    const query = {};

    // If Team Member requests 'me' or default for member without admin
    if (scope === 'me' || (req.user.role === 'member' && scope !== 'all')) {
      query.assignedTo = req.user._id;
    }

    const now = new Date();

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      upcomingTasks,
      recentTasks,
      totalTeamMembers,
    ] = await Promise.all([
      Task.countDocuments(query),
      Task.countDocuments({ ...query, status: 'To Do' }),
      Task.countDocuments({ ...query, status: 'In Progress' }),
      Task.countDocuments({ ...query, status: 'Completed' }),
      Task.countDocuments({
        ...query,
        dueDate: { $lt: now },
        status: { $ne: 'Completed' },
      }),
      Task.countDocuments({ ...query, priority: 'High' }),
      Task.countDocuments({ ...query, priority: 'Medium' }),
      Task.countDocuments({ ...query, priority: 'Low' }),
      Task.find({
        ...query,
        status: { $ne: 'Completed' },
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate('assignedTo', 'name email avatarColor'),
      Task.find(query)
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('assignedTo', 'name email avatarColor')
        .populate('createdBy', 'name email'),
      User.countDocuments(),
    ]);

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        completionRate,
        totalTeamMembers,
      },
      priorityBreakdown: {
        High: highPriorityTasks,
        Medium: mediumPriorityTasks,
        Low: lowPriorityTasks,
      },
      statusBreakdown: {
        'To Do': todoTasks,
        'In Progress': inProgressTasks,
        Completed: completedTasks,
      },
      upcomingTasks,
      recentTasks,
      userRole: req.user.role,
      scope: query.assignedTo ? 'personal' : 'team',
    });
  } catch (error) {
    next(error);
  }
};
