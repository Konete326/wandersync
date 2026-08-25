import EmployeeTask from '../models/EmployeeTask.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAdminEmployeeTasks = async (req, res) => {
  try {
    const { employeeId, status, priority, category } = req.query;
    const filter = {};
    if (employeeId && employeeId !== 'All') filter.employee = employeeId;
    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;
    if (category && category !== 'All') filter.category = category;

    const tasks = await EmployeeTask.find(filter)
      .populate('employee', 'name email role department avatar')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 'Delegated tasks fetched successfully', tasks);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createAdminEmployeeTask = async (req, res) => {
  try {
    const { title, description, employeeId, priority, category, dueDate } = req.body;
    if (!title || !employeeId) return sendError(res, 'Task title and assigned employee are required', 400);

    const employee = await Employee.findById(employeeId);
    if (!employee) return sendError(res, 'Target staff member not found', 404);

    const task = await EmployeeTask.create({
      title: title.trim(),
      description: description?.trim() || '',
      employee: employee._id,
      assignedBy: req.user._id,
      priority: priority || 'medium',
      category: category || 'General',
      dueDate: dueDate ? new Date(dueDate) : null
    });

    const populated = await EmployeeTask.findById(task._id)
      .populate('employee', 'name email role department avatar')
      .populate('assignedBy', 'name email');

    return sendSuccess(res, 'Task delegated successfully', populated, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateAdminEmployeeTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return sendError(res, 'Invalid task status', 400);
    }

    const task = await EmployeeTask.findById(req.params.id);
    if (!task) return sendError(res, 'Task not found', 404);

    task.status = status;
    if (status === 'completed') task.completedAt = new Date();
    await task.save();

    const populated = await EmployeeTask.findById(task._id)
      .populate('employee', 'name email role department avatar')
      .populate('assignedBy', 'name email');

    return sendSuccess(res, `Task marked as ${status}`, populated);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteAdminEmployeeTask = async (req, res) => {
  try {
    const task = await EmployeeTask.findById(req.params.id);
    if (!task) return sendError(res, 'Task not found', 404);

    await task.deleteOne();
    return sendSuccess(res, 'Task deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
