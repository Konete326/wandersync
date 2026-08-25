import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  Calendar,
  Compass,
  ChevronLeft,
  ChevronRight,
  Mail,
  User as UserIcon,
  Crown
} from 'lucide-react';
import {
  getAdminAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUserAdmin
} from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

export default function AdminUsers() {
  const { user: currentAdmin } = useAuth();
  const { showModal, showToast } = useModal();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const loadUsers = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getAdminAllUsers(
        pageNum,
        limit,
        search,
        roleFilter,
        statusFilter
      );
      if (res.data?.users) {
        setUsers(res.data.users);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } else {
        setUsers([]);
      }
    } catch {
      showToast('Could not load users directory', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(page);
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers(1);
  };

  const handleToggleRole = (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const actionText = newRole === 'admin' ? 'promote this user to Administrator' : 'demote this user to standard Traveler';

    showModal({
      title: `${newRole === 'admin' ? 'Grant Admin Privileges' : 'Demote Admin'}?`,
      message: `Are you sure you want to ${actionText} (${user.email})?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await updateUserRole(user._id, newRole);
          showToast(`User role updated to ${newRole}`, 'success');
          setUsers((prev) =>
            prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
          );
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to update user role', 'error');
        }
      }
    });
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    const isBanning = newStatus === 'banned';

    showModal({
      title: `${isBanning ? 'Ban User Account' : 'Reactivate Account'}?`,
      message: isBanning
        ? `Are you sure you want to suspend and ban ${user.name} (${user.email}) from logging into the platform?`
        : `Reactivate account for ${user.name}? They will regain access to their trips and features.`,
      type: isBanning ? 'danger' : 'info',
      onConfirm: async () => {
        try {
          await toggleUserStatus(user._id, newStatus);
          showToast(`Account marked as ${newStatus}`, 'success');
          setUsers((prev) =>
            prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
          );
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to update user status', 'error');
        }
      }
    });
  };

  const handleDeleteUser = (user) => {
    showModal({
      title: 'Permanently Delete User Account?',
      message: `Are you sure you want to delete ${user.name} (${user.email}) and all their generated itineraries? This action is permanent and cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteUserAdmin(user._id);
          showToast('User account removed permanently', 'success');
          loadUsers(page);
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to delete user', 'error');
        }
      }
    });
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-8">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Users className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">Traveler & User Directory</h1>
            <p className="text-[11px] text-muted-foreground">
              Manage registered travelers, administrator roles, and permissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-secondary/50 border border-border text-[11px] font-bold text-foreground">
            Total Travelers: <span className="text-orange-400 font-extrabold">{total}</span>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[#121215] border border-border/80 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search traveler by name or email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
          >
            <option value="All" className="bg-[#121215] text-foreground">All Roles</option>
            <option value="admin" className="bg-[#121215] text-foreground">Administrators Only</option>
            <option value="user" className="bg-[#121215] text-foreground">Travelers Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
          >
            <option value="All" className="bg-[#121215] text-foreground">All Statuses</option>
            <option value="active" className="bg-[#121215] text-foreground">Active Accounts</option>
            <option value="banned" className="bg-[#121215] text-foreground">Banned / Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Moderation Table */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader text="Loading live user directory..." />
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121215] border border-border/80 space-y-3">
          <Users className="size-10 text-muted-foreground/30 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Users Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No accounts match your current search query or role filter.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-[#121215] overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-secondary/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Traveler / User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Trips Generated</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((u) => {
                  const isCurrent = currentAdmin?._id === u._id;
                  const isBanned = u.status === 'banned' || u.status === 'suspended';
                  return (
                    <tr key={u._id} className="hover:bg-secondary/30 transition-colors">
                      {/* User Avatar + Name + Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl border border-orange-500/30 overflow-hidden bg-secondary shrink-0">
                            <img
                              src={u.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={u.name}
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground truncate">{u.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 text-[9px] font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground block truncate">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Crown className="size-3 text-amber-400" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground border border-border">
                            <Compass className="size-3 text-cyan-400" />
                            <span>Traveler</span>
                          </span>
                        )}
                      </td>

                      {/* Account Status Badge */}
                      <td className="py-3.5 px-4">
                        {isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <ShieldAlert className="size-3 text-rose-400" />
                            <span>Banned</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Trips Count */}
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        <span className="px-2 py-0.5 rounded-lg bg-secondary/60 border border-border text-[11px]">
                          {u.tripsCount || 0} Trips
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role Toggle Button */}
                          <button
                            disabled={isCurrent}
                            onClick={() => handleToggleRole(u)}
                            className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border disabled:opacity-30 cursor-pointer transition-colors"
                            title={u.role === 'admin' ? 'Demote to Traveler' : 'Promote to Admin'}
                          >
                            <ShieldCheck className={`size-3.5 ${u.role === 'admin' ? 'text-amber-400' : 'text-zinc-400'}`} />
                          </button>

                          {/* Status Ban / Activate Toggle */}
                          <button
                            disabled={isCurrent}
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 ${
                              isBanned
                                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
                            }`}
                            title={isBanned ? 'Activate Account' : 'Ban Account'}
                          >
                            {isBanned ? <UserCheck className="size-3.5" /> : <UserX className="size-3.5" />}
                          </button>

                          {/* Delete Account */}
                          <button
                            disabled={isCurrent}
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 disabled:opacity-30 cursor-pointer transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-3.5 rounded-2xl bg-[#121215] border border-border flex items-center justify-between text-xs shadow-md">
          <span className="text-muted-foreground">
            Page <span className="font-bold text-foreground">{page}</span> of{' '}
            <span className="font-bold text-foreground">{totalPages}</span> ({total} users)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1 || loading}
              onClick={() => {
                const newPage = Math.max(page - 1, 1);
                setPage(newPage);
                loadUsers(newPage);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="size-3.5" />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p);
                    loadUsers(p);
                  }}
                  className={`size-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    page === p
                      ? 'bg-orange-500 text-zinc-950 font-bold shadow-sm shadow-orange-500/20'
                      : 'bg-secondary/40 text-muted-foreground hover:text-foreground border border-border hover:border-orange-500/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => {
                const newPage = Math.min(page + 1, totalPages);
                setPage(newPage);
                loadUsers(newPage);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
