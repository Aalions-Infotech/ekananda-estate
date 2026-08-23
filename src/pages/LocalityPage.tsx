import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Building2, TrendingUp, IndianRupee, Home, ChevronRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import RecentlyViewed from "@/components/RecentlyViewed";
import { supabase } from "@/integrations/supabase/client";
import { lucknowLocalities } from "@/data/properties";
import { LUCKNOW_PINCODES, LOCALITY_RECOMMENDATIONS } from "@/lib/lucknowPincodes";
import { formatArea, formatPropertyPrice, getPricePerSqft } from "@/lib/propertyDisplay";

export const localitySlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const LocalityPage = () => {
  const { slug = "" } = useParams();
  const locality = useMemo(
    () => lucknowLocalities.find(l => localitySlug(l) === slug.toLowerCase()),
    [slug]
  );
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const pincodes = useMemo(
    () => LUCKNOW_PINCODES.filter(p => locality && p.localities.includes(locality)),
    [locality]
  );
  const tags = useMemo(
    () => LOCALITY_RECOMMENDATIONS.filter(g => locality && g.localities.includes(locality)).map(g => g.label),
    [locality]
  );

  useEffect(() => {
    if (!locality) { setLoading(false); return; }
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("property_listings")
        .select("*")
        .eq("status", "approved")
        .ilike("locality", `%${locality}%`)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(24);
      if (!active) return;
      setListings(data || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [locality]);

  const stats = useMemo(() => {
    if (!listings.length) return null;
    const prices = listings.map(l => Number(l.price)).filter(Boolean).sort((a, b) => a - b);
    const psf = listings.map(l => getPricePerSqft(l)).filter((v): v is number => Boolean(v));
    return {
      count: listings.length,
      min: prices[0],
      max: prices[prices.length - 1],
      median: prices[Math.floor(prices.length / 2)],
      avgPsf: psf.length ? Math.round(psf.reduce((a, b) => a + b, 0) / psf.length) : null,
    };
  }, [listings]);

  // SEO head tags
  useEffect(() => {
    if (!locality) return;
    const title = `Property in ${locality}, Lucknow — Flats, Plots & Houses | Ekananda Estate`;
    const description = `Verified properties for sale and rent in ${locality}, Lucknow. Browse ${stats?.count || ""} listings with prices, price per sq.ft, PIN codes and locality insights.`.replace(/\s+/g, " ");
    document.title = title.slice(0, 70);

    const setMeta = (selector: string, attr: string, key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', "name", "description", description.slice(0, 158));
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description.slice(0, 158));

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `/lucknow/${slug}`;

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.id = "locality-jsonld";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Place",
      name: `${locality}, Lucknow`,
      address: { "@type": "PostalAddress", addressLocality: locality, addressRegion: "Uttar Pradesh", addressCountry: "IN", postalCode: pincodes[0]?.pincode },
    });
    document.getElementById("locality-jsonld")?.remove();
    document.head.appendChild(ld);
    return () => { document.getElementById("locality-jsonld")?.remove(); };
  }, [locality, slug, stats, pincodes]);

  if (!locality) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-display font-bold mb-3">Locality not found</h1>
          <p className="text-muted-foreground mb-6">We cover Lucknow localities only. Explore all of them below.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {lucknowLocalities.map(l => (
              <Link key={l} to={`/lucknow/${localitySlug(l)}`} className="px-3 py-1.5 rounded-full border border-border text-sm hover:border-accent hover:text-accent">
                {l}
              </Link>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-8 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-accent">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/buy?city=Lucknow" className="hover:text-accent">Lucknow</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{locality}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-display font-bold">
            Property in {locality}, Lucknow
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Verified flats, houses, plots and commercial spaces in {locality}. Compare prices, price per sq.ft
            and connect directly with owners and RERA-registered agents.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map(t => (
              <span key={t} className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20">{t}</span>
            ))}
            {pincodes.map(p => (
              <span key={p.pincode} className="px-3 py-1 rounded-full text-xs border border-border text-muted-foreground">
                PIN {p.pincode}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {[
                { icon: Building2, label: "Live listings", value: String(stats.count) },
                { icon: IndianRupee, label: "Starting from", value: formatPropertyPrice(stats.min, "total") },
                { icon: TrendingUp, label: "Median price", value: formatPropertyPrice(stats.median, "total") },
                { icon: Home, label: "Avg. price/sq.ft", value: stats.avgPsf ? `₹${stats.avgPsf.toLocaleString("en-IN")}` : "—" },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
                  <s.icon className="w-4 h-4 text-accent mb-2" />
                  <p className="text-lg font-display font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl font-display font-bold mb-4">Available properties in {locality}</h2>
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : listings.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground mb-4">No live listings in {locality} right now.</p>
              <Link to="/post-property" className="btn-navy px-5 py-2.5 rounded-xl inline-block">Post your property FREE</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {listings.map(p => (
                <Link key={p.id} to={`/property/${p.id}`} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all">
                  <img src={p.images?.[0] || "/placeholder.svg"} alt={p.title} loading="lazy" className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <p className="font-semibold text-sm line-clamp-1">{p.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />{p.locality}, {p.city}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-display font-bold text-accent">
                        {formatPropertyPrice(p.price, p.listing_type === "rent" ? "monthly" : "total")}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatArea(p.area, p.area_unit)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Locality guide */}
          <div className="mt-10 bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold mb-3">About {locality}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {locality} is one of Lucknow's actively transacted micro-markets, served by
              {pincodes.length ? ` PIN code${pincodes.length > 1 ? "s" : ""} ${pincodes.map(p => p.pincode).join(", ")}` : " the 226xxx PIN series"}.
              Buyers here typically compare ready-to-move apartments, independent houses and plotted developments.
              Use the price per sq.ft above as a reference band while negotiating, and always verify RERA registration
              and approval authority before booking.
            </p>
          </div>

          {/* Nearby localities */}
          <div className="mt-6">
            <h2 className="text-lg font-display font-bold mb-3">Explore nearby localities</h2>
            <div className="flex flex-wrap gap-2">
              {lucknowLocalities.filter(l => l !== locality).slice(0, 16).map(l => (
                <Link key={l} to={`/lucknow/${localitySlug(l)}`} className="px-3 py-1.5 rounded-full border border-border text-xs hover:border-accent hover:text-accent">
                  Property in {l}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit">
          <LeadForm title={`Get ${locality} property details`} />
        </aside>
      </div>

      <RecentlyViewed />
      <Footer />
    </div>
  );
};

export default LocalityPage;
