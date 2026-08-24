import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Download, Compass, Clock } from 'lucide-react';
import { getSharedTripDetails } from '../services/tripService';
import { exportItineraryToPdf } from '../services/pdfService';
import Loader from '../components/common/Loader';

const SharedTrip = () => {
  const { shareSlug } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    const loadSharedTrip = async () => {
      try {
        const res = await getSharedTripDetails(shareSlug);
        setTrip(res.data);
      } catch (error) {
        console.error('Shared trip error', error);
      } finally {
        setLoading(false);
      }
    };
    loadSharedTrip();
  }, [shareSlug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader text="Retrieving shared travel itinerary..." />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Itinerary Not Found</h2>
        <p className="text-sm text-slate-400">This itinerary might be private or the link is invalid.</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-cyan-500 text-white rounded-xl font-medium text-sm">
          Return to WanderSync
        </Link>
      </div>
    );
  }

  const currentDayData = trip.days?.find((d) => d.dayNumber === selectedDay) || trip.days?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase mb-2">
            Shared Itinerary • {trip.durationDays} Days
          </div>
          <h1 className="text-3xl font-extrabold text-white">{trip.title}</h1>
          <p className="text-slate-300 text-sm mt-1">{trip.overview}</p>
        </div>

        <button
          onClick={() => exportItineraryToPdf(trip)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {trip.days?.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => setSelectedDay(day.dayNumber)}
            className={`px-5 py-3 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all cursor-pointer ${
              selectedDay === day.dayNumber
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'liquid-glass text-slate-300 hover:text-white border-slate-800'
            } border`}
          >
            Day {day.dayNumber}
          </button>
        ))}
      </div>

      {currentDayData && (
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
            Day {currentDayData.dayNumber}: {currentDayData.title}
          </h2>

          <div className="space-y-4 pt-2">
            {currentDayData.activities?.map((act, idx) => (
              <div key={idx} className="p-4 rounded-2xl liquid-glass border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-400">{act.timeSlot}</span>
                  <span className="text-emerald-400 font-semibold">${act.estimatedCost || 0}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{act.title}</h3>
                <p className="text-xs text-slate-300">{act.description}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{act.locationName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedTrip;
