import Employee from '../models/Employee.js';
import EmployeeTask from '../models/EmployeeTask.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAdminEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { role: new RegExp(search, 'i') }
      ];
    }
    if (department && department !== 'All') filter.department = department;
    if (status && status !== 'All') filter.status = status;

    const employees = await Employee.find(filter).sort({ createdAt: -1 }).lean();
    const employeeIds = employees.map((e) => e._id);
    const taskCounts = await EmployeeTask.aggregate([
      { $match: { employee: { $in: employeeIds } } },
      { $group: { _id: '$employee', total: { $sum: 1 }, pending: { $sum: { $cond: [{ $in: ['$status', ['pending', 'in_progress']] }, 1, 0] } } } }
    ]);

    const taskCountMap = {};
    taskCounts.forEach((tc) => {
      taskCountMap[tc._id.toString()] = { total: tc.total, pending: tc.pending };
    });

    const enriched = employees.map((e) => ({
      ...e,
      totalTasks: taskCountMap[e._id.toString()]?.total || 0,
      pendingTasks: taskCountMap[e._id.toString()]?.pending || 0
    }));

    return sendSuccess(res, 'Employees fetched successfully', enriched);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createAdminEmployee = async (req, res) => {
  try {
    const { name, email, phone, role, department, status, salary, avatar } = req.body;
    if (!name || !email) return sendError(res, 'Name and email are required', 400);

    const existing = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existing) return sendError(res, 'Staff member with this email already exists', 400);

    const employee = await Employee.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      role: role || 'Operations Staff',
      department: department || 'Tour Operations',
      status: status || 'active',
      salary: Number(salary) || 0,
      avatar: avatar?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      createdBy: req.user._id
    });

    return sendSuccess(res, 'Staff member added successfully', employee, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateAdminEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return sendError(res, 'Staff member not found', 404);

    const { name, email, phone, role, department, status, salary, avatar } = req.body;
    if (name) employee.name = name.trim();
    if (email) employee.email = email.toLowerCase().trim();
    if (phone !== undefined) employee.phone = phone.trim();
    if (role) employee.role = role;
    if (department) employee.department = department;
    if (status) employee.status = status;
    if (salary !== undefined) employee.salary = Number(salary) || 0;
    if (avatar) employee.avatar = avatar.trim();

    await employee.save();
    return sendSuccess(res, 'Staff profile updated successfully', employee);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteAdminEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return sendError(res, 'Staff member not found', 404);

    await EmployeeTask.deleteMany({ employee: employee._id });
    await employee.deleteOne();
    return sendSuccess(res, 'Staff member and delegated tasks removed');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
