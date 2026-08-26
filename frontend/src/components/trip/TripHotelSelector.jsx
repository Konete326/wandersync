import { useState, useEffect } from 'react';
import { Building, Search, Star, MapPin, Check, ExternalLink, Sparkles, Wifi, Coffee, Phone } from 'lucide-react';
import { fetchHotels } from '@/services/hotelService';

const parsePriceNumber = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = String(priceStr).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

export default function TripHotelSelector({ trip, onSelectHotel, selectedHotelId, isSelecting }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priceTier, setPriceTier] = useState('All');

  const destinationCity = trip.destination?.city || '';
  const destinationCountry = trip.destination?.country || '';
  const duration = trip.durationDays || 1;

  useEffect(() => {
    const loadHotelsData = async () => {
      setLoading(true);
      try {
        const res = await fetchHotels(1, 50, '', '', priceTier, '');
        const allHotels = res?.data?.hotels || [];
        const destCity = destinationCity.trim().toLowerCase();
        const destCountry = destinationCountry.trim().toLowerCase();

        const destinationMatchedHotels = allHotels.filter((hotel) => {
          const hotelCity = (hotel.city || '').trim().toLowerCase();
          const hotelCountry = (hotel.country || '').trim().toLowerCase();
          const matchesCity = destCity && (hotelCity.includes(destCity) || destCity.includes(hotelCity));
          const matchesCountry = destCountry && (hotelCountry.includes(destCountry) || destCountry.includes(hotelCountry));
          return matchesCity || matchesCountry;
        });

        let filtered = destinationMatchedHotels;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          filtered = filtered.filter((h) =>
            h.name?.toLowerCase().includes(q) ||
            h.address?.toLowerCase().includes(q) ||
            h.amenities?.some((a) => a.toLowerCase().includes(q))
          );
        }

        setHotels(filtered);
      } catch {
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };
    loadHotelsData();
  }, [destinationCity, destinationCountry, search, priceTier]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            <span>Choose Hotel & Accommodations</span>
          </h3>
          <p className="text-xs text-slate-400">
            Select a verified hotel for your {duration}-night stay in {destinationCity}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hotel name..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white focus:outline-none border border-slate-800 focus:border-amber-500/50"
            />
          </div>

          <select
            value={priceTier}
            onChange={(e) => setPriceTier(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs text-slate-300 font-semibold border border-slate-800 focus:outline-none"
          >
            <option value="All">All Price Tiers</option>
            <option value="$">Budget ($)</option>
            <option value="$$">Moderate ($$)</option>
            <option value="$$$">Luxury ($$$)</option>
            <option value="$$$$">Ultra Luxury ($$$$)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 rounded-3xl bg-slate-900/40 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="p-12 text-center liquid-glass-card rounded-3xl border border-slate-800 space-y-3">
          <Building className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-semibold text-white">No Hotels Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hotels found for the current search filter. Try clearing filters to view all available stays.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map((hotel) => {
            const isSelected = selectedHotelId === hotel._id || trip.selectedHotel?._id === hotel._id;
            const nightlyPrice = parsePriceNumber(hotel.pricePerNight);
            const totalCost = nightlyPrice * duration;
            const isCityMatch = hotel.city?.toLowerCase() === destinationCity.toLowerCase();

            return (
              <div
                key={hotel._id}
                className={`group relative rounded-3xl overflow-hidden transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900/95 border-amber-400 shadow-2xl shadow-amber-500/10'
                    : 'liquid-glass-card border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={hotel.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{hotel.rating || 4.8}</span>
                  </div>

                  {isCityMatch && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/30">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Destination City
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 right-4">
                    <h4 className="text-base sm:text-lg font-bold text-white leading-tight">{hotel.name}</h4>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{hotel.address || `${hotel.city}, ${hotel.country}`}</span>
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  {hotel.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {hotel.amenities.slice(0, 4).map((amenity, i) => (
                        <span key={i} className="text-[10px] font-medium text-slate-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 4 && (
                        <span className="text-[10px] text-slate-500 px-1 py-1">
                          +{hotel.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total Stay ({duration} Nights)</p>
                      <p className="text-lg font-extrabold text-amber-400">
                        ${totalCost.toLocaleString()} <span className="text-xs font-normal text-slate-400">(${nightlyPrice}/night)</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {hotel.bookingUrl && (
                        <a
                          href={hotel.bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-colors"
                          title="Hotel Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => onSelectHotel(isSelected ? null : hotel._id)}
                        disabled={isSelecting}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Selected Hotel
                          </>
                        ) : (
                          'Choose this Hotel'
                        )}
                      </button>
                    </div>
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
