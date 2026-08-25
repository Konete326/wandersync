import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Plus, Search, Calendar, MapPin, DollarSign, Trash2, ArrowRight } from 'lucide-react';
import { getMyTrips, deleteTripById } from '../services/tripService';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';
import { getCachedData, setCachedData } from '@/utils/realtimeSync';

const MyTrips = () => {
  const cacheKey = 'user_my_trips';
  const initialTrips = getCachedData(cacheKey);

  const [trips, setTrips] = useState(initialTrips || []);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(!initialTrips);
  const { showModal, showToast } = useModal();
  const navigate = useNavigate();

  const loadTrips = async (isBackground = false) => {
    if (!isBackground && !initialTrips) {
      setLoading(true);
    }
    try {
      const res = await getMyTrips();
      const tripList = res.data || [];
      setTrips(tripList);
      setCachedData(cacheKey, tripList);
    } catch (error) {
      if (!isBackground) {
        showToast('Failed to load trips', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips(!!initialTrips);
  }, []);

  const handleDelete = (tripId, tripTitle, e) => {
    e.preventDefault();
    e.stopPropagation();

    showModal({
      title: 'Delete Itinerary',
      message: `Are you sure you want to permanently delete "${tripTitle}"?`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteTripById(tripId);
          setTrips((prev) => prev.filter((t) => t._id !== tripId));
          showToast('Trip removed', 'info');
        } catch (err) {
          showToast('Failed to delete trip', 'error');
        }
      }
    });
  };

  const filteredTrips = trips.filter((t) =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.destination?.city?.toLowerCase().includes(search.toLowerCase()) ||
    t.destination?.country?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader text="Fetching your travel library..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Trips Library</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and revisit all your AI generated itineraries</p>
        </div>

        <Link
          to="/create"
          className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Itinerary</span>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by city, country, or trip title..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
      </div>

      {filteredTrips.length === 0 ? (
        <div className="liquid-glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">No Itineraries Found</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {search ? 'No trips match your search query.' : 'You haven’t crafted any itineraries yet. Launch the AI Maestro to begin!'}
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate First Trip</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip._id}
              onClick={() => navigate(`/trips/${trip._id}`)}
              className="liquid-glass-card rounded-3xl p-6 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {trip.durationDays} Days
                  </span>
                  <button
                    onClick={(e) => handleDelete(trip._id, trip.title, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {trip.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{trip.overview}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {trip.destination?.city}
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${trip.estimatedTotalCost || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
