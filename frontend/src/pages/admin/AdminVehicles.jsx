import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  MapPin,
  Users,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Fuel
} from 'lucide-react';
import { fetchVehicles, deleteVehicle } from '@/services/vehicleService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

const vehicleTypes = ['All', 'SUV', 'Luxury Sedan', 'Van & Minibus', '4x4 Off-Road', 'Convertible', 'Electric'];

export default function AdminVehicles() {
  const navigate = useNavigate();
  const { showModal, showToast } = useModal();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vehicleType, setVehicleType] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadData = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchVehicles(pageNum, 6, vehicleType, '', '', '', search);
      if (res.data) {
        setVehicles(res.data.vehicles || []);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      }
    } catch {
      showToast('Could not load vehicles fleet', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [vehicleType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(1);
  };

  const handleDelete = (id, name) => {
    showModal({
      title: 'Remove Vehicle from Fleet',
      message: `Are you sure you want to remove vehicle "${name}"?`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Remove',
      onConfirm: async () => {
        try {
          await deleteVehicle(id);
          showToast('Vehicle removed from fleet', 'info');
          loadData(page);
        } catch {
          showToast('Failed to delete vehicle', 'error');
        }
      }
    });
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-8">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Car className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground leading-tight">Travel Transport & Vehicle Fleet</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
                {total}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Manage agency vehicles, luxury transfers, and daily rental rates
            </p>
          </div>
        </div>

        <GlowingButton
          onClick={() => navigate('/admin/vehicles/new')}
          size="sm"
          innerClassName="py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="size-3.5" />
          <span>Add Vehicle</span>
        </GlowingButton>
      </div>

      <div className="py-1.5 px-3 rounded-xl bg-[#121215] border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fleet by model, type (e.g. Land Cruiser, Van)..."
            className="w-full pl-8 pr-2.5 h-[30px] rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
          />
        </form>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {vehicleTypes.map((vt) => (
              <button
                key={vt}
                onClick={() => setVehicleType(vt)}
                className={`h-[30px] px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  vehicleType === vt
                    ? 'bg-orange-500 text-zinc-950 font-bold shadow-xs shadow-orange-500/20'
                    : 'bg-[#18181b]/80 text-muted-foreground hover:text-foreground border border-border/80 hover:border-orange-500/30'
                }`}
              >
                {vt}
              </button>
            ))}
          </div>

          {(search || vehicleType !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setVehicleType('All');
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
        <div className="py-24 flex items-center justify-center">
          <Loader text="Loading transport fleet..." />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121215] border border-border/80 text-center space-y-3 max-w-md mx-auto">
          <Car className="size-10 text-orange-400 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Vehicles in Fleet</h3>
          <p className="text-xs text-muted-foreground">
            {search || vehicleType !== 'All'
              ? 'No vehicles match your active search filters.'
              : 'Add cars, vans, 4x4 safaris, and transport options for agency trips.'}
          </p>
          <div className="pt-2">
            <GlowingButton
              onClick={() => navigate('/admin/vehicles/new')}
              size="sm"
              innerClassName="py-2 px-3.5 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Add First Vehicle</span>
            </GlowingButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl bg-[#121215] border border-border/80 overflow-hidden shadow-sm hover:border-orange-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div
                  className="relative h-44 w-full bg-cover bg-center overflow-hidden"
                  style={{ backgroundImage: `url(${item.coverImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-black/20 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-black/70 backdrop-blur-md text-white border border-white/10">
                      {item.vehicleType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-950/80 backdrop-blur-md text-orange-300 border border-orange-500/30">
                      {item.status || 'Available'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground group-hover:text-orange-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-xs font-bold text-orange-400 font-heading shrink-0">
                      {item.pricePerDay || '$95/day'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3 text-orange-400" /> {item.capacity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="size-3 text-orange-400" /> {item.fuelType || 'Petrol'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-300 pt-1 border-t border-border/60">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3 text-orange-400 shrink-0" /> {item.city}, {item.country}
                    </span>
                    <span className="font-semibold text-orange-400">
                      {item.driverIncluded ? '✓ Chauffeur Included' : 'Self-Drive'}
                    </span>
                  </div>

                  
                  {item.images && item.images.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                      {item.images.slice(0, 5).map((img, idx) => (
                        <div key={idx} className="size-9 rounded-lg overflow-hidden border border-border shrink-0">
                          <img src={img} alt={`Vehicle ${idx}`} className="size-full object-cover" />
                        </div>
                      ))}
                      {item.images.length > 5 && (
                        <div className="size-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-orange-400 shrink-0">
                          +{item.images.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-secondary/20 border-t border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/admin/vehicles/edit/${item._id}`)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    title="Edit vehicle"
                  >
                    <Edit3 className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.name)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete vehicle"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <span className="text-[10px] font-mono text-muted-foreground">
                  {item.transmission}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/80 text-xs text-muted-foreground">
        <div>
          Showing <strong className="text-foreground">{total === 0 ? 0 : (page - 1) * 6 + 1}</strong> to{' '}
          <strong className="text-foreground">{Math.min(page * 6, total)}</strong> of{' '}
          <strong className="text-foreground">{total}</strong> vehicles
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1 || loading}
            onClick={() => {
              const newPage = Math.max(page - 1, 1);
              setPage(newPage);
              loadData(newPage);
            }}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
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
                  loadData(p);
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
              loadData(newPage);
            }}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
