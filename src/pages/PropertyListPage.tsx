import { useState, useEffect } from "react";
import { Grid3X3, List, SlidersHorizontal, MessageSquare, Map as MapIcon, X } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import FilterSidebar, { FilterState } from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import PropertiesMapView from "@/components/PropertiesMapView";
import { CITY_COORDS, getPropertyCoords, haversineKm, geocodeNominatim } from "@/lib/geo";
import { formatArea, formatPropertyPrice, getPricePerSqft, shouldShowBedsBaths } from "@/lib/propertyDisplay";
import { MapPin, BedDouble, Bath, Maximize2, Heart, Shield, Zap, Phone, Eye, Star } from "lucide-react";
import { lookupPincode } from "@/lib/lucknowPincodes";

interface PropertyListPageProps {
  type: "buy" | "rent" | "commercial" | "pg";
  title: string;
  subtitle: string;
}

const LivePropertyCard = ({ property, view = "grid" }: { property: any; view?: "grid" | "list" }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const mainImage = property.images?.[0] || "/placeholder.svg";
  const showBedsBaths = shouldShowBedsBaths(property.property_type);
  const pricePerSqft = getPricePerSqft(property);

  if (view === "list") {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-all">
        <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
          <Link to={`/property/${property.id}`} className="block w-full h-full" aria-label={`View ${property.title}`}>
            <img src={mainImage} alt={property.title} className="w-full h-full object-cover" />
          </Link>
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {property.is_featured && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground">Featured</span>}
            {property.is_new && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">New</span>}
            {property.is_verified && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-0.5">
                <Shield className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <Link to={`/property/${property.id}`} className="font-display font-semibold text-base hover:text-accent transition-colors line-clamp-1">{property.title}</Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <MapPin className="w-3.5 h-3.5" />{property.locality}, {property.city}
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground flex-wrap">
              {showBedsBaths && property.bedrooms && <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" />{property.bedrooms} Beds</span>}
              {showBedsBaths && property.bathrooms && <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{property.bathrooms} Baths</span>}
              {property.area && <span className="flex items-center gap-1"><Maximize2 className="w-4 h-4" />{formatArea(property.area, property.area_unit || "sq.ft")}</span>}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border flex-wrap">
            <div>
              <p className="text-xl font-display font-bold text-accent">{formatPropertyPrice(property.price, property.price_unit)}</p>
              {pricePerSqft > 0 && <p className="text-xs text-muted-foreground">₹{pricePerSqft.toLocaleString("en-IN")}/sq.ft</p>}
            </div>
            <Link to={`/property/${property.id}`} className="px-3 py-1.5 rounded-lg btn-gold text-sm flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> View
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden group hover:shadow-md transition-all">
      <div className="relative h-52 overflow-hidden">
        <Link to={`/property/${property.id}`} className="block w-full h-full" aria-label={`View ${property.title}`}>
          <img src={mainImage} alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </Link>
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {property.is_featured && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground">Featured</span>}
          {property.is_new && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">New</span>}
          {property.is_verified && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-0.5">
              <Shield className="w-2.5 h-2.5" /> Verified
            </span>
          )}
        </div>
        <button onClick={() => setWishlisted(!wishlisted)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/90 flex items-center justify-center shadow transition-transform hover:scale-110">
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-card/90 text-foreground font-medium">{property.furnishing || "Unfurnished"}</span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xl font-display font-bold text-accent mb-1">{formatPropertyPrice(property.price, property.price_unit)}</p>
        {pricePerSqft > 0 && <span className="text-xs text-muted-foreground">₹{pricePerSqft.toLocaleString("en-IN")}/sqft</span>}
        <Link to={`/property/${property.id}`} className="font-display font-semibold text-sm mb-1 hover:text-accent transition-colors line-clamp-2 block mt-1">{property.title}</Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />{property.locality}, {property.city}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 pb-3 border-b border-border">
          {showBedsBaths && property.bedrooms && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{property.bedrooms} Beds</span>}
          {showBedsBaths && property.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms} Baths</span>}
          {property.area && <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" />{formatArea(property.area, property.area_unit || "sq.ft")}</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{property.property_type}</span>
          <Link to={`/property/${property.id}`} className="px-3 py-1.5 rounded-lg btn-gold text-xs flex items-center gap-1">View Details</Link>
        </div>
      </div>
    </div>
  );
};

const PropertyListPage = ({ type, title, subtitle }: PropertyListPageProps) => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<"grid" | "list" | "map">("grid");
  const [filters, setFilters] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState("relevance");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [liveListings, setLiveListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState<number>(0);
  const [radiusCenter, setRadiusCenter] = useState<[number, number] | null>(null);
  const [radiusLabel, setRadiusLabel] = useState<string>("");
  const [radiusInput, setRadiusInput] = useState<string>("");

  useEffect(() => {
    fetchListings();
  }, [type, searchParams, filters, sortBy]);

  // When a Lucknow PIN is present in the URL, auto-center the radius search
  // on its centroid so the map view + distance chip reflect the PIN area.
  useEffect(() => {
    const pin = searchParams.get("pincode");
    if (pin) {
      const hit = lookupPincode(pin);
      if (hit) {
        setRadiusCenter(hit.coords);
        setRadiusLabel(`PIN ${hit.pincode} · ${hit.area}`);
        if (!radiusKm) setRadiusKm(5);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const PLAN_PRIORITY: Record<string, number> = {
    premium_showcase: 1, premium: 1,
    standard_spotlight: 2, standard: 2,
    basic_boost: 3, basic: 3,
  };

  const fetchListings = async () => {
    setLoading(true);

    // Fetch listings and active sponsorships in parallel
    let query = supabase.from("property_listings").select("*").eq("status", "approved");
    if (type === "buy") query = query.in("listing_type", ["sell", "buy", "residential"]);
    else if (type === "rent") query = query.in("listing_type", ["rent", "rent_lease"]);
    else if (type === "pg") query = query.eq("property_type", "PG");
    else query = query.eq("listing_type", "commercial");

    const city = searchParams.get("city");
    if (city) query = query.eq("city", city);

    // Locality filters: from URL (?localities=A,B or ?locality=A) and sidebar
    const urlLocalities = searchParams.get("localities");
    const urlLocality = searchParams.get("locality");
    const localitySet = new Set<string>();
    if (urlLocalities) urlLocalities.split(",").map(s => s.trim()).filter(Boolean).forEach(l => localitySet.add(l));
    if (urlLocality) localitySet.add(urlLocality);
    (filters.localities || []).forEach(l => localitySet.add(l));
    if (localitySet.size) query = query.in("locality", Array.from(localitySet));

    if (filters.minPrice) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
    if (filters.bedrooms?.length) query = query.in("bedrooms", filters.bedrooms.map(Number));
    if (filters.furnishing?.length) query = query.in("furnishing", filters.furnishing);

    // Base sort for DB query
    if (sortBy === "price-asc") query = query.order("price", { ascending: true });
    else if (sortBy === "price-desc") query = query.order("price", { ascending: false });
    else if (sortBy === "area-desc") query = query.order("area", { ascending: false, nullsFirst: false });
    else query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });

    const [listRes, sponsorRes] = await Promise.all([
      query.limit(100),
      supabase.from("sponsorships").select("listing_id, plan_name").eq("status", "active").eq("payment_status", "completed"),
    ]);

    const listings = listRes.data || [];
    const sponsors = sponsorRes.data || [];

    // Build sponsor map
    const sponsorMap = new Map<string, string>();
    sponsors.forEach((s: any) => { if (s.listing_id && s.plan_name) sponsorMap.set(s.listing_id, s.plan_name); });

    // Sort: sponsored first by tier, then apply user's sort
    const sorted = [...listings].sort((a, b) => {
      const aPlan = sponsorMap.get(a.id);
      const bPlan = sponsorMap.get(b.id);
      const aPri = aPlan ? (PLAN_PRIORITY[aPlan.toLowerCase().replace(/\s+/g, '_')] || 3) : 99;
      const bPri = bPlan ? (PLAN_PRIORITY[bPlan.toLowerCase().replace(/\s+/g, '_')] || 3) : 99;
      if (aPri !== bPri) return aPri - bPri;
      // Within same tier, use original DB order
      return 0;
    });

    setLiveListings(sorted.slice(0, 50));
    setLoading(false);
  };

  // Apply radius filter client-side
  const visibleListings = (() => {
    if (!radiusCenter || !radiusKm) return liveListings;
    return liveListings.filter(p => {
      const c = getPropertyCoords(p);
      if (!c) return false;
      return haversineKm(radiusCenter, c) <= radiusKm;
    });
  })();

  const applyRadius = async () => {
    if (!radiusInput.trim() || !radiusKm) return;
    // Try city-coord match first; else geocode
    const cityHit = CITY_COORDS[radiusInput.trim()];
    if (cityHit) {
      setRadiusCenter(cityHit);
      setRadiusLabel(radiusInput.trim());
      return;
    }
    const c = await geocodeNominatim(`${radiusInput}, Lucknow, India`);
    if (c) {
      setRadiusCenter(c);
      setRadiusLabel(radiusInput.trim());
    } else {
      alert("Could not find that location. Try a Lucknow locality like 'Gomti Nagar' or 'Hazratganj'.");
    }
  };

  const clearRadius = () => {
    setRadiusCenter(null);
    setRadiusKm(0);
    setRadiusLabel("");
    setRadiusInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 bg-gradient-navy">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">{title}</h1>
          <p className="text-white/60 text-sm mb-4 md:mb-6">{subtitle}</p>
          <SearchBar variant="page" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Radius search bar */}
        <div className="mb-4 bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2 sm:mb-0 sm:hidden">
            <MapIcon className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground">Radius search</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <MapIcon className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Radius:</span>
            </div>
            <input
              type="text"
              value={radiusInput}
              onChange={e => setRadiusInput(e.target.value)}
              placeholder="Center (e.g. Gomti Nagar)"
              className="w-full sm:flex-1 sm:min-w-[140px] px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex gap-2">
              <select
                value={radiusKm}
                onChange={e => setRadiusKm(Number(e.target.value))}
                className="flex-1 sm:flex-none px-2 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value={0}>Distance…</option>
                {[1, 3, 5, 10, 20, 50].map(k => <option key={k} value={k}>{k} km</option>)}
              </select>
              <button onClick={applyRadius} disabled={!radiusKm || !radiusInput} className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold disabled:opacity-50">Apply</button>
            </div>
            {radiusCenter && (
              <button onClick={clearRadius} className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs w-full sm:w-auto">
                <X className="w-3 h-3" /> {radiusLabel} · {radiusKm}km
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{loading ? "..." : visibleListings.length}</span> properties found
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="relevance">Sort: Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-desc">Area: Largest First</option>
            </select>
            <div className="flex border border-border rounded-xl overflow-hidden flex-shrink-0">
              <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setView("map")} className={`p-2 ${view === "map" ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`} title="Map view">
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6 pb-24 lg:pb-0">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <FilterSidebar type={type} onFilterChange={setFilters} />
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="aspect-[4/3] w-full bg-muted animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-1/3 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleListings.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">No properties found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your filters or check back later for new listings.</p>
              </div>
            ) : view === "map" ? (
              <PropertiesMapView properties={visibleListings} center={radiusCenter || undefined} radiusKm={radiusKm || undefined} />
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {visibleListings.map(p => <LivePropertyCard key={p.id} property={p} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {visibleListings.map(p => <LivePropertyCard key={p.id} property={p} view="list" />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom filter drawer (shadcn Sheet from bottom) */}
      <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <SheetContent side="bottom" className="lg:hidden h-[85vh] p-0 rounded-t-2xl overflow-hidden flex flex-col">
          <SheetHeader className="px-4 py-3 border-b border-border flex-shrink-0">
            <SheetTitle className="text-left flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <FilterSidebar type={type} onFilterChange={(f) => setFilters(f)} />
          </div>
          <div className="p-3 border-t border-border flex-shrink-0">
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full py-3 rounded-xl btn-navy text-sm font-semibold"
            >
              Show {visibleListings.length} properties
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile sticky action bar: Filters + Enquire */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur border-t border-border p-3 flex gap-2 shadow-lg">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        <button
          onClick={() => setShowLeadForm(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow"
        >
          <MessageSquare className="w-4 h-4" />
          Enquire
        </button>
      </div>

      {/* Desktop floating Enquire */}
      <button
        onClick={() => setShowLeadForm(true)}
        className="hidden lg:flex fixed bottom-6 right-6 z-40 items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
      >
        <MessageSquare className="w-5 h-5" />
        Enquire Now
      </button>

      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Enquire Now</DialogTitle>
          </DialogHeader>
          <LeadForm title="Enquire Now" />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PropertyListPage;
