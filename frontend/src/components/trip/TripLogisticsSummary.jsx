import { useState } from 'react';
import {
  Plane, Building, Car, CheckCircle2, XCircle, ArrowRight,
  DollarSign, Calendar, Clock, Send, ShieldAlert, Sparkles, AlertTriangle
} from 'lucide-react';

const parsePriceNumber = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = String(priceStr).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

const getStatusBadge = (status, isCancelPendingForItem) => {
  if (isCancelPendingForItem) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
        <AlertTriangle className="w-3 h-3" /> Cancel Pending
      </span>
    );
  }
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3" /> Confirmed
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
        <Clock className="w-3 h-3" /> Pending Admin
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
        <ShieldAlert className="w-3 h-3" /> Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
      Not Requested
    </span>
  );
};

export default function TripLogisticsSummary({
  trip,
  onSelectTab,
  onRemoveService,
  onRequestBooking,
  onRequestCancellation,
  isRequesting
}) {
  const flight = trip.selectedFlight;
  const hotel = trip.selectedHotel;
  const vehicle = trip.selectedVehicle;
  const cab = trip.selectedCabService;
  const duration = trip.durationDays || 1;

  const flightCost = flight ? parsePriceNumber(flight.price) : 0;
  const hotelNightly = hotel ? parsePriceNumber(hotel.pricePerNight) : 0;
  const hotelTotal = hotelNightly * duration;
  const vehicleDaily = vehicle ? parsePriceNumber(vehicle.pricePerDay) : 0;
  const vehicleTotal = vehicleDaily * duration;
  const cabCost = cab?.estimatedFare || 0;
  const logisticsTotal = flightCost + hotelTotal + vehicleTotal + cabCost;

  const hasSelections = Boolean(flight || hotel || vehicle || cab?.pickupLocation);
  const bookingStatus = trip.bookingRequest?.status || 'none';
  const flightStatus = trip.bookingRequest?.flightStatus || (bookingStatus === 'confirmed' ? 'confirmed' : bookingStatus === 'pending' ? 'pending' : 'none');
  const hotelStatus = trip.bookingRequest?.hotelStatus || (bookingStatus === 'confirmed' ? 'confirmed' : bookingStatus === 'pending' ? 'pending' : 'none');
  const vehicleStatus = trip.bookingRequest?.vehicleStatus || (bookingStatus === 'confirmed' ? 'confirmed' : bookingStatus === 'pending' ? 'pending' : 'none');

  const cancellationReq = trip.bookingRequest?.cancellationRequest;
  const isCancelPending = cancellationReq?.isPending;

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [userNotes, setUserNotes] = useState(trip.bookingRequest?.userNotes || '');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelItemType, setCancelItemType] = useState('all');
  const [cancelReason, setCancelReason] = useState('');

  const hasUnrequestedOrRejectedItems = (flight && (flightStatus === 'none' || flightStatus === 'rejected')) ||
                                       (hotel && (hotelStatus === 'none' || hotelStatus === 'rejected')) ||
                                       ((vehicle || cab?.pickupLocation) && (vehicleStatus === 'none' || vehicleStatus === 'rejected'));

  const hasAnyPending = flightStatus === 'pending' || hotelStatus === 'pending' || vehicleStatus === 'pending' || bookingStatus === 'pending';

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    const newFlightStatus = flight ? (flightStatus === 'confirmed' ? 'confirmed' : 'pending') : 'none';
    const newHotelStatus = hotel ? (hotelStatus === 'confirmed' ? 'confirmed' : 'pending') : 'none';
    const newVehicleStatus = (vehicle || cab?.pickupLocation) ? (vehicleStatus === 'confirmed' ? 'confirmed' : 'pending') : 'none';

    onRequestBooking({
      status: 'pending',
      flightStatus: newFlightStatus,
      hotelStatus: newHotelStatus,
      vehicleStatus: newVehicleStatus,
      requestedAt: new Date(),
      totalAmount: logisticsTotal,
      userNotes: userNotes.trim()
    });
    setBookingModalOpen(false);
  };

  const handleTriggerRemoveOrCancel = (itemType, itemStatus) => {
    if (itemStatus === 'confirmed') {
      setCancelItemType(itemType);
      setCancelReason('');
      setCancelModalOpen(true);
    } else {
      onRemoveService(itemType);
    }
  };

  const handleTriggerChangeOrCancel = (tabName, itemType, itemStatus) => {
    if (itemStatus === 'confirmed') {
      setCancelItemType(itemType);
      setCancelReason('');
      setCancelModalOpen(true);
    } else {
      onSelectTab(tabName);
    }
  };

  const handleSubmitCancellation = (e) => {
    e.preventDefault();
    onRequestCancellation({
      itemType: cancelItemType,
      reason: cancelReason.trim() || 'User requested cancellation'
    });
    setCancelModalOpen(false);
  };

  return (
    <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Travel & Stay Logistics</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Selected flights, accommodations, and transit for {trip.destination?.city || 'your destination'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-cyan-300">Logistics Total</p>
              <p className="text-base font-extrabold text-white">
                ${logisticsTotal.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{trip.currency || 'USD'}</span>
              </p>
            </div>
          </div>

          {hasSelections && (
            <div>
              {hasUnrequestedOrRejectedItems && (
                <button
                  onClick={() => setBookingModalOpen(true)}
                  disabled={isRequesting}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {flightStatus === 'rejected' || hotelStatus === 'rejected' || vehicleStatus === 'rejected' ? 'Re-Request Approval from Admin' : 'Request Booking from Admin'}
                </button>
              )}

              {!hasUnrequestedOrRejectedItems && hasAnyPending && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Awaiting Admin Approval</span>
                </div>
              )}

              {!hasUnrequestedOrRejectedItems && !hasAnyPending && bookingStatus === 'confirmed' && !isCancelPending && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>All Bookings Confirmed</span>
                </div>
              )}

              {bookingStatus === 'partially_confirmed' && !hasUnrequestedOrRejectedItems && !hasAnyPending && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Partially Confirmed</span>
                </div>
              )}

              {isCancelPending && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Cancellation Pending Admin Confirmation</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isCancelPending && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Cancellation Request:</strong> You requested to cancel <strong>{cancellationReq.itemType?.toUpperCase()}</strong>. Awaiting Admin review.
            </span>
          </div>
          {cancellationReq.reason && (
            <span className="text-[11px] text-slate-400 italic">
              "{cancellationReq.reason}"
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border transition-all ${
          flight
            ? flightStatus === 'confirmed'
              ? 'bg-slate-900/90 border-emerald-500/40'
              : flightStatus === 'pending'
              ? 'bg-slate-900/90 border-amber-500/40'
              : flightStatus === 'rejected'
              ? 'bg-slate-900/90 border-rose-500/40'
              : 'bg-slate-900/90 border-cyan-500/40'
            : 'bg-slate-950/40 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Plane className="w-4 h-4" /> Flight / Plane
            </span>
            {flight ? (
              getStatusBadge(flightStatus, isCancelPending && (cancellationReq.itemType === 'flight' || cancellationReq.itemType === 'all'))
            ) : (
              <span className="text-[10px] text-slate-500 font-medium">Not Selected</span>
            )}
          </div>

          {flight ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-white">{flight.airline}</p>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <span>{flight.originCity || 'Origin'}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  <span>{flight.destinationCity}</span>
                </p>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">{flight.cabinClass || 'Economy'}</span>
                <span className="font-bold text-emerald-400">${flightCost}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleTriggerChangeOrCancel('flights', 'flight', flightStatus)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  {flightStatus === 'confirmed' ? 'Request Change' : 'Change Flight'}
                </button>
                <button
                  onClick={() => handleTriggerRemoveOrCancel('flight', flightStatus)}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                  title={flightStatus === 'confirmed' ? "Request cancellation for flight" : "Remove flight"}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-slate-400">No flight selected for this trip.</p>
              <button
                onClick={() => onSelectTab('flights')}
                className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white text-xs font-semibold border border-cyan-500/30 transition-all"
              >
                Choose Flight
              </button>
            </div>
          )}
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          hotel
            ? hotelStatus === 'confirmed'
              ? 'bg-slate-900/90 border-emerald-500/40'
              : hotelStatus === 'pending'
              ? 'bg-slate-900/90 border-amber-500/40'
              : hotelStatus === 'rejected'
              ? 'bg-slate-900/90 border-rose-500/40'
              : 'bg-slate-900/90 border-cyan-500/40'
            : 'bg-slate-950/40 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Building className="w-4 h-4" /> Hotel & Stay
            </span>
            {hotel ? (
              getStatusBadge(hotelStatus, isCancelPending && (cancellationReq.itemType === 'hotel' || cancellationReq.itemType === 'all'))
            ) : (
              <span className="text-[10px] text-slate-500 font-medium">Not Selected</span>
            )}
          </div>

          {hotel ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-white truncate">{hotel.name}</p>
                <p className="text-xs text-slate-300 mt-0.5 truncate">{hotel.city}, {hotel.country}</p>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {duration} nights
                </span>
                <span className="font-bold text-emerald-400">${hotelTotal}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleTriggerChangeOrCancel('hotels', 'hotel', hotelStatus)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  {hotelStatus === 'confirmed' ? 'Request Change' : 'Change Hotel'}
                </button>
                <button
                  onClick={() => handleTriggerRemoveOrCancel('hotel', hotelStatus)}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                  title={hotelStatus === 'confirmed' ? "Request cancellation for hotel" : "Remove hotel"}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-slate-400">No hotel reserved for this trip.</p>
              <button
                onClick={() => onSelectTab('hotels')}
                className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white text-xs font-semibold border border-amber-500/30 transition-all"
              >
                Choose Hotel
              </button>
            </div>
          )}
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          (vehicle || cab?.pickupLocation)
            ? vehicleStatus === 'confirmed'
              ? 'bg-slate-900/90 border-emerald-500/40'
              : vehicleStatus === 'pending'
              ? 'bg-slate-900/90 border-amber-500/40'
              : vehicleStatus === 'rejected'
              ? 'bg-slate-900/90 border-rose-500/40'
              : 'bg-slate-900/90 border-cyan-500/40'
            : 'bg-slate-950/40 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Car className="w-4 h-4" /> Car / Cab Rental
            </span>
            {(vehicle || cab?.pickupLocation) ? (
              getStatusBadge(vehicleStatus, isCancelPending && (cancellationReq.itemType === 'vehicle' || cancellationReq.itemType === 'cab' || cancellationReq.itemType === 'all'))
            ) : (
              <span className="text-[10px] text-slate-500 font-medium">Not Selected</span>
            )}
          </div>

          {vehicle ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-white truncate">{vehicle.name}</p>
                <p className="text-xs text-slate-300 mt-0.5">{vehicle.vehicleType} • {vehicle.capacity}</p>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">{duration} days rental</span>
                <span className="font-bold text-emerald-400">${vehicleTotal}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleTriggerChangeOrCancel('transport', 'vehicle', vehicleStatus)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  {vehicleStatus === 'confirmed' ? 'Request Change' : 'Change Car'}
                </button>
                <button
                  onClick={() => handleTriggerRemoveOrCancel('vehicle', vehicleStatus)}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                  title={vehicleStatus === 'confirmed' ? "Request cancellation for vehicle" : "Remove vehicle"}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : cab?.pickupLocation ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-white truncate">Cab: {cab.cabType}</p>
                <p className="text-xs text-slate-300 mt-0.5 truncate">{cab.pickupLocation} → {cab.dropoffLocation}</p>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Direct Cab Transfer</span>
                <span className="font-bold text-emerald-400">${cab.estimatedFare}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleTriggerChangeOrCancel('transport', 'cab', vehicleStatus)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  {vehicleStatus === 'confirmed' ? 'Request Change' : 'Change Cab'}
                </button>
                <button
                  onClick={() => handleTriggerRemoveOrCancel('cab', vehicleStatus)}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                  title={vehicleStatus === 'confirmed' ? "Request cancellation for cab" : "Remove cab"}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-slate-400">No rental car or cab booked.</p>
              <button
                onClick={() => onSelectTab('transport')}
                className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/30 transition-all"
              >
                Rent Car / Cab
              </button>
            </div>
          )}
        </div>
      </div>

      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-emerald-500/30 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Send Booking Request</h3>
                  <p className="text-xs text-slate-400">Admin will review & approve newly requested items</p>
                </div>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Flight:</span>
                <span className="font-semibold text-white">
                  {flight ? `${flight.airline} ($${flightCost}) - ` : 'None'}
                  <span className={`text-[10px] font-bold ${flightStatus === 'confirmed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {flight ? (flightStatus === 'confirmed' ? 'Already Confirmed' : 'Will Request Approval') : ''}
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Hotel:</span>
                <span className="font-semibold text-white">
                  {hotel ? `${hotel.name} ($${hotelTotal}) - ` : 'None'}
                  <span className={`text-[10px] font-bold ${hotelStatus === 'confirmed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {hotel ? (hotelStatus === 'confirmed' ? 'Already Confirmed' : 'Will Request Approval') : ''}
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Vehicle / Cab:</span>
                <span className="font-semibold text-white">
                  {vehicle ? `${vehicle.name} ($${vehicleTotal}) - ` : cab?.pickupLocation ? `Cab ($${cabCost}) - ` : 'None'}
                  <span className={`text-[10px] font-bold ${vehicleStatus === 'confirmed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {(vehicle || cab?.pickupLocation) ? (vehicleStatus === 'confirmed' ? 'Already Confirmed' : 'Will Request Approval') : ''}
                  </span>
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="font-bold text-slate-300">Total Booking:</span>
                <span className="font-extrabold text-emerald-400">${logisticsTotal.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Special Notes for Admin (Optional)
                </label>
                <textarea
                  rows={3}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g. Please approve the newly added flight and hotel..."
                  className="w-full p-3 rounded-xl glass-input text-xs text-white focus:outline-none border border-slate-800 focus:border-emerald-500/50"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRequesting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-500/40 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cancellation Request</h3>
                  <p className="text-xs text-slate-400">Admin approval is required to cancel confirmed bookings</p>
                </div>
              </div>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <p>
                You are requesting to cancel <strong>{cancelItemType.toUpperCase()}</strong>. Once submitted, the Admin will review and process your cancellation.
              </p>
            </div>

            <form onSubmit={handleSubmitCancellation} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Reason for Cancellation / Modification
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Schedule changed / need to switch flight time..."
                  className="w-full p-3 rounded-xl glass-input text-xs text-white focus:outline-none border border-slate-800 focus:border-amber-500/50"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isRequesting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Send Cancellation Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
