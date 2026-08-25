import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Edit2,
  CheckSquare,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Building,
  Flag,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  fetchAdminEmployees,
  createAdminEmployee,
  updateAdminEmployee,
  deleteAdminEmployee,
  fetchAdminEmployeeTasks,
  createAdminEmployeeTask,
  updateAdminEmployeeTaskStatus,
  deleteAdminEmployeeTask
} from '@/services/employeeService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

import {
  subscribeRealtimeUpdate,
  broadcastRealtimeUpdate,
  getCachedData,
  setCachedData
} from '@/utils/realtimeSync';

const DEPARTMENTS = [
  'All',
  'Tour Operations',
  'Ticketing & POS',
  'Transport & Fleet',
  'Customer Experience',
  'Finance & Accounting',
  'General Logistics'
];

const ROLES = [
  'Tour Guide',
  'Booking Manager',
  'Fleet Coordinator',
  'Customer Support',
  'Logistics Lead',
  'Finance Officer',
  'Operations Staff'
];

const TASK_CATEGORIES = [
  'General',
  'Booking Verification',
  'Tour Preparation',
  'Customer Followup',
  'Vehicle Inspection',
  'Hotel Coordination'
];

export default function AdminEmployees() {
  const { showToast } = useToast();
  const { showModal } = useModal();

  const [activeTab, setActiveTab] = useState('roster');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('All');
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');

  const cacheKey = `employees_${selectedDept}_${selectedStatus}_${taskPriorityFilter}_${taskStatusFilter}_${search}`;
  const initialData = getCachedData(cacheKey);

  const [employees, setEmployees] = useState(initialData?.employees || []);
  const [tasks, setTasks] = useState(initialData?.tasks || []);
  const [loading, setLoading] = useState(!initialData);

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Tour Guide',
    department: 'Tour Operations',
    status: 'active',
    salary: 0,
    avatar: ''
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    employeeId: '',
    priority: 'medium',
    category: 'General',
    dueDate: ''
  });

  const loadData = async (isBackground = false) => {
    const key = `employees_${selectedDept}_${selectedStatus}_${taskPriorityFilter}_${taskStatusFilter}_${search}`;
    const cached = getCachedData(key);
    if (!isBackground && !cached) {
      setLoading(true);
    }
    try {
      const [empRes, taskRes] = await Promise.all([
        fetchAdminEmployees({
          search,
          department: selectedDept,
          status: selectedStatus
        }),
        fetchAdminEmployeeTasks({
          priority: taskPriorityFilter,
          status: taskStatusFilter
        })
      ]);

      const empData = empRes.data || [];
      const taskData = taskRes.data || [];
      setEmployees(empData);
      setTasks(taskData);
      setCachedData(key, { employees: empData, tasks: taskData });
    } catch (err) {
      if (!isBackground) {
        showToast(err.response?.data?.message || 'Failed to load staff records', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedStatus, taskPriorityFilter, taskStatusFilter]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeUpdate('employees', () => {
      loadData(true);
    });
    const timer = setInterval(() => {
      loadData(true);
    }, 8000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [selectedDept, selectedStatus, taskPriorityFilter, taskStatusFilter, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm({
      name: '',
      email: '',
      phone: '',
      role: 'Tour Guide',
      department: 'Tour Operations',
      status: 'active',
      salary: 0,
      avatar: ''
    });
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setEmployeeForm({
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      role: emp.role || 'Tour Guide',
      department: emp.department || 'Tour Operations',
      status: emp.status || 'active',
      salary: emp.salary || 0,
      avatar: emp.avatar || ''
    });
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!employeeForm.name.trim() || !employeeForm.email.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    try {
      if (editingEmployee) {
        await updateAdminEmployee(editingEmployee._id, employeeForm);
        broadcastRealtimeUpdate('employees');
        showToast('Staff member updated successfully', 'success');
      } else {
        await createAdminEmployee(employeeForm);
        broadcastRealtimeUpdate('employees');
        showToast('New staff member added to roster', 'success');
      }
      setIsEmployeeModalOpen(false);
      loadData(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save staff member', 'error');
    }
  };

  const handleDeleteEmployee = (emp) => {
    showModal({
      title: 'Remove Staff Member?',
      message: `Are you sure you want to remove ${emp.name} (${emp.role})? All their delegated tasks will also be deleted.`,
      type: 'danger',
      onConfirm: async () => {
        setEmployees((prev) => prev.filter((e) => e._id !== emp._id));
        try {
          await deleteAdminEmployee(emp._id);
          broadcastRealtimeUpdate('employees');
          showToast('Staff member removed', 'success');
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to delete staff member', 'error');
          loadData();
        }
      }
    });
  };

  const handleOpenAssignTask = (emp = null) => {
    setTaskForm({
      title: '',
      description: '',
      employeeId: emp?._id || employees[0]?._id || '',
      priority: 'medium',
      category: 'General',
      dueDate: ''
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.employeeId) {
      showToast('Task title and target employee are required', 'error');
      return;
    }

    try {
      await createAdminEmployeeTask(taskForm);
      showToast('Task delegated successfully', 'success');
      setIsTaskModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delegate task', 'error');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateAdminEmployeeTaskStatus(taskId, newStatus);
      showToast(`Task status updated to ${newStatus}`, 'success');
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update task status', 'error');
    }
  };

  const handleDeleteTask = (task) => {
    showModal({
      title: 'Delete Task?',
      message: `Are you sure you want to delete the task "${task.title}"?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteAdminEmployeeTask(task._id);
          showToast('Task deleted successfully', 'success');
          loadData();
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to delete task', 'error');
        }
      }
    });
  };

  const totalEmployees = employees.length;
  const activeStaff = employees.filter((e) => e.status === 'active').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <Users className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">
              Agency Staff & Task Delegation
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Manage operational staff roster, assign duty tasks, and track team execution live.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleOpenAssignTask()}
            className="flex-1 sm:flex-none h-[30px] px-3 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 border border-border/80 cursor-pointer transition-colors"
          >
            <CheckSquare className="size-3.5 text-orange-400" />
            <span>Delegate Task</span>
          </button>

          <GlowingButton
            onClick={handleOpenAddEmployee}
            size="sm"
            innerClassName="h-[30px] px-3 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <UserPlus className="size-3.5" />
            <span>Add Staff</span>
          </GlowingButton>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-[#121215] border border-border/80 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Staff</span>
            <Users className="size-3.5 text-orange-400" />
          </div>
          <p className="text-xl font-extrabold text-foreground font-mono">{totalEmployees}</p>
          <span className="text-[10px] text-muted-foreground">Registered crew members</span>
        </div>

        <div className="p-3 rounded-xl bg-[#121215] border border-border/80 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">On-Duty Active</span>
            <UserCheck className="size-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-foreground font-mono">{activeStaff}</p>
          <span className="text-[10px] text-muted-foreground">Available for assignments</span>
        </div>

        <div className="p-3 rounded-xl bg-[#121215] border border-border/80 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Tasks</span>
            <Clock className="size-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-amber-400 font-mono">{pendingTasks}</p>
          <span className="text-[10px] text-muted-foreground">Active in queue</span>
        </div>

        <div className="p-3 rounded-xl bg-[#121215] border border-border/80 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed Tasks</span>
            <CheckCircle2 className="size-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-emerald-400 font-mono">{completedTasks}</p>
          <span className="text-[10px] text-muted-foreground">Finished deliverables</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121215] border border-border/80 w-fit">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
            activeTab === 'roster'
              ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-xs'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <Users className="size-3.5" />
          <span>Staff Roster ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
            activeTab === 'tasks'
              ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 shadow-xs'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <CheckSquare className="size-3.5" />
          <span>Delegated Task Board ({tasks.length})</span>
        </button>
      </div>

      <div className="py-1.5 px-3 rounded-xl bg-[#121215] border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'roster' ? 'Search staff by name, email, role...' : 'Search tasks...'}
            className="w-full pl-8 pr-2.5 h-[30px] rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
          />
        </form>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {activeTab === 'roster' ? (
            <>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-[#121215] text-foreground">
                    {dept === 'All' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
              >
                <option value="All" className="bg-[#121215] text-foreground">All Statuses</option>
                <option value="active" className="bg-[#121215] text-foreground">Active Only</option>
                <option value="on-leave" className="bg-[#121215] text-foreground">On Leave</option>
                <option value="inactive" className="bg-[#121215] text-foreground">Inactive</option>
              </select>
            </>
          ) : (
            <>
              <select
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
                className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
              >
                <option value="All" className="bg-[#121215] text-foreground">All Priorities</option>
                <option value="urgent" className="bg-[#121215] text-foreground">Urgent</option>
                <option value="high" className="bg-[#121215] text-foreground">High</option>
                <option value="medium" className="bg-[#121215] text-foreground">Medium</option>
                <option value="low" className="bg-[#121215] text-foreground">Low</option>
              </select>

              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
              >
                <option value="All" className="bg-[#121215] text-foreground">All Task Statuses</option>
                <option value="pending" className="bg-[#121215] text-foreground">Pending</option>
                <option value="in_progress" className="bg-[#121215] text-foreground">In Progress</option>
                <option value="completed" className="bg-[#121215] text-foreground">Completed</option>
                <option value="cancelled" className="bg-[#121215] text-foreground">Cancelled</option>
              </select>
            </>
          )}

          {(search || selectedDept !== 'All' || selectedStatus !== 'All' || taskPriorityFilter !== 'All' || taskStatusFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedDept('All');
                setSelectedStatus('All');
                setTaskPriorityFilter('All');
                setTaskStatusFilter('All');
              }}
              className="h-[30px] px-2 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-[11px] font-semibold transition-colors cursor-pointer border border-border/60"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader text="Loading staff records & delegated tasks..." />
        </div>
      ) : activeTab === 'roster' ? (
        employees.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-[#121215] border border-border/80 space-y-2">
            <Users className="size-8 text-muted-foreground/30 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Staff Members Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add your first agency team member to start delegating tours and operational duties.
            </p>
            <div className="pt-2">
              <GlowingButton onClick={handleOpenAddEmployee} size="sm">
                Add Staff Member
              </GlowingButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {employees.map((emp) => {
              const isActive = emp.status === 'active';
              return (
                <div
                  key={emp._id}
                  className="p-3.5 rounded-2xl bg-[#121215] border border-border/80 flex flex-col justify-between gap-3 shadow-sm hover:border-orange-500/30 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-xl border border-orange-500/30 overflow-hidden bg-secondary shrink-0">
                          <img
                            src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                            alt={emp.name}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-foreground truncate">{emp.name}</h3>
                          <span className="text-[11px] font-semibold text-orange-400 block truncate">
                            {emp.role}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : emp.status === 'on-leave'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-secondary text-muted-foreground border border-border'
                        }`}
                      >
                        {isActive && <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        <span>{emp.status}</span>
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-muted-foreground bg-secondary/30 p-2 rounded-xl border border-border/40">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{emp.department}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                      {emp.phone && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{emp.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] px-1">
                      <span className="text-muted-foreground">Active Tasks Assigned:</span>
                      <span className="font-mono font-bold text-foreground px-2 py-0.5 rounded bg-secondary/80 border border-border">
                        {emp.pendingTasks || 0} in progress
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-border/60">
                    <button
                      onClick={() => handleOpenAssignTask(emp)}
                      className="flex-1 h-[28px] px-2 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="size-3" />
                      <span>Assign Task</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditEmployee(emp)}
                      className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/80 cursor-pointer transition-colors"
                      title="Edit Staff Member"
                    >
                      <Edit2 className="size-3" />
                    </button>

                    <button
                      onClick={() => handleDeleteEmployee(emp)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer transition-colors"
                      title="Delete Staff Member"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : tasks.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-[#121215] border border-border/80 space-y-2">
          <CheckSquare className="size-8 text-muted-foreground/30 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Tasks Delegated</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Create tasks and assign them to your staff to streamline agency bookings and tour operations.
          </p>
          <div className="pt-2">
            <GlowingButton onClick={() => handleOpenAssignTask()} size="sm">
              Delegate First Task
            </GlowingButton>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => {
            const isDone = t.status === 'completed';
            const isUrgent = t.priority === 'urgent';
            return (
              <div
                key={t._id}
                className="p-3 rounded-xl bg-[#121215] border border-border/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    onClick={() => handleUpdateTaskStatus(t._id, isDone ? 'pending' : 'completed')}
                    className={`mt-0.5 size-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                        : 'border-border bg-secondary/60 hover:border-orange-500/50'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="size-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {t.title}
                      </h4>

                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                          isUrgent
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : t.priority === 'high'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-secondary text-muted-foreground border border-border'
                        }`}
                      >
                        {t.priority}
                      </span>

                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-secondary text-muted-foreground border border-border">
                        {t.category}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{t.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                      <span>
                        Assigned To:{' '}
                        <strong className="text-foreground font-semibold">
                          {t.employee?.name || 'Unassigned'} ({t.employee?.role || 'Staff'})
                        </strong>
                      </span>
                      {t.dueDate && (
                        <span>
                          Due:{' '}
                          <strong className="text-orange-400 font-mono">
                            {new Date(t.dueDate).toLocaleDateString()}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0">
                  <select
                    value={t.status}
                    onChange={(e) => handleUpdateTaskStatus(t._id, e.target.value)}
                    className="h-[28px] px-2 rounded-lg bg-[#18181b] border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-orange-500/60 cursor-pointer"
                  >
                    <option value="pending" className="bg-[#121215]">Pending</option>
                    <option value="in_progress" className="bg-[#121215]">In Progress</option>
                    <option value="completed" className="bg-[#121215]">Completed</option>
                    <option value="cancelled" className="bg-[#121215]">Cancelled</option>
                  </select>

                  <button
                    onClick={() => handleDeleteTask(t)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#121215] border border-border p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="text-sm font-bold text-foreground">
                {editingEmployee ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  placeholder="e.g. Tariq Khan"
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Work Email *</label>
                <input
                  type="email"
                  required
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  placeholder="e.g. tariq@wandersync.com"
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Phone</label>
                  <input
                    type="text"
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Duty Status</label>
                  <select
                    value={employeeForm.status}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Role</label>
                  <select
                    value={employeeForm.role}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Department</label>
                  <select
                    value={employeeForm.department}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <GlowingButton type="submit" size="sm">
                  {editingEmployee ? 'Save Changes' : 'Add Staff'}
                </GlowingButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#121215] border border-border p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="text-sm font-bold text-foreground">Delegate Operational Task</h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Verify 4x4 Jeep inspection for Hunza Tour"
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Assign Staff Member *</label>
                <select
                  required
                  value={taskForm.employeeId}
                  onChange={(e) => setTaskForm({ ...taskForm, employeeId: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} — {emp.role} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Category</label>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {TASK_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground flex items-center justify-between">
                  <span>Instructions & Description</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Add specific guidelines or checklist notes (Optional)..."
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <GlowingButton type="submit" size="sm">
                  Delegate Task
                </GlowingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
