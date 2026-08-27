import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrendingUp, TrendingDown, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PriceTrends = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [activeCity, setActiveCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const { data, error: e } = await supabase.functions.invoke("market-trends");
        if (e) throw e;
        const t = data?.trends || [];
        setTrends(t);
        if (t.length > 0) setActiveCity(t[0].city);
      } catch (err: any) {
        setError("Unable to load market data. Add approved properties with valid prices to see trends.");
      }
      setLoading(false);
    };
    fetchTrends();

    // Re-fetch when properties change
    const channel = supabase.channel("price-trends-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "property_listings" }, () => { fetchTrends(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeTrend = trends.find(t => t.city === activeCity);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="bg-gradient-navy py-10">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-gold text-xs font-bold tracking-widest mb-2">MARKET INTELLIGENCE</p>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Property Price Trends in Lucknow</h1>
            <p className="text-white/60 text-sm">Track real-time property prices and rate changes across Lucknow</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error || trends.length === 0 ? (
            <div className="text-center py-20">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">{error || "No market data available yet. Trends will appear once approved properties are listed."}</p>
            </div>
          ) : (
            <>
              {/* City Selector */}
              <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
                {trends.map(t => (
                  <button key={t.city} onClick={() => setActiveCity(t.city)} className={`filter-chip flex-shrink-0 ${activeCity === t.city ? "active" : ""}`}>
                    {t.city}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Active City Detail */}
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display font-bold text-xl">{activeCity} Price Index</h2>
                      <p className="text-muted-foreground text-sm">Average price per sq.ft (approved listings)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-display font-bold text-accent">₹{activeTrend?.avg_price_sqft?.toLocaleString("en-IN") || "N/A"}</p>
                      <p className={`text-sm font-medium ${activeTrend?.trend === "up" ? "price-trend-up" : activeTrend?.trend === "down" ? "price-trend-down" : "text-muted-foreground"}`}>
                        {activeTrend?.yoy_change !== null && activeTrend?.yoy_change !== undefined
                          ? `${activeTrend.trend === "up" ? "↑" : "↓"} ${Math.abs(activeTrend.yoy_change)}% YoY`
                          : "YoY: N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{activeTrend?.listing_count || 0} approved listings in this city</p>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="space-y-4">
                  {trends.slice(0, 4).map(t => (
                    <div key={t.city} onClick={() => setActiveCity(t.city)} className={`bg-card rounded-2xl border p-4 cursor-pointer transition-all ${activeCity === t.city ? "border-accent shadow-md" : "border-border hover:border-accent/50"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display font-semibold text-sm">{t.city}</p>
                          <p className="text-xl font-display font-bold mt-0.5">₹{t.avg_price_sqft.toLocaleString("en-IN")}/sqft</p>
                        </div>
                        <span className={`flex items-center gap-1 text-sm font-bold ${t.trend === "up" ? "price-trend-up" : t.trend === "down" ? "price-trend-down" : "text-muted-foreground"}`}>
                          {t.trend === "up" ? <TrendingUp className="w-4 h-4" /> : t.trend === "down" ? <TrendingDown className="w-4 h-4" /> : null}
                          {t.yoy_change !== null ? `${Math.abs(t.yoy_change)}%` : "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Cities Grid */}
              <h2 className="font-display font-bold text-2xl mb-4">Property Prices Across Lucknow</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trends.map(t => (
                  <div key={t.city} className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveCity(t.city)}>
                    <p className="text-sm font-semibold mb-1">{t.city}</p>
                    <p className="text-xl font-display font-bold text-accent">₹{t.avg_price_sqft.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground">per sqft · {t.listing_count} listings</p>
                    <p className={`text-xs font-medium mt-1 ${t.trend === "up" ? "price-trend-up" : t.trend === "down" ? "price-trend-down" : "text-muted-foreground"}`}>
                      {t.yoy_change !== null ? `${t.trend === "up" ? "▲" : "▼"} ${Math.abs(t.yoy_change)}% YoY` : "YoY: N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PriceTrends;
