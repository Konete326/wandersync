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
  QrCode
} from 'lucide-react';
import { fetchGroupTours, createPOSBooking } from '@/services/groupTourService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import ValidatedInput from '@/components/common/ValidatedInput';

const paymentMethods = ['POS Terminal', 'Cash', 'Credit Card', 'Bank Transfer'];

const countryCallingCodes = [
  { code: '+1', country: 'US/CA', mask: '(###) ###-####' },
  { code: '+44', country: 'UK', mask: '#### ######' },
  { code: '+92', country: 'PK', mask: '### #######' },
  { code: '+971', country: 'UAE', mask: '## ### ####' },
  { code: '+966', country: 'KSA', mask: '## ### ####' },
  { code: '+91', country: 'IN', mask: '##### #####' },
  { code: '+61', country: 'AU', mask: '### ### ###' },
  { code: '+49', country: 'DE', mask: '#### #######' },
  { code: '+33', country: 'FR', mask: '# ## ## ## ##' },
  { code: '+81', country: 'JP', mask: '## #### ####' },
  { code: '+86', country: 'CN', mask: '### #### ####' },
  { code: '+90', country: 'TR', mask: '### ### ####' },
  { code: '+60', country: 'MY', mask: '## ### ####' },
  { code: '+65', country: 'SG', mask: '#### ####' },
  { code: '+34', country: 'ES', mask: '### ### ###' },
  { code: '+39', country: 'IT', mask: '### ### ####' }
];

const formatPhoneNumber = (digits, mask) => {
  const clean = digits.replace(/\D/g, '');
  let formatted = '';
  let cleanIndex = 0;
  for (let i = 0; i < mask.length && cleanIndex < clean.length; i++) {
    if (mask[i] === '#') {
      formatted += clean[cleanIndex++];
    } else {
      formatted += mask[i];
    }
  }
  return formatted;
};

