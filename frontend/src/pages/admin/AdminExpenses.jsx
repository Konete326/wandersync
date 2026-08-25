import { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Receipt,
  Server,
  Sparkles,
  Layers,
  Calendar,
  Building2,
  Trash2,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  fetchPlatformExpenses,
  createPlatformExpense,
  updatePlatformExpense,
  deletePlatformExpense
} from '@/services/expenseService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import ValidatedInput from '@/components/common/ValidatedInput';

const categories = [
  'All',
  'AI & LLM Compute',
  'Cloud Infrastructure',
  'Media CDN & Storage',
  'APIs & Services',
  'Domain & Hosting',
  'Operations & Other'
];

const statuses = ['All', 'Paid', 'Pending', 'Scheduled', 'Overdue'];
const billingCycles = ['Monthly', 'Annually', 'Usage-based', 'One-time'];

export default function AdminExpenses() {
  const { showModal, showToast } = useModal();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingAmount: 0,
    uniqueVendors: 0,
    monthlyBurnRate: 0,
    totalRecords: 0
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    vendor: '',
    amount: '',
    currency: 'USD ($)',
    category: 'AI & LLM Compute',
    billingCycle: 'Monthly',
    status: 'Paid',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const loadExpenses = async (pageNum = 1, currentLimit = limit) => {
    setLoading(true);
    try {
      const res = await fetchPlatformExpenses(pageNum, currentLimit, category, status, search);
      if (res.data) {
        setExpenses(res.data.expenses || []);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch {
      showToast('Could not load platform expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses(1, limit);
  }, [category, status, limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadExpenses(1, limit);
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      vendor: '',
      amount: '',
      currency: 'USD ($)',
      category: 'AI & LLM Compute',
      billingCycle: 'Monthly',
      status: 'Paid',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingExpense(item);
    setFormData({
      title: item.title || '',
      vendor: item.vendor || '',
      amount: item.amount || '',
      currency: item.currency || 'USD ($)',
      category: item.category || 'Operations & Other',
      billingCycle: item.billingCycle || 'Monthly',
      status: item.status || 'Paid',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: item.notes || ''
    });
    setModalOpen(true);
  };

  const handleDelete = (id, title) => {
    showModal({
      title: 'Delete Expense Record',
      message: `Are you sure you want to permanently delete expense record "${title}"?`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deletePlatformExpense(id);
          showToast('Expense record deleted successfully', 'info');
          loadExpenses(page, limit);
        } catch {
          showToast('Failed to delete expense record', 'error');
        }
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || formData.amount === '') {
      showToast('Title and amount are required', 'warning');
      return;
    }
    setSaving(true);
    try {
      if (editingExpense) {
        await updatePlatformExpense(editingExpense._id, formData);
        showToast('Platform expense record updated', 'success');
      } else {
        await createPlatformExpense(formData);
        showToast('New platform expense recorded', 'success');
      }
      setModalOpen(false);
      loadExpenses(page, limit);
    } catch {
      showToast('Failed to save platform expense', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Paid':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Scheduled':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Overdue':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-secondary text-muted-foreground border-border';
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-8">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Receipt className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground leading-tight">Platform Expenses & Cloud Ledger</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
                {stats.totalRecords}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Operational ledger for API tokens, CDN, database, and hosting
            </p>
          </div>
        </div>

        <GlowingButton
          onClick={handleOpenAdd}
          size="sm"
          innerClassName="py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="size-3.5" />
          <span>New Expense</span>
        </GlowingButton>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#121215] border border-border/80 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold">Total Paid Spend</span>
            <DollarSign className="size-3.5 text-orange-400" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-foreground font-heading">
            ${stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-muted-foreground block">Verified platform invoices</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#121215] border border-border/80 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold">Monthly Burn Rate</span>
            <TrendingUp className="size-3.5 text-orange-400" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-foreground font-heading">
            ${stats.monthlyBurnRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-muted-foreground block">Recurring active subscriptions</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#121215] border border-border/80 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold">Pending Invoices</span>
            <Clock className="size-3.5 text-amber-400" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-amber-400 font-heading">
            ${stats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-muted-foreground block">Awaiting payment settlement</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#121215] border border-border/80 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold">Active Cloud Vendors</span>
            <Building2 className="size-3.5 text-orange-400" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-foreground font-heading">
            {stats.uniqueVendors} <span className="text-xs font-normal text-muted-foreground">Vendors</span>
          </p>
          <span className="text-[10px] text-muted-foreground block">Google, Atlas, Cloudinary, etc.</span>
        </div>
      </div>

      <div className="py-1.5 px-3 rounded-xl bg-[#121215] border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses by title, vendor..."
            className="w-full pl-8 pr-2.5 h-[30px] rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
          />
        </form>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
          >
            {statuses.map((st) => (
              <option key={st} value={st} className="bg-[#121215] text-foreground">
                {st === 'All' ? 'All Statuses' : st}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`h-[30px] px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-orange-500 text-zinc-950 font-bold shadow-xs shadow-orange-500/20'
                    : 'bg-[#18181b]/80 text-muted-foreground hover:text-foreground border border-border/80 hover:border-orange-500/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {(search || status !== 'All' || category !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatus('All');
                setCategory('All');
                setPage(1);
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
          <Loader text="Loading platform expenses ledger..." />
        </div>
      ) : expenses.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 sm:p-6 rounded-2xl bg-[#121215] border border-border/80 items-center">
          <div className="space-y-2.5">
            <div className="size-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Receipt className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">No Expense Records Found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {search || category !== 'All' || status !== 'All'
                ? 'No platform expenses match the active search or category filters. Try clearing your filters.'
                : 'Your platform cloud ledger is currently empty. Record your first infrastructure or AI service expense.'}
            </p>
            <div className="pt-1">
              <GlowingButton
                onClick={handleOpenAdd}
                size="sm"
                innerClassName="py-2 px-3.5 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="size-3.5 text-orange-400" />
                <span>Record First Expense</span>
              </GlowingButton>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 text-foreground font-semibold">
              <Sparkles className="size-3.5 text-orange-400" />
              <span>Recommended Initial Invoices</span>
            </div>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-muted-foreground">
              <li>Google Gemini AI API Token Quota (e.g. $45/mo).</li>
              <li>MongoDB Atlas M0 / Serverless Cluster (e.g. $15/mo).</li>
              <li>Cloudinary CDN Media Storage & Bandwidth Tier ($89/mo).</li>
              <li>Domain Name & SSL Cloudflare DNS ($12/yr).</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[#121215] border border-border/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 border-b border-border/70 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5">Expense & Description</th>
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Billing Cycle</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {expenses.map((item) => (
                  <tr key={item._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground line-clamp-1">{item.title}</p>
                        {item.notes && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{item.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-300 whitespace-nowrap">
                      {item.vendor || 'General Vendor'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                      {item.billingCycle || 'Monthly'}
                    </td>
                    <td className="py-3 px-3 font-bold text-foreground font-heading whitespace-nowrap">
                      ${Number(item.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                      {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                          title="Edit expense"
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.title)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/80 text-xs text-muted-foreground">
        <div>
          Showing <strong className="text-foreground">{total === 0 ? 0 : (page - 1) * limit + 1}</strong> to{' '}
          <strong className="text-foreground">{Math.min(page * limit, total)}</strong> of{' '}
          <strong className="text-foreground">{total}</strong> expenses
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1 || loading}
            onClick={() => {
              const newPage = Math.max(page - 1, 1);
              setPage(newPage);
              loadExpenses(newPage, limit);
            }}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="size-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPage(p);
                  loadExpenses(p, limit);
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
              loadExpenses(newPage, limit);
            }}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="max-w-lg w-full rounded-2xl bg-[#121215] border border-orange-500/30 shadow-2xl p-5 space-y-4 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Receipt className="size-3.5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {editingExpense ? 'Edit Platform Expense' : 'Record New Platform Expense'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <ValidatedInput
                label="Expense Title / Service Name"
                required
                validationType="name"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Google Gemini 2.5 Flash API Quota Tier"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ValidatedInput
                  label="Vendor / Provider"
                  required
                  validationType="name"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="e.g. Google Cloud Platform"
                />

                <ValidatedInput
                  label="Amount (USD $)"
                  required
                  validationType="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 150.00"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Billing Cycle</label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  >
                    {billingCycles.map((bc) => (
                      <option key={bc} value={bc}>{bc}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Payment Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Invoice / Expense Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Operational Notes & Details</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. 500,000 token bundle with 2.5 Flash model API key renewal..."
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-bold transition-colors cursor-pointer shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {saving ? 'Saving Record...' : editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
