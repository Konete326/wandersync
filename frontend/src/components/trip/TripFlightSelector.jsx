import { useState, useEffect } from 'react';
import { Plane, Search, Check, Clock, ArrowRight, ShieldCheck, ExternalLink, Sparkles, MapPin } from 'lucide-react';
import { fetchFlights } from '@/services/flightService';

const parsePriceNumber = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = String(priceStr).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

export default function TripFlightSelector({ trip, onSelectFlight, selectedFlightId, isSelecting }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cabinClass, setCabinClass] = useState('All');

  const destCity = (trip.destination?.city || '').trim().toLowerCase();
  const destCountry = (trip.destination?.country || '').trim().toLowerCase();

  useEffect(() => {
    const loadFlightsData = async () => {
      setLoading(true);
      try {
        const res = await fetchFlights(1, 50, '', '', '', cabinClass);
        const allFlights = res?.data?.flights || [];

        const destinationMatchedFlights = allFlights.filter((flight) => {
          const flightDestCity = (flight.destinationCity || '').trim().toLowerCase();
          const flightDestCountry = (flight.destinationCountry || '').trim().toLowerCase();

          const matchesCity = destCity && (flightDestCity.includes(destCity) || destCity.includes(flightDestCity));
          const matchesCountry = destCountry && (flightDestCountry.includes(destCountry) || destCountry.includes(flightDestCountry));

          return matchesCity || matchesCountry;
        });

        let filtered = destinationMatchedFlights;

        if (search.trim()) {
          const q = search.trim().toLowerCase();
          filtered = filtered.filter((f) =>
            f.airline?.toLowerCase().includes(q) ||
            f.flightNumber?.toLowerCase().includes(q) ||
            f.originCity?.toLowerCase().includes(q) ||
            f.aircraft?.toLowerCase().includes(q)
          );
        }

        setFlights(filtered);
      } catch {
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };
    loadFlightsData();
  }, [destCity, destCountry, search, cabinClass]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-cyan-400" />
            <span>Flights Bound for {trip.destination?.city || trip.destination?.country || 'Destination'}</span>
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Showing verified flights arriving in {trip.destination?.city ? `${trip.destination.city}, ` : ''}{trip.destination?.country || 'Destination'} only
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search airline or flight code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white focus:outline-none border border-slate-800 focus:border-cyan-500/50"
            />
          </div>

          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs text-slate-300 font-semibold border border-slate-800 focus:outline-none"
          >
            <option value="All">All Classes</option>
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business Class</option>
            <option value="First Class">First Class</option>
          </select>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs text-cyan-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Country Filter Active: Showing flights heading to <strong>{trip.destination?.city || trip.destination?.country}</strong>. Flights for other destinations are filtered out.
          </span>
        </div>
        <span className="font-bold text-white px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30">
          {flights.length} Available
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-slate-900/40 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : flights.length === 0 ? (
        <div className="p-12 text-center liquid-glass-card rounded-3xl border border-slate-800 space-y-3">
          <Plane className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-semibold text-white">No Flights Found for {trip.destination?.city || trip.destination?.country}</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Currently no scheduled commercial flights found matching {trip.destination?.city ? `${trip.destination.city}, ` : ''}{trip.destination?.country}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flights.map((flight) => {
            const isSelected = selectedFlightId === flight._id || trip.selectedFlight?._id === flight._id;
            const priceNum = parsePriceNumber(flight.price);

            return (
              <div
                key={flight._id}
                className={`relative rounded-3xl p-6 transition-all border ${
                  isSelected
                    ? 'bg-slate-900/95 border-cyan-400 shadow-xl shadow-cyan-500/10'
                    : 'liquid-glass-card border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-full border border-cyan-400/30">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> {flight.destinationCountry}
                  </span>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 overflow-hidden">
                    {flight.coverImage ? (
                      <img src={flight.coverImage} alt={flight.airline} className="w-full h-full object-cover" />
                    ) : (
                      <Plane className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{flight.airline}</h4>
                    <p className="text-xs text-slate-400 font-mono">Flight {flight.flightNumber} • {flight.aircraft}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{flight.originCity || 'Origin'}</p>
                      <p className="text-[10px] text-cyan-400 font-semibold">{flight.originAirport || 'DEP'}</p>
                      <p className="text-[10px] text-slate-400">{flight.departureTime}</p>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <span className="text-[10px] text-slate-400 font-medium">{flight.duration}</span>
                      <div className="w-20 h-0.5 bg-slate-700 my-1 relative flex items-center justify-center">
                        <Plane className="w-3 h-3 text-cyan-400 rotate-90" />
                      </div>
                      <span className="text-[9px] text-emerald-400 font-semibold">{flight.cabinClass}</span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{flight.destinationCity}</p>
                      <p className="text-[10px] text-cyan-400 font-semibold">{flight.destinationAirport || 'ARR'}</p>
                      <p className="text-[10px] text-slate-400">{flight.arrivalTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Fare per Person</p>
                    <p className="text-lg font-extrabold text-emerald-400">
                      ${priceNum} <span className="text-xs font-normal text-slate-400">{trip.currency || 'USD'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {flight.bookingUrl && (
                      <a
                        href={flight.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-colors"
                        title="Open Airline Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => onSelectFlight(isSelected ? null : flight._id)}
                      disabled={isSelecting}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Selected Plane
                        </>
                      ) : (
                        'Choose this Plane'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
