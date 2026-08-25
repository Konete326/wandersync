import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Compass,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plus,
  Minus,
  CheckCircle2,
  Printer,
  X,
  Sparkles,
  Phone,
  Mail,
  User,
  ShieldCheck,
  ArrowLeft,
  QrCode
} from 'lucide-react';
import { fetchGroupTours, createPOSBooking } from '@/services/groupTourService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import ValidatedInput from '@/components/common/ValidatedInput';

const paymentMethods = ['POS Terminal', 'Cash', 'Credit Card', 'Bank Transfer'];

export default function AdminTourPOSTerminal() {
  const [searchParams] = useSearchParams();
  const initialTourId = searchParams.get('tourId');
  const navigate = useNavigate();
  const { showToast } = useModal();

  const [tours, setTours] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [search, setSearch] = useState('');

  // POS Checkout State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [passengersCount, setPassengersCount] = useState(1);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('POS Terminal');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Issued Receipt Modal State
  const [issuedBooking, setIssuedBooking] = useState(null);

  const loadTours = async () => {
    setLoadingTours(true);
    try {
      const res = await fetchGroupTours(1, 30, search, '', 'Open');
      if (res.data?.tours) {
        setTours(res.data.tours);
        if (initialTourId) {
          const found = res.data.tours.find((t) => t._id === initialTourId);
          if (found) setSelectedTour(found);
        } else if (res.data.tours.length > 0 && !selectedTour) {
          setSelectedTour(res.data.tours[0]);
        }
      }
    } catch {
      showToast('Could not load group tours catalog', 'error');
    } finally {
      setLoadingTours(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, [search]);

  const unitPrice = selectedTour?.pricePerPerson || 0;
  const subtotal = unitPrice * passengersCount;
  const grandTotal = Math.max(0, subtotal - (parseFloat(discountAmount) || 0));
  const remainingSeats = selectedTour ? Math.max(0, selectedTour.totalCapacity - selectedTour.bookedSeats) : 0;

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

    setBookingLoading(true);
    try {
      const res = await createPOSBooking({
        tourId: selectedTour._id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        passengersCount,
        discountAmount: parseFloat(discountAmount) || 0,
        paymentMethod,
        paymentStatus: 'Paid',
        specialRequests
      });

      if (res.data) {
        setIssuedBooking(res.data);
        showToast('Ticket issued successfully! Ready to print.', 'success');
        // Refresh tours
        loadTours();
        // Reset inputs
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
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
    <div className="space-y-6 select-none font-sans max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/group-tours')}
            className="p-2 rounded-xl bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight flex items-center gap-2">
              <CreditCard className="size-4 text-orange-400" />
              <span>Agency Tour POS & Quick Booking Terminal</span>
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Select group expedition, enter traveler roster, process payment, and issue instant boarding passes
            </p>
          </div>
        </div>
      </div>

      {/* POS Grid: Left Catalog + Right Billing Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Tour Selection Catalog */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#121215] border border-border/80 flex items-center justify-between gap-3 shadow-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter tours by title or destination..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-secondary/50 border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
            <span className="text-xs text-muted-foreground font-semibold shrink-0">
              {tours.length} Available Packages
            </span>
          </div>

          {loadingTours ? (
            <div className="py-20 flex items-center justify-center">
              <Loader text="Loading tour packages..." />
            </div>
          ) : tours.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#121215] border border-border text-center space-y-2">
              <Compass className="size-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">No active group tours found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
              {tours.map((t) => {
                const isSelected = selectedTour?._id === t._id;
                const remSeats = Math.max(0, t.totalCapacity - t.bookedSeats);

                return (
                  <div
                    key={t._id}
                    onClick={() => {
                      setSelectedTour(t);
                      setPassengersCount(1);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-md ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/50'
                        : 'bg-[#121215] border-border hover:border-orange-500/30'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="relative h-28 w-full rounded-xl overflow-hidden bg-secondary/30">
                        <img src={t.coverImage} alt={t.title} className="size-full object-cover" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-orange-400 text-[10px] font-bold">
                          {t.category}
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-emerald-400 text-[10px] font-bold">
                          ${t.pricePerPerson} / Seat
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-foreground text-xs line-clamp-1 leading-tight">{t.title}</h4>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="size-2.5 text-emerald-400" />
                          <span>{t.city}, {t.country}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-border/70 mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3 text-orange-400" />
                        <span>{t.durationDays} Days</span>
                      </span>

                      <span className={`font-mono font-bold ${remSeats <= 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {remSeats} Seats Left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: POS Terminal Checkout */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCompleteBooking} className="p-5 rounded-2xl bg-[#121215] border border-orange-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-orange-400" />
                <h3 className="text-sm font-bold text-foreground">POS Terminal Billing</h3>
              </div>
              <span className="text-xs font-mono text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                Live Terminal
              </span>
            </div>

            {/* Selected Tour Summary Badge */}
            {selectedTour ? (
              <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-foreground block truncate">{selectedTour.title}</span>
                  <span className="text-[10px] text-muted-foreground">{selectedTour.durationDays}D Tour • {remainingSeats} seats available</span>
                </div>
                <span className="text-sm font-extrabold text-orange-400 shrink-0 ml-2 font-mono">
                  ${selectedTour.pricePerPerson}/seat
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                Please select a tour package from the left catalog.
              </div>
            )}

            {/* Traveler Customer Info */}
            <div className="space-y-2.5">
              <ValidatedInput
                label="Primary Passenger Name"
                required
                validationType="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Michael Vance"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <ValidatedInput
                  label="Email Address"
                  required
                  validationType="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="traveler@gmail.com"
                />

                <ValidatedInput
                  label="Contact Phone"
                  validationType="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 0199"
                />
              </div>
            </div>

            {/* Tickets / Seat Multiplier */}
            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <Users className="size-3.5 text-cyan-400" />
                  <span>Number of Passenger Seats</span>
                </label>
                <span className="text-xs font-mono font-bold text-orange-400">{passengersCount} Seat(s)</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={passengersCount <= 1}
                    onClick={() => setPassengersCount((prev) => Math.max(1, prev - 1))}
                    className="size-8 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer border border-border"
                  >
                    <Minus className="size-3.5" />
                  </button>

                  <span className="w-10 text-center font-mono font-extrabold text-sm text-foreground">
                    {passengersCount}
                  </span>

                  <button
                    type="button"
                    disabled={passengersCount >= remainingSeats}
                    onClick={() => setPassengersCount((prev) => Math.min(remainingSeats, prev + 1))}
                    className="size-8 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer border border-border"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Base Subtotal</span>
                  <span className="text-xs font-mono font-bold text-foreground">${subtotal} USD</span>
                </div>
              </div>
            </div>

            {/* Discount & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <ValidatedInput
                label="Special Promo Discount ($ USD)"
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="0"
              />

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  {paymentMethods.map((pm) => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Grand Total Bill Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-950/40 to-secondary/60 border border-orange-500/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Calculated Ticket Cost</span>
                <span className="font-mono">${subtotal} USD</span>
              </div>
              {parseFloat(discountAmount) > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span>Applied Discount</span>
                  <span className="font-mono">-${parseFloat(discountAmount)} USD</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-border/70">
                <span className="text-xs font-extrabold text-foreground">Total Bill Due</span>
                <span className="text-xl font-extrabold text-orange-400 font-mono">
                  ${grandTotal.toLocaleString()} USD
                </span>
              </div>
            </div>

            <GlowingButton
              type="submit"
              disabled={bookingLoading || !selectedTour || remainingSeats <= 0}
              size="md"
              className="w-full"
              innerClassName="py-2.5 text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <Sparkles className="size-4 text-orange-400" />
              <span>{bookingLoading ? 'Processing Ticket...' : 'Issue Ticket & Complete POS Booking'}</span>
            </GlowingButton>
          </form>
        </div>
      </div>

      {/* Digital Printable Boarding Pass / Ticket Receipt Modal */}
      {issuedBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
          <div className="max-w-xl w-full rounded-3xl overflow-hidden bg-[#121215] border border-orange-500/50 shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Official Tour Boarding Pass & Receipt</h3>
                  <p className="text-[10px] text-muted-foreground">Booking Ref: {issuedBooking.bookingCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIssuedBooking(null)}
                className="size-7 rounded-full bg-secondary/60 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Printable Pass Body */}
            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 font-sans">
              <div className="p-5 rounded-2xl bg-black/60 border border-border/80 space-y-4">
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
                    <span className="font-bold text-orange-400 block">{issuedBooking.passengersCount} Person(s)</span>
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

            {/* Modal Bottom Actions */}
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
                className="px-4 py-2 rounded-xl bg-orange-500 text-zinc-950 font-bold cursor-pointer"
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
