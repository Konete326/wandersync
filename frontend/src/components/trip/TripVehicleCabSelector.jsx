import { useState, useEffect } from 'react';
import { Car, Search, Fuel, Users, ShieldCheck, Check, Sparkles, Navigation, Clock, DollarSign, MapPin } from 'lucide-react';
import { fetchVehicles } from '@/services/vehicleService';

const parsePriceNumber = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = String(priceStr).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

export default function TripVehicleCabSelector({
  trip,
  onSelectVehicle,
  selectedVehicleId,
  isSelecting,
  onBookCab,
  selectedCab
}) {
  const [activeMode, setActiveMode] = useState('rental');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vehicleType, setVehicleType] = useState('All');

  const destinationCity = trip.destination?.city || '';
  const destinationCountry = trip.destination?.country || '';
  const duration = trip.durationDays || 1;

  const [pickupLocation, setPickupLocation] = useState(selectedCab?.pickupLocation || `${destinationCity} Airport / Central Station`);
  const [dropoffLocation, setDropoffLocation] = useState(selectedCab?.dropoffLocation || `${destinationCity} Downtown Hotel`);
  const [cabType, setCabType] = useState(selectedCab?.cabType || 'Standard Sedan');

  const cabPricing = {
    'Standard Sedan': 35,
    'Comfort SUV': 55,
    'Executive Black / VIP': 85,
    'Airport Shuttle Van': 65
  };

  useEffect(() => {
    const loadVehiclesData = async () => {
      setLoading(true);
      try {
        const res = await fetchVehicles(1, 50, vehicleType, '', '', '', '');
        const allVehicles = res?.data?.vehicles || [];
        const destCity = destinationCity.trim().toLowerCase();
        const destCountry = destinationCountry.trim().toLowerCase();

        const destinationMatchedVehicles = allVehicles.filter((v) => {
          const vCity = (v.city || '').trim().toLowerCase();
          const vCountry = (v.country || '').trim().toLowerCase();
          const matchesCity = destCity && (vCity.includes(destCity) || destCity.includes(vCity));
          const matchesCountry = destCountry && (vCountry.includes(destCountry) || destCountry.includes(vCountry));
          return matchesCity || matchesCountry;
        });

        let filtered = destinationMatchedVehicles;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          filtered = filtered.filter((v) =>
            v.name?.toLowerCase().includes(q) ||
            v.vehicleType?.toLowerCase().includes(q)
          );
        }

        setVehicles(filtered);
      } catch {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    loadVehiclesData();
  }, [destinationCity, destinationCountry, search, vehicleType]);

  const handleCabSubmit = (e) => {
    e.preventDefault();
    const fare = cabPricing[cabType] || 40;
    onBookCab({
      pickupLocation,
      dropoffLocation,
      cabType,
      estimatedFare: fare,
      bookedAt: new Date()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-400" />
            <span>Rent a Car or Book a Cab</span>
          </h3>
          <p className="text-xs text-slate-400">
            Choose between self-drive / chauffeured rental cars or instant city transfer cabs in {destinationCity}
          </p>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveMode('rental')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'rental'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rent a Car Fleet
          </button>
          <button
            onClick={() => setActiveMode('cab')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'cab'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Book a Cab / Taxi
          </button>
        </div>
      </div>

      {activeMode === 'rental' ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search car model..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white focus:outline-none border border-slate-800 focus:border-emerald-500/50"
              />
            </div>

            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs text-slate-300 font-semibold border border-slate-800 focus:outline-none"
            >
              <option value="All">All Vehicle Types</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Luxury">Luxury Car</option>
              <option value="Van">Van / Minibus</option>
              <option value="Convertible">Convertible</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-52 rounded-3xl bg-slate-900/40 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center liquid-glass-card rounded-3xl border border-slate-800 space-y-3">
              <Car className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-semibold text-white">No Vehicles Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No rental cars matched the filter. Try adjusting your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((car) => {
                const isSelected = selectedVehicleId === car._id || trip.selectedVehicle?._id === car._id;
                const dailyRate = parsePriceNumber(car.pricePerDay);
                const totalCost = dailyRate * duration;
                const isCityMatch = car.city?.toLowerCase() === destinationCity.toLowerCase();

                return (
                  <div
                    key={car._id}
                    className={`group relative rounded-3xl overflow-hidden transition-all border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900/95 border-emerald-400 shadow-2xl shadow-emerald-500/10'
                        : 'liquid-glass-card border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                      <img
                        src={car.coverImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-emerald-400 text-xs font-bold">
                        <span>{car.vehicleType || 'SUV'}</span>
                      </div>

                      {isCityMatch && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-400/30">
                            <Sparkles className="w-3 h-3 text-emerald-400" /> Destination Fleet
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-4 right-4">
                        <h4 className="text-base sm:text-lg font-bold text-white leading-tight">{car.name}</h4>
                        <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{car.city}, {car.country}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[10px] text-slate-400">Capacity</p>
                          <p className="text-xs font-bold text-white truncate">{car.capacity || '5 Seats'}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[10px] text-slate-400">Transmission</p>
                          <p className="text-xs font-bold text-white truncate">{car.transmission || 'Automatic'}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[10px] text-slate-400">Fuel / Type</p>
                          <p className="text-xs font-bold text-white truncate">{car.fuelType || 'Petrol'}</p>
                        </div>
                      </div>

                      {car.driverIncluded && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span className="font-semibold">Professional Driver & Fuel Options Available</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Rental for {duration} Days</p>
                          <p className="text-lg font-extrabold text-emerald-400">
                            ${totalCost.toLocaleString()} <span className="text-xs font-normal text-slate-400">(${dailyRate}/day)</span>
                          </p>
                        </div>

                        <button
                          onClick={() => onSelectVehicle(isSelected ? null : car._id)}
                          disabled={isSelecting}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Selected Rental Car
                            </>
                          ) : (
                            'Rent this Car'
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
      ) : (
        <div className="max-w-2xl mx-auto liquid-glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Book an On-Demand Cab / Airport Transfer</h4>
              <p className="text-xs text-slate-400">Instant direct ride reserved for your trip</p>
            </div>
          </div>

          <form onSubmit={handleCabSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. Airport Arrival Terminal / Central Station"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none border border-slate-800 focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Dropoff Destination
              </label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="e.g. Destination Hotel / Downtown Resort"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none border border-slate-800 focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Select Cab Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(cabPricing).map(([type, fare]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCabType(type)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      cabType === type
                        ? 'bg-emerald-500/20 border-emerald-400 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{type}</p>
                    <p className="text-xs font-extrabold text-emerald-400 mt-1">${fare} flat fare</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Estimated Cab Fare</p>
                <p className="text-xl font-extrabold text-emerald-400">${cabPricing[cabType] || 40}</p>
              </div>
              <button
                type="submit"
                disabled={isSelecting}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" /> Confirm Cab Booking
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
