import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

/**
 * @route   GET /api/tasks
 * @desc    Get tasks with filtering, search, and sorting
 * @access  Private (Admin & Team Members)
 */
export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignee, search, overdue, sort } = req.query;

    const query = {};

    // Filter by Status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by Priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Filter by Assignee
    if (assignee) {
      if (assignee === 'me') {
        query.assignedTo = req.user._id;
      } else if (assignee !== 'all') {
        query.assignedTo = assignee;
      }
    }

    // Filter by Overdue
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'Completed' };
    }

    // Search query on title and description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Sorting
    let sortOption = { dueDate: 1 }; // Default: closest due date first
    if (sort === 'due_desc') {
      sortOption = { dueDate: -1 };
    } else if (sort === 'priority_desc') {
      // In mongo, we can sort or do custom priority sort in memory if needed
      sortOption = { priority: 1, dueDate: 1 };
    } else if (sort === 'created_desc') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'created_asc') {
      sortOption = { createdAt: 1 };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role department avatarColor')
      .populate('createdBy', 'name email role')
      .populate('history.updatedBy', 'name email avatarColor')
      .sort(sortOption);

    // Custom priority ordering when priority_desc is requested
    let finalTasks = tasks;
    if (sort === 'priority_desc') {
      const priorityWeights = { High: 3, Medium: 2, Low: 1 };
      finalTasks = [...tasks].sort(
        (a, b) => (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
      );
    }

    res.json({
      success: true,
      count: finalTasks.length,
      tasks: finalTasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role department avatarColor')
      .populate('createdBy', 'name email role')
      .populate('history.updatedBy', 'name email avatarColor');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task (Admin only)
 * @access  Private (Admin)
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status = 'To Do', priority = 'Medium', dueDate, assignedTo } =
      req.body;

    if (!title || !dueDate || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Title, due date, and assigned team member are required.',
      });
    }

    // Verify assigned user exists
    const assigneeExists = await User.findById(assignedTo);
    if (!assigneeExists) {
      return res.status(400).json({
        success: false,
        message: 'Selected team member does not exist.',
      });
    }

    const task = await Task.create({
      title,
      description: description || '',
      status,
      priority,
      dueDate: new Date(dueDate),
      assignedTo,
      createdBy: req.user._id,
      completedAt: status === 'Completed' ? new Date() : null,
      history: [
        {
          status,
          note: 'Task created and assigned',
          updatedBy: req.user._id,
          updatedAt: new Date(),
        },
      ],
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role department avatarColor')
      .populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details (Admin full edit, Team member status/progress edit)
 * @access  Private
 */
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();

    // Only Admin or the assigned Team Member can update
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'You can only update tasks assigned to you.',
      });
    }

    const { title, description, status, priority, dueDate, assignedTo, note } = req.body;

    let statusChanged = false;

    if (isAdmin) {
      // Admin has full control
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = new Date(dueDate);

      if (assignedTo !== undefined && assignedTo !== task.assignedTo.toString()) {
        const assigneeExists = await User.findById(assignedTo);
        if (!assigneeExists) {
          return res.status(400).json({
            success: false,
            message: 'Assigned team member not found.',
          });
        }
        task.assignedTo = assignedTo;
      }

      if (status !== undefined && status !== task.status) {
        task.status = status;
        statusChanged = true;
      }
    } else {
      // Team Member can update progress status and add notes
      if (status !== undefined && status !== task.status) {
        task.status = status;
        statusChanged = true;
      }
    }

    // Handle completedAt timestamp
    if (task.status === 'Completed' && !task.completedAt) {
      task.completedAt = new Date();
    } else if (task.status !== 'Completed') {
      task.completedAt = null;
    }

    // Append to progress history if note provided or status changed
    if (note || statusChanged) {
      task.history.push({
        status: task.status,
        note: note || `Status changed to "${task.status}"`,
        updatedBy: req.user._id,
        updatedAt: new Date(),
      });
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role department avatarColor')
      .populate('createdBy', 'name email role')
      .populate('history.updatedBy', 'name email avatarColor');

    res.json({
      success: true,
      message: 'Task updated successfully.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task (Admin only)
 * @access  Private (Admin)
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully.',
      deletedTaskId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks/:id/progress
 * @desc    Add a progress note/remark to a task
 * @access  Private (Admin or Assigned Member)
 */
export const addProgressNote = async (req, res, next) => {
  try {
    const { note, status } = req.body;

    if (!note && !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a note or new status.',
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'You can only update tasks assigned to you.',
      });
    }

    if (status && status !== task.status) {
      task.status = status;
      if (status === 'Completed') {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    task.history.push({
      status: task.status,
      note: note || `Status changed to ${task.status}`,
      updatedBy: req.user._id,
      updatedAt: new Date(),
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role department avatarColor')
      .populate('createdBy', 'name email role')
      .populate('history.updatedBy', 'name email avatarColor');

    res.json({
      success: true,
      message: 'Progress update recorded.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};
