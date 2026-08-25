import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Globe,
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Languages,
  Bus,
  Sparkles,
  Building,
  Star,
  Car,
  Plane,
  Luggage,
  Navigation,
  Utensils,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Fuel,
  Users,
  Images,
  Calculator,
  Plus,
  Bell
} from 'lucide-react';
import { fetchGalleryItemById } from '@/services/galleryService';
import { fetchHotels } from '@/services/hotelService';
import { fetchSpots } from '@/services/spotService';
import { fetchVehicles } from '@/services/vehicleService';
import { fetchFlights } from '@/services/flightService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import { getCachedData, setCachedData } from '@/utils/realtimeSync';

export default function DestinationExplorer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showModal, showToast } = useModal();

  const cacheKey = `dest_explorer_${id}`;
  const initialDest = getCachedData(cacheKey);

  const [loading, setLoading] = useState(!initialDest);
  const [destination, setDestination] = useState(initialDest || null);
  const [activeTab, setActiveTab] = useState('overview');

  const [hotels, setHotels] = useState([]);
  const [spots, setSpots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [flights, setFlights] = useState([]);
  const [countryInfo, setCountryInfo] = useState(null);

  const [selectedCity, setSelectedCity] = useState(initialDest?.city || '');

  const [tripDays, setTripDays] = useState(5);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedSpotIds, setSelectedSpotIds] = useState([]);
  const [dailyFoodBudget, setDailyFoodBudget] = useState(40);
  const [travelersCount, setTravelersCount] = useState(2);

  useEffect(() => {
    const loadDestinationData = async () => {
      if (!initialDest) setLoading(true);
      try {
        const res = await fetchGalleryItemById(id);
        if (res.data) {
          setDestination(res.data);
          setSelectedCity(res.data.city || '');
          setCachedData(cacheKey, res.data);
        } else {
          showToast('Destination details not found', 'error');
          navigate('/gallery');
        }
      } catch {
        if (!initialDest) {
          showToast('Failed to load destination details', 'error');
          navigate('/gallery');
        }
      } finally {
        setLoading(false);
      }
    };
    loadDestinationData();
  }, [id]);

  useEffect(() => {
    if (!destination?.country) return;

    const loadConnectedCatalog = async () => {
      try {
        const targetCity = selectedCity || destination.city || '';
        
        const [hotelsRes, spotsRes, vehiclesRes, flightsRes, countriesRes] = await Promise.allSettled([
          fetchHotels(1, 20, destination.country, targetCity),
          fetchSpots(1, 30, destination.country, targetCity),
          fetchVehicles(1, 20, '', destination.country, targetCity),
          fetchFlights(1, 20, '', destination.country, targetCity),
          fetchCountries(1, 50, '', destination.country)
        ]);

        if (hotelsRes.status === 'fulfilled' && hotelsRes.value.data?.hotels) {
          const liveHotels = hotelsRes.value.data.hotels;
          setHotels(liveHotels);
          if (liveHotels.length > 0 && !selectedHotel) {
            setSelectedHotel(liveHotels[0]);
          }
        }

        if (spotsRes.status === 'fulfilled' && spotsRes.value.data?.spots) {
          const liveSpots = spotsRes.value.data.spots;
          setSpots(liveSpots);
          if (liveSpots.length > 0 && selectedSpotIds.length === 0) {
            setSelectedSpotIds(liveSpots.slice(0, 3).map((s) => s._id));
          }
        }

        if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.data?.vehicles) {
          const liveVehicles = vehiclesRes.value.data.vehicles;
          setVehicles(liveVehicles);
          if (liveVehicles.length > 0 && !selectedVehicle) {
            setSelectedVehicle(liveVehicles[0]);
          }
        }

        if (flightsRes.status === 'fulfilled' && flightsRes.value.data?.flights) {
          const liveFlights = flightsRes.value.data.flights;
          setFlights(liveFlights);
          if (liveFlights.length > 0 && !selectedFlight) {
            setSelectedFlight(liveFlights[0]);
          }
        }

        if (countriesRes.status === 'fulfilled' && countriesRes.value.data?.countries) {
          const found = countriesRes.value.data.countries.find(
            (c) => c.name?.toLowerCase() === destination.country?.toLowerCase()
          );
          if (found) setCountryInfo(found);
        }
      } catch {
      }
    };

    loadConnectedCatalog();
  }, [destination, selectedCity]);

  const parseRate = (str, fallback = 0) => {
    if (!str) return fallback;
    if (typeof str === 'number') return str;
    const match = String(str).match(/[\d.]+/);
    return match ? parseFloat(match[0]) : fallback;
  };

  const calculatedExpenses = useMemo(() => {
    const nights = Math.max(1, tripDays - 1);
    
    const hotelNightly = selectedHotel ? parseRate(selectedHotel.pricePerNight, 150) : 0;
    const totalHotel = hotelNightly * nights;

    const vehicleDaily = selectedVehicle ? parseRate(selectedVehicle.pricePerDay, 70) : 0;
    const totalVehicle = vehicleDaily * tripDays;

    const flightSeatRate = selectedFlight ? parseRate(selectedFlight.price, 450) : 0;
    const totalFlight = flightSeatRate * travelersCount;

    const selectedSpotsList = spots.filter((s) => selectedSpotIds.includes(s._id));
    const totalTicketsPerPerson = selectedSpotsList.reduce((acc, spot) => {
      const price = parseRate(spot.ticketPrice, 0);
      return acc + price;
    }, 0);
    const totalTickets = totalTicketsPerPerson * travelersCount;

    const totalFood = dailyFoodBudget * tripDays * travelersCount;

    const grandTotal = totalHotel + totalVehicle + totalFlight + totalTickets + totalFood;

    return {
      nights,
      hotelNightly,
      totalHotel,
      vehicleDaily,
      totalVehicle,
      flightSeatRate,
      totalFlight,
      totalTickets,
      totalFood,
      grandTotal,
      selectedSpotsCount: selectedSpotIds.length
    };
  }, [tripDays, selectedHotel, selectedVehicle, selectedFlight, selectedSpotIds, spots, dailyFoodBudget, travelersCount]);

  const handleToggleSpotSelection = (spotId) => {
    setSelectedSpotIds((prev) =>
      prev.includes(spotId) ? prev.filter((id) => id !== spotId) : [...prev, spotId]
    );
  };

  const handleBookFlightModal = (flight) => {
    showModal({
      title: `Reserve Flight: ${flight.airline} (${flight.flightNumber})`,
      message: `Direct Route: ${flight.originAirport} (${flight.originCity}) ➔ ${flight.destinationAirport} (${flight.destinationCity}). Cabin Class: ${flight.cabinClass}. Ticket: ${flight.price}/seat for ${travelersCount} traveler(s). Would you like to confirm this flight reservation alert?`,
      type: 'info',
      onConfirm: () => {
        setSelectedFlight(flight);
        showToast(`Flight ${flight.flightNumber} seat reservation requested! Real-time alert dispatched.`, 'success');
      }
    });
  };

  const handlePlanWithCustomConfig = () => {
    const destParam = encodeURIComponent(`${selectedCity || destination.city || destination.title}, ${destination.country}`);
    const budgetParam = calculatedExpenses.grandTotal;
    navigate(`/create?destination=${destParam}&days=${tripDays}&budget=${budgetParam}&travelers=${travelersCount}`);
  };

  if (loading || !destination) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
        <Loader text="Loading destination catalog & live fleet telemetry..." />
      </div>
    );
  }

  const allPhotos = [
    destination.imageUrl,
    ...(destination.galleryImages || [])
  ].filter(Boolean);

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-[#fafafa] font-sans pb-20 select-none">
      
      <div className="border-b border-border/70 bg-[#121215]/90 backdrop-blur-xl sticky top-14 z-30 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
            <Link to="/gallery" className="hover:text-orange-400 flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3.5" />
              <span>Gallery</span>
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
            <span className="text-foreground font-semibold truncate">{destination.country}</span>
            <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
            <span className="text-orange-400 font-bold truncate">{selectedCity || destination.city}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('calculator')}
              className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="size-3.5" />
              <span>Live Expense Calculator (${calculatedExpenses.grandTotal.toLocaleString()})</span>
            </button>

            <GlowingButton
              onClick={handlePlanWithCustomConfig}
              size="sm"
              innerClassName="py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5 text-orange-400" />
              <span>Plan AI Trip</span>
            </GlowingButton>
          </div>
        </div>
      </div>

      
      <div className="relative h-72 sm:h-96 w-full overflow-hidden border-b border-border/80">
        <img
          src={destination.imageUrl}
          alt={destination.title}
          className="size-full object-cover object-center transform scale-105 filter brightness-75 transition-transform duration-700 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/50 to-transparent" />

        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">
                {destination.category || 'Featured Destination'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary/80 text-foreground border border-border flex items-center gap-1">
                <Globe className="size-3 text-cyan-400" />
                <span>{destination.country}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary/80 text-foreground border border-border flex items-center gap-1">
                <MapPin className="size-3 text-emerald-400" />
                <span>{selectedCity || destination.city}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-md font-['Instrument_Serif']">
              {destination.title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl line-clamp-2 leading-relaxed">
              {destination.description}
            </p>
          </div>

          
          <div className="flex items-center gap-2 bg-[#121215]/80 backdrop-blur-md p-2.5 rounded-xl border border-border shrink-0 shadow-lg">
            <div className="px-2.5 py-1 text-center border-r border-border/70">
              <span className="text-[10px] text-muted-foreground block">Best Season</span>
              <span className="text-xs font-bold text-foreground">{destination.bestTimeToVisit || 'Oct - Apr'}</span>
            </div>
            <div className="px-2.5 py-1 text-center border-r border-border/70">
              <span className="text-[10px] text-muted-foreground block">Daily Avg</span>
              <span className="text-xs font-bold text-orange-400">{destination.estimatedBudget || '$150/day'}</span>
            </div>
            <div className="px-2.5 py-1 text-center">
              <span className="text-[10px] text-muted-foreground block">Ideal Stay</span>
              <span className="text-xs font-bold text-foreground">{destination.idealDuration || '5-7 Days'}</span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        
        {countryInfo?.popularCities?.length > 0 && (
          <div className="p-3 rounded-xl bg-[#121215] border border-border flex items-center gap-2 overflow-x-auto no-scrollbar shadow-sm">
            <span className="text-xs font-bold text-muted-foreground shrink-0 flex items-center gap-1">
              <MapPin className="size-3.5 text-orange-400" /> Explore Region:
            </span>
            <button
              onClick={() => setSelectedCity(destination.city)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                selectedCity === destination.city
                  ? 'bg-orange-500 text-zinc-950 shadow-sm shadow-orange-500/20'
                  : 'bg-secondary/40 text-foreground hover:bg-secondary border border-border'
              }`}
            >
              {destination.city} (Primary)
            </button>
            {countryInfo.popularCities.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedCity(c.name)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedCity === c.name
                    ? 'bg-orange-500 text-zinc-950 shadow-sm shadow-orange-500/20'
                    : 'bg-secondary/40 text-foreground hover:bg-secondary border border-border'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        
        <div className="flex items-center gap-2 border-b border-border/80 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: '1. Overview & Photos', icon: Images, count: allPhotos.length },
            { id: 'hotels', label: '2. Hotels & Stays', icon: Building, count: hotels.length },
            { id: 'spots', label: '3. Tourist Attractions', icon: Navigation, count: spots.length },
            { id: 'vehicles', label: '4. Rental Vehicles', icon: Car, count: vehicles.length },
            { id: 'flights', label: '5. Flights & Airlines', icon: Plane, count: flights.length },
            { id: 'calculator', label: '6. Trip Cost Wizard', icon: Calculator, highlight: true }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? tab.highlight
                      ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20'
                      : 'bg-orange-500/15 text-orange-400 border border-orange-500/40'
                    : 'bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border/60'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-orange-500/30 text-orange-200' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Images className="size-3.5 text-orange-400" />
                <span>Scenic Landscape & Architecture Gallery ({allPhotos.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {allPhotos.map((photoUrl, idx) => (
                  <div key={idx} className="relative h-32 rounded-xl overflow-hidden border border-border group cursor-pointer shadow-sm">
                    <img src={photoUrl} alt={`Landscape ${idx + 1}`} className="size-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#121215] border border-border space-y-3 shadow-md">
                <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                  <Lightbulb className="size-4 text-orange-400" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Traveler Essentials</h3>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="size-3 text-orange-400" /> Local Currency:</span>
                    <span className="font-bold text-foreground">{destination.currency || 'USD ($)'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Languages className="size-3 text-orange-400" /> Primary Language:</span>
                    <span className="font-bold text-foreground">{destination.language || 'English'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Bus className="size-3 text-orange-400" /> Transit Systems:</span>
                    <span className="font-bold text-foreground truncate max-w-[140px]">{destination.transportation || 'Metro, Taxi & Trains'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="size-3 text-orange-400" /> Best Months:</span>
                    <span className="font-bold text-foreground">{destination.bestTimeToVisit || 'Oct - Apr'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121215] border border-border space-y-3 shadow-md">
                <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                  <Utensils className="size-4 text-orange-400" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Local Food & Dining</h3>
                </div>
                {destination.localFoods?.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {destination.localFoods.slice(0, 3).map((food, i) => (
                      <div key={i} className="p-2 rounded-lg bg-secondary/40 border border-border flex items-center justify-between">
                        <div>
                          <span className="font-bold text-foreground block">{food.name}</span>
                          <span className="text-[10px] text-muted-foreground">{food.description || 'Traditional delicacy'}</span>
                        </div>
                        <span className="text-xs font-bold text-orange-400 shrink-0 ml-2">{food.price || '$15'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Authentic street food, regional delicacies, and artisan dining available throughout the region.</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#121215] border border-border space-y-3 shadow-md">
                <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                  <ShieldCheck className="size-4 text-orange-400" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Pro Traveler Tips</h3>
                </div>
                {destination.travelTips?.length > 0 ? (
                  <div className="space-y-1.5 text-xs">
                    {destination.travelTips.slice(0, 4).map((tip, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-zinc-300">
                        <CheckCircle2 className="size-3.5 text-orange-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{tip}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Carry regional transport passes, reserve temple slots in advance, and carry light cash for traditional stalls.</p>
                )}
              </div>
            </div>
          </div>
        )}

        
        {activeTab === 'hotels' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Building className="size-4 text-orange-400" />
                  <span>Verified Hotels & Stays in {selectedCity || destination.city} ({hotels.length})</span>
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Select a hotel to automatically sync nightly rates into your live trip expense calculator
                </p>
              </div>
            </div>

            {hotels.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#121215] border border-border text-center space-y-2">
                <Building className="size-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">No specific hotels listed for this area yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotels.map((hotel) => {
                  const isSelected = selectedHotel?._id === hotel._id;
                  return (
                    <div
                      key={hotel._id}
                      className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-md ${
                        isSelected
                          ? 'border-orange-500 bg-[#151210] ring-1 ring-orange-500/50'
                          : 'border-border bg-[#121215] hover:border-orange-500/40'
                      }`}
                    >
                      <div>
                        <div className="relative h-44 w-full overflow-hidden bg-secondary/30">
                          <img
                            src={hotel.coverImage || hotel.images?.[0] || destination.imageUrl}
                            alt={hotel.name}
                            className="size-full object-cover"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-orange-400 text-[10px] font-bold border border-orange-500/30">
                            {hotel.priceRange || '$$$'} Tier
                          </div>
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/30">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span>{hotel.rating || 4.8}</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-foreground leading-tight">{hotel.name}</h3>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="size-2.5 text-emerald-400" />
                                <span>{hotel.area || hotel.city}, {hotel.country}</span>
                              </p>
                            </div>
                            <span className="text-xs font-extrabold text-orange-400 shrink-0 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                              {hotel.pricePerNight || '$180/night'}
                            </span>
                          </div>

                          {hotel.amenities?.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {hotel.amenities.slice(0, 3).map((a, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-secondary/60 text-[10px] text-muted-foreground border border-border">
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 pt-0 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedHotel(hotel);
                            showToast(`${hotel.name} selected for trip expense calculation`, 'success');
                          }}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-orange-500 text-zinc-950 font-extrabold'
                              : 'bg-secondary/60 hover:bg-secondary text-foreground border border-border'
                          }`}
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>{isSelected ? 'Selected in Wizard' : 'Select Stay'}</span>
                        </button>

                        {hotel.bookingUrl && (
                          <a
                            href={hotel.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border"
                            title="Official Booking Website"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        
        {activeTab === 'spots' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Navigation className="size-4 text-orange-400" />
                  <span>Must-Visit Landmarks & Tourist Spots in {selectedCity || destination.city} ({spots.length})</span>
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Check the spots you want to visit to include admission tickets in your expense estimation
                </p>
              </div>
            </div>

            {spots.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#121215] border border-border text-center space-y-2">
                <Navigation className="size-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">No specific attractions logged for this area yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {spots.map((spot) => {
                  const isChecked = selectedSpotIds.includes(spot._id);
                  return (
                    <div
                      key={spot._id}
                      onClick={() => handleToggleSpotSelection(spot._id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-md ${
                        isChecked
                          ? 'border-orange-500 bg-[#151210] ring-1 ring-orange-500/50'
                          : 'border-border bg-[#121215] hover:border-orange-500/40'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="relative h-36 w-full rounded-xl overflow-hidden bg-secondary/30">
                          <img
                            src={spot.coverImage || spot.images?.[0] || destination.imageUrl}
                            alt={spot.name}
                            className="size-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-orange-400 text-[10px] font-bold border border-orange-500/30">
                            {spot.category || 'Landmark'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-foreground leading-tight">{spot.name}</h3>
                            <span className="text-xs font-bold text-orange-400 shrink-0">
                              {spot.ticketPrice || 'Free'}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {spot.description || 'Famous regional landmark with scenic views.'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/70 flex items-center justify-between mt-3 text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3 text-orange-400" />
                          <span>{spot.duration || '2-3 hours'}</span>
                        </span>

                        <span className={`font-bold flex items-center gap-1 ${
                          isChecked ? 'text-orange-400' : 'text-muted-foreground'
                        }`}>
                          <CheckCircle2 className="size-3.5" />
                          <span>{isChecked ? 'Added to Budget' : 'Add to Plan'}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        
        {activeTab === 'vehicles' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Car className="size-4 text-orange-400" />
                  <span>Available Transport Fleet & Rentals in {selectedCity || destination.country} ({vehicles.length})</span>
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Select a vehicle model to sync car rental rates into your live trip calculation
                </p>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#121215] border border-border text-center space-y-2">
                <Car className="size-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">No specific vehicles available in this region yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((veh) => {
                  const isSelected = selectedVehicle?._id === veh._id;
                  return (
                    <div
                      key={veh._id}
                      className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-md ${
                        isSelected
                          ? 'border-orange-500 bg-[#151210] ring-1 ring-orange-500/50'
                          : 'border-border bg-[#121215] hover:border-orange-500/40'
                      }`}
                    >
                      <div>
                        <div className="relative h-40 w-full overflow-hidden bg-secondary/30">
                          <img
                            src={veh.coverImage || veh.images?.[0] || destination.imageUrl}
                            alt={veh.name}
                            className="size-full object-cover"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-orange-400 text-[10px] font-bold border border-orange-500/30">
                            {veh.vehicleType || 'SUV'}
                          </span>
                          {veh.driverIncluded && (
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-sm text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                              Chauffeur Option
                            </span>
                          )}
                        </div>

                        <div className="p-4 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-foreground leading-tight">{veh.name}</h3>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Users className="size-3 text-cyan-400" />
                                <span>{veh.capacity || '5 Passengers'} • {veh.transmission || 'Automatic'}</span>
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-extrabold text-orange-400 block">{veh.pricePerDay || '$95/day'}</span>
                              <span className="text-[10px] text-muted-foreground">{veh.pricePerHour || '$20/hr'}</span>
                            </div>
                          </div>

                          {veh.features?.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {veh.features.slice(0, 3).map((f, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-secondary/60 text-[10px] text-muted-foreground border border-border">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          onClick={() => {
                            setSelectedVehicle(veh);
                            showToast(`${veh.name} selected for vehicle rental calculation`, 'success');
                          }}
                          className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-orange-500 text-zinc-950 font-extrabold'
                              : 'bg-secondary/60 hover:bg-secondary text-foreground border border-border'
                          }`}
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>{isSelected ? 'Selected in Wizard' : 'Select Rental Vehicle'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        
        {activeTab === 'flights' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Plane className="size-4 text-orange-400" />
                  <span>Scheduled Flights to {selectedCity || destination.country} ({flights.length})</span>
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Compare airline schedules, cabin classes, and live seat ticket prices
                </p>
              </div>
            </div>

            {flights.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#121215] border border-border text-center space-y-2">
                <Plane className="size-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">No specific flight routes scheduled for this destination yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flights.map((flt) => {
                  const isSelected = selectedFlight?._id === flt._id;
                  return (
                    <div
                      key={flt._id}
                      className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-md ${
                        isSelected
                          ? 'border-orange-500 bg-[#151210] ring-1 ring-orange-500/50'
                          : 'border-border bg-[#121215] hover:border-orange-500/40'
                      }`}
                    >
                      <div>
                        <div className="relative h-40 w-full overflow-hidden bg-secondary/30">
                          <img
                            src={flt.coverImage || flt.images?.[0] || destination.imageUrl}
                            alt={flt.airline}
                            className="size-full object-cover"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-orange-400 text-[10px] font-bold border border-orange-500/30">
                            {flt.flightNumber}
                          </div>
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-foreground text-[10px] font-bold border border-white/10">
                            {flt.cabinClass || 'Economy'}
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-foreground leading-tight">{flt.airline}</h3>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{flt.aircraft}</p>
                            </div>
                            <span className="text-xs font-extrabold text-orange-400 shrink-0 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                              {flt.price}
                            </span>
                          </div>

                          
                          <div className="p-3 rounded-xl bg-secondary/30 border border-border flex items-center justify-between text-xs">
                            <div className="space-y-0.5 text-left">
                              <span className="text-base font-extrabold text-foreground font-mono">{flt.originAirport}</span>
                              <span className="text-[10px] text-muted-foreground block truncate max-w-[80px]">{flt.originCity}</span>
                              <span className="text-[9px] text-orange-400 font-medium block">{flt.departureTime}</span>
                            </div>

                            <div className="flex flex-col items-center px-2">
                              <span className="text-[9px] text-muted-foreground font-mono">{flt.duration}</span>
                              <div className="w-16 h-0.5 bg-border relative my-1 flex items-center justify-center">
                                <Plane className="size-2.5 text-orange-400 absolute" />
                              </div>
                              <span className="text-[9px] text-emerald-400 font-bold">{flt.status}</span>
                            </div>

                            <div className="space-y-0.5 text-right">
                              <span className="text-base font-extrabold text-foreground font-mono">{flt.destinationAirport}</span>
                              <span className="text-[10px] text-muted-foreground block truncate max-w-[80px]">{flt.destinationCity}</span>
                              <span className="text-[9px] text-orange-400 font-medium block">{flt.arrivalTime}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                            <Luggage className="size-3 text-orange-400 shrink-0" />
                            <span className="truncate">{flt.baggage}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFlight(flt);
                            showToast(`${flt.airline} (${flt.flightNumber}) synced to trip calculation`, 'success');
                          }}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-orange-500 text-zinc-950 font-extrabold'
                              : 'bg-secondary/60 hover:bg-secondary text-foreground border border-border'
                          }`}
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>{isSelected ? 'Selected in Wizard' : 'Select Flight'}</span>
                        </button>

                        <button
                          onClick={() => handleBookFlightModal(flt)}
                          className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Instant Flight Inquiry"
                        >
                          <Bell className="size-3.5" />
                          <span>Book Seat</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        
        {activeTab === 'calculator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-[#121215] border border-orange-500/30 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Calculator className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Interactive Travel Expense Wizard</h2>
                    <p className="text-xs text-muted-foreground">Real-time budget simulation for {selectedCity || destination.city}, {destination.country}</p>
                  </div>
                </div>

                <GlowingButton
                  onClick={handlePlanWithCustomConfig}
                  size="sm"
                  innerClassName="py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <Sparkles className="size-3.5 text-orange-400" />
                  <span>Generate AI Itinerary with this Budget</span>
                </GlowingButton>
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300">Trip Duration</label>
                    <span className="text-xs font-extrabold text-orange-400">{tripDays} Days ({calculatedExpenses.nights} Nights)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={tripDays}
                    onChange={(e) => setTripDays(parseInt(e.target.value, 10))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-muted-foreground block">Slide to adjust travel days & stay nights</span>
                </div>

                
                <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300">Number of Travelers</label>
                    <span className="text-xs font-extrabold text-orange-400">{travelersCount} Person(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 4, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTravelersCount(num)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          travelersCount === num
                            ? 'bg-orange-500 text-zinc-950 font-extrabold'
                            : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                        }`}
                      >
                        {num} {num === 1 ? 'Solo' : 'Travelers'}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Affects flights, tickets & dining calculation</span>
                </div>

                
                <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300">Daily Dining & Food / Person</label>
                    <span className="text-xs font-extrabold text-orange-400">${dailyFoodBudget}/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { label: 'Budget ($25)', val: 25 },
                      { label: 'Standard ($40)', val: 40 },
                      { label: 'Luxury ($80)', val: 80 }
                    ].map((tier) => (
                      <button
                        key={tier.val}
                        type="button"
                        onClick={() => setDailyFoodBudget(tier.val)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          dailyFoodBudget === tier.val
                            ? 'bg-orange-500 text-zinc-950 font-extrabold'
                            : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Includes street food, cafes & dining</span>
                </div>
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Building className="size-3.5 text-orange-400" /> Hotel / Stay
                    </span>
                    <button
                      onClick={() => setActiveTab('hotels')}
                      className="text-[11px] font-bold text-orange-400 hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                  {selectedHotel ? (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="font-bold text-foreground block truncate max-w-[120px]">{selectedHotel.name}</span>
                        <span className="text-[10px] text-muted-foreground">{selectedHotel.priceRange || '$$$'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-orange-400">${calculatedExpenses.hotelNightly} × {calculatedExpenses.nights}n</span>
                        <span className="text-xs font-bold text-foreground block">${calculatedExpenses.totalHotel} USD</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Standard 3-4 star estimate (${150 * calculatedExpenses.nights} USD)</p>
                  )}
                </div>

                
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Car className="size-3.5 text-orange-400" /> Rental Vehicle
                    </span>
                    <button
                      onClick={() => setActiveTab('vehicles')}
                      className="text-[11px] font-bold text-orange-400 hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                  {selectedVehicle ? (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="font-bold text-foreground block truncate max-w-[120px]">{selectedVehicle.name}</span>
                        <span className="text-[10px] text-muted-foreground">{selectedVehicle.vehicleType}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-orange-400">${calculatedExpenses.vehicleDaily} × {tripDays}d</span>
                        <span className="text-xs font-bold text-foreground block">${calculatedExpenses.totalVehicle} USD</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Public transit / taxi (${40 * tripDays} USD)</p>
                  )}
                </div>

                
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Plane className="size-3.5 text-orange-400" /> Flight Route
                    </span>
                    <button
                      onClick={() => setActiveTab('flights')}
                      className="text-[11px] font-bold text-orange-400 hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                  {selectedFlight ? (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="font-bold text-foreground block truncate max-w-[120px]">{selectedFlight.airline}</span>
                        <span className="text-[10px] text-muted-foreground">{selectedFlight.flightNumber} • {selectedFlight.originAirport}➔{selectedFlight.destinationAirport}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-orange-400">${calculatedExpenses.flightSeatRate} × {travelersCount} ppl</span>
                        <span className="text-xs font-bold text-foreground block">${calculatedExpenses.totalFlight} USD</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Standard international flight (${450 * travelersCount} USD)</p>
                  )}
                </div>
              </div>

              
              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-950/30 via-[#161412] to-secondary/60 border border-orange-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Estimated Total Journey Expense</h3>
                    <p className="text-[11px] text-muted-foreground">Includes lodging, vehicle transit, airline tickets, attraction passes, and meals</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-extrabold text-orange-400 font-['Instrument_Serif']">
                      ${calculatedExpenses.grandTotal.toLocaleString()} USD
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      ~${Math.round(calculatedExpenses.grandTotal / (travelersCount || 1)).toLocaleString()} / traveler
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-border/70">
                    <span className="text-[10px] text-muted-foreground block">1. Stays & Lodging</span>
                    <span className="text-sm font-bold text-foreground">${calculatedExpenses.totalHotel}</span>
                    <span className="text-[9px] text-muted-foreground block">{calculatedExpenses.nights} nights</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-border/70">
                    <span className="text-[10px] text-muted-foreground block">2. Fleet & Transit</span>
                    <span className="text-sm font-bold text-foreground">${calculatedExpenses.totalVehicle}</span>
                    <span className="text-[9px] text-muted-foreground block">{tripDays} rental days</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-border/70">
                    <span className="text-[10px] text-muted-foreground block">3. Flight Seats</span>
                    <span className="text-sm font-bold text-foreground">${calculatedExpenses.totalFlight}</span>
                    <span className="text-[9px] text-muted-foreground block">{travelersCount} traveler(s)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-border/70">
                    <span className="text-[10px] text-muted-foreground block">4. Sightseeing Tickets</span>
                    <span className="text-sm font-bold text-foreground">${calculatedExpenses.totalTickets}</span>
                    <span className="text-[9px] text-muted-foreground block">{calculatedExpenses.selectedSpotsCount} spots</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-border/70">
                    <span className="text-[10px] text-muted-foreground block">5. Dining & Living</span>
                    <span className="text-sm font-bold text-foreground">${calculatedExpenses.totalFood}</span>
                    <span className="text-[9px] text-muted-foreground block">${dailyFoodBudget}/d × {travelersCount}ppl</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-orange-400 shrink-0" />
                    <span>Instant Sync: Ready to generate a day-by-day itinerary incorporating these exact flights, accommodations, and attractions.</span>
                  </p>
                  <GlowingButton
                    onClick={handlePlanWithCustomConfig}
                    size="md"
                    innerClassName="py-2 px-5 text-xs font-extrabold flex items-center gap-2 shrink-0"
                  >
                    <Sparkles className="size-4 text-orange-400" />
                    <span>Create Itinerary with this Configuration</span>
                  </GlowingButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
