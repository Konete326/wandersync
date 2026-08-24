import { MapPin, Globe, Eye, Trash2, Edit3, Navigation, Building } from 'lucide-react';

export default function DestinationCard({ item, onInspect, onEdit, onDelete }) {
  return (
    <div className="group rounded-2xl bg-[#121215] border border-border/80 hover:border-orange-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg shadow-black/40 hover:shadow-orange-950/20 font-sans">
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-zinc-900">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-black/25 to-transparent" />

        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow-sm">
            <Globe className="size-2.5 text-orange-400" />
            <span>{item.country}</span>
          </span>

          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <button
              onClick={() => onInspect(item)}
              className="p-1 rounded-lg hover:bg-orange-500 text-zinc-300 hover:text-zinc-950 transition-colors cursor-pointer"
              title="View full destination details"
            >
              <Eye className="size-3" />
            </button>
            <button
              onClick={() => onEdit(item)}
              className="p-1 rounded-lg hover:bg-orange-500 text-zinc-300 hover:text-zinc-950 transition-colors cursor-pointer"
              title="Edit destination"
            >
              <Edit3 className="size-3" />
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="p-1 rounded-lg hover:bg-rose-500 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Delete destination"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
          <span className="inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-0.5">
            {item.category || 'Landscape'}
          </span>
          <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
            {item.title}
          </h3>
        </div>
      </div>

      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3 text-orange-400 shrink-0" />
            <span className="truncate">{item.city}, {item.country}</span>
          </div>

          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {item.description || 'Verified curated travel destination catalog entry.'}
          </p>
        </div>

        <div className="pt-2.5 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Navigation className="size-3 text-orange-400" />
            <span>{item.touristPlaces?.length || 0} Spots</span>
          </div>

          <div className="flex items-center gap-1">
            <Building className="size-3 text-orange-400" />
            <span>
              {item.hotels?.length || 0} Hotels {item.hotels?.[0]?.pricePerNight ? `(${item.hotels[0].pricePerNight})` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
