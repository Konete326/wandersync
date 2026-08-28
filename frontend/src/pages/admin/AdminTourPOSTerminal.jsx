import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Compass,
  MapPin,
  Calendar,
  Users,
  Plus,
  Minus,
  CheckCircle2,
  Printer,
  X,
  Sparkles,
  ArrowLeft,
  QrCode,
  DollarSign,
  Receipt,
  Ticket,
  Filter,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { fetchGroupTours, createPOSBooking, fetchTourBookings } from '@/services/groupTourService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import ValidatedInput from '@/components/common/ValidatedInput';
import {
  countryCallingCodes,
  detectLocalCallingCode,
  setDefaultCallingCode,
  formatPhoneNumber
} from '@/utils/countryDetector';
import { getCountryFlag } from '@/utils/worldCountriesData';
import {
  subscribeRealtimeUpdate,
  broadcastRealtimeUpdate,
  getCachedData,
  setCachedData
} from '@/utils/realtimeSync';

const paymentMethods = ['POS Terminal', 'Cash', 'Credit Card', 'Bank Transfer'];
const categoryOptions = ['All', 'Cultural & Adventure', 'Luxury & Cruise', 'Desert & Safari', 'Mountain Trekking', 'City Break', 'Wildlife & Nature'];
const statusFilterOptions = ['All', 'Open', 'Filling Fast', 'Sold Out'];

