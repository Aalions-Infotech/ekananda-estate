import { Link } from "react-router-dom";
import { Clock, MapPin, X } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { formatPropertyPrice, formatArea } from "@/lib/propertyDisplay";

interface Props {
  excludeId?: string;
  className?: string;
  title?: string;
}

const RecentlyViewed = ({ excludeId, className = "", title = "Recently Viewed" }: Props) => {
  const { items, clear } = useRecentlyViewed(excludeId);

  if (!items.length) return null;

  return (
    <section className={`py-10 bg-surface ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <h2 className="text-xl sm:text-2xl font-display font-bold">{title}</h2>
          </div>
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {items.map(p => (
            <Link
              key={p.id}
              to={`/property/${p.id}`}
              className="snap-start flex-shrink-0 w-56 bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all"
            >
              <img
                src={p.image || "/placeholder.svg"}
                alt={p.title}
                loading="lazy"
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <p className="font-semibold text-sm line-clamp-1">{p.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 line-clamp-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {[p.locality, p.city].filter(Boolean).join(", ")}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-display font-bold text-accent">
                    {p.price ? formatPropertyPrice(p.price, p.listing_type === "rent" ? "monthly" : "total") : "Price on request"}
                  </span>
                  {p.area ? (
                    <span className="text-[11px] text-muted-foreground">{formatArea(p.area, p.area_unit)}</span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
