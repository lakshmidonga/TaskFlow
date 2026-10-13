import { User } from '../models/User.js';
import { Task } from '../models/Task.js';

/**
 * @route   GET /api/users
 * @desc    Get all users (for assignment dropdown & filter lists)
 * @access  Private (All authenticated users)
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });

    // Attach task count per user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const activeTasks = await Task.countDocuments({
          assignedTo: u._id,
          status: { $in: ['To Do', 'In Progress'] },
        });
        const completedTasks = await Task.countDocuments({
          assignedTo: u._id,
          status: 'Completed',
        });
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department,
          avatarColor: u.avatarColor,
          createdAt: u.createdAt,
          activeTasks,
          completedTasks,
          totalTasks: activeTasks + completedTasks,
        };
      })
    );

    res.json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};