export default function AdminTourPOSTerminal() {
  const [searchParams] = useSearchParams();
  const initialTourId = searchParams.get('tourId');
  const navigate = useNavigate();
  const { showToast } = useModal();

  const [activeTab, setActiveTab] = useState('terminal');
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [countriesList, setCountriesList] = useState([]);

  const cacheKey = `pos_tours_${search}_${selectedCountry}_${selectedCategory}_${selectedStatus}`;
  const initialData = getCachedData(cacheKey);

  const [tours, setTours] = useState(initialData?.tours || []);
  const [loadingTours, setLoadingTours] = useState(!initialData);
  const [selectedTour, setSelectedTour] = useState(initialData?.tours?.[0] || null);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState(detectLocalCallingCode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passengersCount, setPassengersCount] = useState(1);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('POS Terminal');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [issuedBooking, setIssuedBooking] = useState(null);

  const [bookingsList, setBookingsList] = useState([]);
  const [posStats, setPosStats] = useState({ totalRevenue: 0, totalTickets: 0, count: 0 });
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');

  const loadCountries = async () => {
    try {
      const res = await fetchCountries(1, 100);
      if (res.data?.countries) {
        setCountriesList(res.data.countries);
      }
    } catch {
    }
  };

  const loadTours = async (isBackground = false) => {
    const key = `pos_tours_${search}_${selectedCountry}_${selectedCategory}_${selectedStatus}`;
    const cached = getCachedData(key);
    if (!isBackground && !cached) {
      setLoadingTours(true);
    }
    try {
      const res = await fetchGroupTours(1, 50, search, selectedCountry, selectedStatus, selectedCategory);
      if (res.data?.tours) {
        setTours(res.data.tours);
        setCachedData(key, res.data);
        if (initialTourId) {
          const found = res.data.tours.find((t) => t._id === initialTourId);
          if (found) setSelectedTour(found);
        } else if (res.data.tours.length > 0) {
          setSelectedTour((curr) => {
            if (!curr) return res.data.tours[0];
            const updated = res.data.tours.find((t) => t._id === curr._id);
            return updated || res.data.tours[0];
          });
        }
      } else {
        setTours([]);
      }
    } catch {
      if (!isBackground) {
        showToast('Could not load group tours catalog', 'error');
      }
    } finally {
      setLoadingTours(false);
    }
  };

  const loadBookings = async (isBackground = false) => {
    if (!isBackground) setLoadingBookings(true);
    try {
      const res = await fetchTourBookings('', bookingSearch);
      if (res.data) {
        if (res.data.bookings) {
          setBookingsList(res.data.bookings);
          if (res.data.stats) setPosStats(res.data.stats);
        } else if (Array.isArray(res.data)) {
          setBookingsList(res.data);
          const rev = res.data.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
          const tix = res.data.reduce((acc, curr) => acc + (curr.passengersCount || 0), 0);
          setPosStats({ totalRevenue: rev, totalTickets: tix, count: res.data.length });
        }
      }
    } catch {
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    loadTours();
  }, [search, selectedCountry, selectedCategory, selectedStatus]);

  useEffect(() => {
    loadBookings();
  }, [bookingSearch]);

  useEffect(() => {
    const unsubTours = subscribeRealtimeUpdate('group-tours', () => {
      loadTours(true);
      loadBookings(true);
    });
    const unsubBookings = subscribeRealtimeUpdate('tour-bookings', () => {
      loadBookings(true);
    });
    const timer = setInterval(() => {
      loadTours(true);
      loadBookings(true);
    }, 10000);
    return () => {
      unsubTours();
      unsubBookings();
      clearInterval(timer);
    };
  }, [search, selectedCountry, selectedCategory, selectedStatus]);

  const unitPrice = selectedTour?.pricePerPerson || 0;
  const subtotal = unitPrice * passengersCount;
  const grandTotal = Math.max(0, subtotal - (parseFloat(discountAmount) || 0));
  const remainingSeats = selectedTour ? Math.max(0, selectedTour.totalCapacity - selectedTour.bookedSeats) : 0;
  const totalAvailableSeatsPool = tours.reduce((acc, t) => acc + Math.max(0, t.totalCapacity - t.bookedSeats), 0);

  const handleCompleteBooking = async (e) => {
    e.preventDefault();
    if (!selectedTour) {
      showToast('Please select a tour package from the catalog', 'warning');
      return;
    }
    if (!customerName || !customerEmail) {
      showToast('Customer name and email are required for booking receipt', 'warning');
      return;
    }
    if (passengersCount > remainingSeats) {
      showToast(`Only ${remainingSeats} seats available in this tour`, 'warning');
      return;
    }

    const fullPhone = phoneNumber.trim() ? `${phoneCountryCode} ${phoneNumber.trim()}` : '';

    setBookingLoading(true);
    try {
      const res = await createPOSBooking({
        tourId: selectedTour._id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: fullPhone,
        passengersCount,
        discountAmount: parseFloat(discountAmount) || 0,
        paymentMethod,
        paymentStatus: 'Paid',
        specialRequests
      });

      if (res.data) {
        setIssuedBooking(res.data);
        broadcastRealtimeUpdate('group-tours');
        broadcastRealtimeUpdate('tour-bookings');
        showToast('Ticket issued successfully! Ready to print.', 'success');
        loadTours(true);
        loadBookings(true);
        setCustomerName('');
        setCustomerEmail('');
        setPhoneNumber('');
        setPassengersCount(1);
        setDiscountAmount(0);
        setSpecialRequests('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete POS transaction', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 font-sans select-none pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-[#121215] border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/group-tours')}
            className="p-1.5 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border"
            title="Back to Group Tours"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <CreditCard className="size-4 text-orange-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none">Tour POS Counter Terminal</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">Instant booking, seat reservation & live ticket counter</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-[#18181b] p-0.5 border border-border text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'terminal'
                  ? 'bg-orange-500 text-zinc-950 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Ticket className="size-3.5" />
              <span>Counter POS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-orange-500 text-zinc-950 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Receipt className="size-3.5" />
              <span>Issued Tickets ({bookingsList.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              loadTours();
              loadBookings();
            }}
            className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border cursor-pointer"
            title="Refresh POS Data"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#121215] border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium block">Total POS Revenue</span>
            <span className="text-base font-extrabold text-foreground font-mono mt-0.5 block">
              ${(posStats.totalRevenue || 0).toLocaleString()} USD
            </span>
          </div>
          <div className="size-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <DollarSign className="size-4 text-emerald-400" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#121215] border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium block">Tickets Issued</span>
            <span className="text-base font-extrabold text-foreground font-mono mt-0.5 block">
              {posStats.totalTickets || 0} Seats
            </span>
          </div>
          <div className="size-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <Receipt className="size-4 text-orange-400" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#121215] border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium block">Active Packages</span>
            <span className="text-base font-extrabold text-foreground font-mono mt-0.5 block">
              {tours.length} Tours
            </span>
          </div>
          <div className="size-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Compass className="size-4 text-cyan-400" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#121215] border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium block">Available Seats</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono mt-0.5 block">
              {totalAvailableSeatsPool} Open
            </span>
          </div>
          <div className="size-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Users className="size-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {activeTab === 'terminal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          <div className="lg:col-span-7 flex flex-col min-h-[550px]">
            <div className="p-3 rounded-2xl bg-[#121215] border border-border/80 space-y-2 mb-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tour title, destination, guide..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-[#18181b] border border-border text-[11px] text-foreground focus:outline-none focus:border-orange-500/60 cursor-pointer"
                >
                  <option value="All">All Countries</option>
                  {countriesList.map((c) => (
                    <option key={c._id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-[#18181b] border border-border text-[11px] text-foreground focus:outline-none focus:border-orange-500/60 cursor-pointer"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-[#18181b] border border-border text-[11px] text-foreground focus:outline-none focus:border-orange-500/60 cursor-pointer"
                >
                  {statusFilterOptions.map((st) => (
                    <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingTours ? (
              <div className="flex-1 flex items-center justify-center p-12 rounded-2xl bg-[#121215] border border-border">
                <Loader text="Loading tour packages..." />
              </div>
            ) : tours.length === 0 ? (
              <div className="p-10 rounded-2xl bg-[#121215] border border-border text-center space-y-3 flex-1 flex flex-col items-center justify-center">
                <Compass className="size-10 text-muted-foreground/40 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">No Tour Packages Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    No active tours match your filters or none exist in the database. Create a new group tour package to start selling tickets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/admin/group-tours/create')}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-orange-400 transition-colors"
                >
                  <Plus className="size-3.5" />
                  <span>Create Tour Package</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[calc(100vh-280px)] content-start">
                {tours.map((t) => {
                  const isSelected = selectedTour?._id === t._id;
                  const remSeats = Math.max(0, t.totalCapacity - t.bookedSeats);
                  const isSoldOut = remSeats === 0 || t.status === 'Sold Out';

                  return (
                    <div
                      key={t._id}
                      onClick={() => {
                        setSelectedTour(t);
                        setPassengersCount(1);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/50'
                          : 'bg-[#121215] border-border/80 hover:border-orange-500/40'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="relative h-24 w-full rounded-xl overflow-hidden bg-secondary/30">
                          <img
                            src={t.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80'}
                            alt={t.title}
                            className="size-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-orange-400 text-[10px] font-bold border border-orange-500/20">
                            {t.category}
                          </div>
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-foreground text-[10px] font-extrabold font-mono border border-border">
                            ${t.pricePerPerson} / Seat
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <h4 className="font-bold text-foreground text-xs truncate leading-tight flex-1">{t.title}</h4>
                            <span className="text-xs shrink-0">{getCountryFlag(t.country)}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3 text-orange-400 shrink-0" />
                            <span className="truncate">{t.city}, {t.country}</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/70 mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3 text-orange-400" />
                          <span>{t.durationDays} Days</span>
                        </span>

                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          isSoldOut
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : remSeats <= 3
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {isSoldOut ? 'Sold Out' : `${remSeats} Seats Left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-16">
            <form onSubmit={handleCompleteBooking} className="p-4 rounded-2xl bg-[#121215] border border-orange-500/40 shadow-2xl space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-orange-400" />
                  <h3 className="text-xs font-bold text-foreground">POS Terminal Billing</h3>
                </div>
                <span className="text-[10px] font-mono text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/30 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Counter
                </span>
              </div>

              {selectedTour ? (
                <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-foreground block truncate text-xs">{selectedTour.title}</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span>{selectedTour.durationDays}D Expedition</span>
                      <span>•</span>
                      <span className={remainingSeats <= 3 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {remainingSeats} seats available
                      </span>
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-orange-400 shrink-0 font-mono">
                    ${selectedTour.pricePerPerson}
                    <span className="text-[10px] text-muted-foreground font-normal block text-right">/ seat</span>
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  Please select a tour package from the left catalog to start booking.
                </div>
              )}

              <div className="space-y-2.5">
                <ValidatedInput
                  label="Lead Passenger Name"
                  required
                  validationType="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alexander Wright"
                  containerClassName="space-y-1"
                  className="py-1.5 text-xs"
                />

                <div className="space-y-1">
                  <ValidatedInput
                    label="Email Address"
                    required
                    validationType="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="passenger@example.com"
                    containerClassName="space-y-1"
                    className="py-1.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contactPhone" className="text-xs font-bold text-zinc-300 flex items-center justify-between cursor-pointer">
                    <span>Contact Phone</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      id="phoneCountryCode"
                      aria-label="Country Calling Code"
                      value={phoneCountryCode}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        setPhoneCountryCode(newCode);
                        setDefaultCallingCode(newCode);
                        const selected = countryCallingCodes.find((c) => c.code === newCode);
                        if (selected && phoneNumber) {
                          setPhoneNumber(formatPhoneNumber(phoneNumber, selected.mask));
                        }
                      }}
                      className="w-28 px-2 py-1.5 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer shrink-0 font-mono"
                    >
                      {countryCallingCodes.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#121215] text-foreground">
                          {c.code} ({c.name})
                        </option>
                      ))}
                    </select>

                    <input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const selected = countryCallingCodes.find((c) => c.code === phoneCountryCode) || countryCallingCodes[0];
                        setPhoneNumber(formatPhoneNumber(e.target.value, selected.mask));
                      }}
                      placeholder={
                        countryCallingCodes.find((c) => c.code === phoneCountryCode)?.sample || '300 1234567'
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 select-text font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                      <span>Seats</span>
                      <span className="text-orange-400 font-mono font-bold">{passengersCount}</span>
                    </label>
                    <div className="flex items-center gap-1 bg-[#18181b] rounded-xl border border-border p-1">
                      <button
                        type="button"
                        disabled={passengersCount <= 1}
                        onClick={() => setPassengersCount((prev) => Math.max(1, prev - 1))}
                        className="size-7 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="flex-1 text-center font-mono font-extrabold text-xs text-foreground">
                        {passengersCount}
                      </span>
                      <button
                        type="button"
                        disabled={passengersCount >= remainingSeats || remainingSeats <= 0}
                        onClick={() => setPassengersCount((prev) => Math.min(remainingSeats, prev + 1))}
                        className="size-7 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Payment Mode</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
                    >
                      {paymentMethods.map((pm) => (
                        <option key={pm} value={pm} className="bg-[#121215] text-foreground">{pm}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <ValidatedInput
                    label="Promo Discount ($)"
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                    containerClassName="space-y-1"
                    className="py-1.5 text-xs"
                  />

                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-950/40 to-secondary/60 border border-orange-500/40 flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Due</span>
                    <span className="text-base font-extrabold text-orange-400 font-mono leading-tight">
                      ${grandTotal.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>

              <GlowingButton
                type="submit"
                disabled={bookingLoading || !selectedTour || remainingSeats <= 0}
                size="sm"
                className="w-full mt-2"
                innerClassName="py-2.5 text-xs font-extrabold flex items-center justify-center gap-2"
              >
                <Sparkles className="size-4 text-orange-400" />
                <span>{bookingLoading ? 'Processing Ticket...' : 'Issue Ticket & Complete POS'}</span>
              </GlowingButton>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#121215] border border-border/80 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-orange-400" />
              <h3 className="text-sm font-bold text-foreground">Issued POS Tickets & Receipts</h3>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search booking code, passenger, email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60"
              />
            </div>
          </div>

          {loadingBookings ? (
            <div className="p-12 flex items-center justify-center">
              <Loader text="Loading issued tickets..." />
            </div>
          ) : bookingsList.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Receipt className="size-10 text-muted-foreground/30 mx-auto" />
              <h4 className="text-xs font-bold text-foreground">No Tickets Issued Yet</h4>
              <p className="text-[11px] text-muted-foreground">Issued POS tickets and boarding passes will appear here in real time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/70 text-muted-foreground text-[11px]">
                    <th className="pb-2.5 font-bold">Booking Ref</th>
                    <th className="pb-2.5 font-bold">Passenger</th>
                    <th className="pb-2.5 font-bold">Tour Package</th>
                    <th className="pb-2.5 font-bold text-center">Seats</th>
                    <th className="pb-2.5 font-bold">Amount Paid</th>
                    <th className="pb-2.5 font-bold">Payment</th>
                    <th className="pb-2.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {bookingsList.map((b) => (
                    <tr key={b._id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-orange-400">{b.bookingCode}</td>
                      <td className="py-2.5">
                        <div className="font-bold text-foreground">{b.customerName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{b.customerEmail}</div>
                      </td>
                      <td className="py-2.5">
                        <div className="font-medium text-foreground truncate max-w-xs">{b.tour?.title || 'Tour Package'}</div>
                        <div className="text-[10px] text-muted-foreground">{b.tour?.city}, {b.tour?.country}</div>
                      </td>
                      <td className="py-2.5 text-center font-mono font-bold text-foreground">{b.passengersCount}</td>
                      <td className="py-2.5 font-mono font-bold text-emerald-400">${b.totalPaid} USD</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded bg-secondary text-[10px] text-foreground font-medium border border-border">
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setIssuedBooking(b)}
                          className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-bold text-[11px] border border-orange-500/30 cursor-pointer inline-flex items-center gap-1 transition-colors"
                        >
                          <Printer className="size-3" />
                          <span>Boarding Pass</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {issuedBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
          <div className="max-w-xl w-full rounded-3xl overflow-hidden bg-[#121215] border border-orange-500/50 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Official Tour Boarding Pass & Receipt</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">Booking Ref: {issuedBooking.bookingCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIssuedBooking(null)}
                className="size-7 rounded-full bg-secondary/60 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1 font-sans">
              <div className="p-5 rounded-2xl bg-black/70 border border-border/80 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">
                      WanderSync Tour Expeditions
                    </span>
                    <h2 className="text-base font-bold text-white mt-0.5">{issuedBooking.tour?.title}</h2>
                    <p className="text-[11px] text-muted-foreground">{issuedBooking.tour?.city}, {issuedBooking.tour?.country}</p>
                  </div>
                  <div className="size-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                    <QrCode className="size-full text-black" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Lead Traveler</span>
                    <span className="font-bold text-foreground block truncate">{issuedBooking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Seats Confirmed</span>
                    <span className="font-bold text-orange-400 block font-mono">{issuedBooking.passengersCount} Person(s)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Departure Date</span>
                    <span className="font-bold text-foreground block">
                      {issuedBooking.tour?.startDate ? new Date(issuedBooking.tour.startDate).toLocaleDateString() : 'Confirmed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Payment Status</span>
                    <span className="font-bold text-emerald-400 block">{issuedBooking.paymentStatus} ({issuedBooking.paymentMethod})</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Amount Paid</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ${issuedBooking.totalPaid} USD
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary/30 border-t border-border flex items-center justify-between text-xs">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold flex items-center gap-2 border border-border cursor-pointer transition-colors"
              >
                <Printer className="size-4 text-orange-400" />
                <span>Print Boarding Pass</span>
              </button>

              <button
                onClick={() => setIssuedBooking(null)}
                className="px-4 py-2 rounded-xl bg-orange-500 text-zinc-950 font-bold cursor-pointer hover:bg-orange-400 transition-colors"
              >
                Done / Next Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