export default function AdminTourPOSTerminal() {
  const [searchParams] = useSearchParams();
  const initialTourId = searchParams.get('tourId');
  const navigate = useNavigate();
  const { showToast } = useModal();

  const [tours, setTours] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [search, setSearch] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passengersCount, setPassengersCount] = useState(1);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('POS Terminal');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

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
        showToast('Ticket issued successfully! Ready to print.', 'success');
        loadTours();
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
    <div className="w-full max-w-7xl mx-auto space-y-2.5 font-sans select-none pb-6">
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/group-tours')}
            className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border"
            title="Back to Group Tours"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-orange-400" />
            <h1 className="text-sm font-bold text-foreground">Agency Tour POS Terminal</h1>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">
          {tours.length} Available Packages
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-7 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tours by title or destination..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
            />
          </div>

          {loadingTours ? (
            <div className="py-16 flex items-center justify-center">
              <Loader text="Loading tour packages..." />
            </div>
          ) : tours.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#121215] border border-border text-center space-y-2">
              <Compass className="size-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">No active group tours found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[calc(100vh-11rem)] overflow-y-auto pr-1">
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
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500/50'
                        : 'bg-[#121215] border-border/80 hover:border-orange-500/30'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="relative h-20 w-full rounded-lg overflow-hidden bg-secondary/30">
                        <img src={t.coverImage} alt={t.title} className="size-full object-cover" />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-orange-400 text-[9px] font-bold">
                          {t.category}
                        </div>
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-foreground text-[9px] font-bold">
                          ${t.pricePerPerson} / Seat
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-foreground text-xs truncate leading-tight">{t.title}</h4>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="size-2.5 text-orange-400 shrink-0" />
                          <span className="truncate">{t.city}, {t.country}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-border/70 mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-2.5 text-orange-400" />
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

        <div className="lg:col-span-5">
          <form onSubmit={handleCompleteBooking} className="p-3.5 rounded-2xl bg-[#121215] border border-orange-500/30 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/70 pb-2">
              <div className="flex items-center gap-1.5">
                <CreditCard className="size-3.5 text-orange-400" />
                <h3 className="text-xs font-bold text-foreground">POS Terminal Billing</h3>
              </div>
              <span className="text-[10px] font-mono text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                Live Terminal
              </span>
            </div>

            {selectedTour ? (
              <div className="p-2 rounded-lg bg-secondary/40 border border-border flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-foreground block truncate text-[11px]">{selectedTour.title}</span>
                  <span className="text-[10px] text-muted-foreground">{selectedTour.durationDays}D Tour • {remainingSeats} seats available</span>
                </div>
                <span className="text-xs font-extrabold text-orange-400 shrink-0 ml-2 font-mono">
                  ${selectedTour.pricePerPerson}/seat
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                Please select a tour package from the left catalog.
              </div>
            )}

            <div className="space-y-2">
              <ValidatedInput
                label="Lead Passenger Name"
                required
                validationType="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Michael Vance"
                containerClassName="space-y-0.5"
                className="py-1"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <ValidatedInput
                  label="Email Address"
                  required
                  validationType="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="traveler@gmail.com"
                  containerClassName="space-y-0.5"
                  className="py-1"
                />

                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                    <span>Contact Phone</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={phoneCountryCode}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        setPhoneCountryCode(newCode);
                        const selected = countryCallingCodes.find((c) => c.code === newCode);
                        if (selected && phoneNumber) {
                          setPhoneNumber(formatPhoneNumber(phoneNumber, selected.mask));
                        }
                      }}
                      className="w-24 px-1.5 py-1 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer h-[30px] shrink-0 font-mono"
                    >
                      {countryCallingCodes.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#121215] text-foreground">
                          {c.code} ({c.country})
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const selected = countryCallingCodes.find((c) => c.code === phoneCountryCode) || countryCallingCodes[0];
                        setPhoneNumber(formatPhoneNumber(e.target.value, selected.mask));
                      }}
                      placeholder={
                        countryCallingCodes.find((c) => c.code === phoneCountryCode)?.mask.replace(/#/g, '0') || '(555) 000-0000'
                      }
                      className="w-full px-2.5 py-1 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 h-[30px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                    <span>Seats</span>
                    <span className="text-orange-400 font-mono">{passengersCount}</span>
                  </label>
                  <div className="flex items-center gap-1 bg-secondary/50 rounded-lg border border-border p-0.5 h-[30px]">
                    <button
                      type="button"
                      disabled={passengersCount <= 1}
                      onClick={() => setPassengersCount((prev) => Math.max(1, prev - 1))}
                      className="size-6 rounded bg-secondary hover:bg-secondary/80 text-foreground font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="flex-1 text-center font-mono font-bold text-xs text-foreground">
                      {passengersCount}
                    </span>
                    <button
                      type="button"
                      disabled={passengersCount >= remainingSeats}
                      onClick={() => setPassengersCount((prev) => Math.min(remainingSeats, prev + 1))}
                      className="size-6 rounded bg-secondary hover:bg-secondary/80 text-foreground font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-zinc-300">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-2.5 py-1 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer h-[30px]"
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
                  containerClassName="space-y-0.5"
                  className="py-1"
                />

                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-950/40 to-secondary/60 border border-orange-500/40 flex flex-col justify-center">
                  <span className="text-[10px] text-muted-foreground block">Total Due</span>
                  <span className="text-sm font-extrabold text-orange-400 font-mono">
                    ${grandTotal.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            <GlowingButton
              type="submit"
              disabled={bookingLoading || !selectedTour || remainingSeats <= 0}
              size="sm"
              className="w-full mt-1"
              innerClassName="py-2 text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <Sparkles className="size-3.5 text-orange-400" />
              <span>{bookingLoading ? 'Processing Ticket...' : 'Issue Ticket & Complete POS'}</span>
            </GlowingButton>
          </form>
        </div>
      </div>

      {issuedBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
          <div className="max-w-xl w-full rounded-3xl overflow-hidden bg-[#121215] border border-orange-500/50 shadow-2xl flex flex-col max-h-[92vh]">
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
