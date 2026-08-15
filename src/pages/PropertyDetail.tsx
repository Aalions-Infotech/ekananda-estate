import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Maximize2, Heart, Share2, Phone, MessageCircle, MessageSquare, Shield, CheckCircle, Building2, Calendar, Car, Layers, Star, ChevronRight, Home, Loader2, GitCompareArrows } from "lucide-react";
import { BRAND_NAME, BRAND_WHATSAPP } from "@/constants/brand";
import { useCompare } from "@/context/CompareContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import SavePropertyButton from "@/components/SavePropertyButton";
import PropertyReviews from "@/components/PropertyReviews";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { properties, formatPrice } from "@/data/properties";
import PropertyCard from "@/components/PropertyCard";
import PropertyMap from "@/components/PropertyMap";
import AiPricePrediction from "@/components/AiPricePrediction";
import AiRecommendations from "@/components/AiRecommendations";
import { getPropertyCoords } from "@/lib/geo";
import { formatArea, getPricePerSqft, shouldShowBedsBaths } from "@/lib/propertyDisplay";

const ATTRIBUTE_LABELS: Record<string, string> = {
  total_land_area: "Total Land Area",
  water_availability: "Water Availability",
  soil_type: "Soil Type",
  road_access: "Road Access",
  irrigation_facility: "Irrigation Facility",
  electricity_connection: "Electricity Connection",
  boundary_available: "Boundary Available",
  plot_width: "Plot Width",
  plot_length: "Plot Length",
  road_width: "Road Width",
  zone_type: "Zone Type",
  corner_plot: "Corner Plot",
  boundary_wall: "Boundary Wall",
  construction_allowed: "Construction Allowed",
  cabin_count: "Cabins",
  washrooms: "Washrooms",
  shed_height: "Shed Height",
  power_load: "Power Load",
  truck_access: "Truck Access",
};

const PropertyDetail = () => {
  const { id } = useParams();
  const { addItem, removeItem, isInCompare } = useCompare();
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [tab, setTab] = useState<"overview" | "amenities" | "nearby" | "reviews">("overview");
  const [liveListing, setLiveListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [similar, setSimilar] = useState<any[]>([]);

  // Try to find from static data first, then from DB
  const staticProperty = properties.find(p => p.id === id);

  useEffect(() => {
    if (!staticProperty && id) {
      fetchListing();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("property_listings")
      .select("*")
      .eq("id", id!)
      .single();
    setLiveListing(data);
    setLoading(false);
    if (data?.city) {
      const { data: sim } = await supabase
        .from("property_listings")
        .select("*")
        .eq("status", "approved")
        .eq("city", data.city)
        .neq("id", id!)
        .limit(3);
      setSimilar(sim || []);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Use static or live data
  const property = staticProperty || liveListing;
  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-4">This property may have been removed or is no longer available.</p>
            <Link to="/buy" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-medium">Browse Properties</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Normalize for live vs static data
  const isLive = !!liveListing;
  const images = isLive ? (property.images || ["/placeholder.svg"]) : property.images;
  const title = property.title;
  const price = Number(property.price);
  const priceUnit = isLive ? property.price_unit : property.priceUnit;
  const pricePerSqft = getPricePerSqft(isLive ? property : { ...property, pricePerSqft: property.pricePerSqft });
  const area = Number(property.area);
  const areaUnit = isLive ? (property.area_unit || "sq.ft") : property.areaUnit;
  const bedrooms = property.bedrooms;
  const bathrooms = property.bathrooms;
  const parking = property.parking;
  const city = property.city;
  const locality = property.locality;
  const address = isLive ? property.address : property.address;
  const description = property.description;
  const furnishing = property.furnishing;
  const facing = property.facing;
  const amenities = property.amenities || [];
  const verified = isLive ? property.is_verified : property.verified;
  const featured = isLive ? property.is_featured : property.featured;
  const status = isLive ? (property.age_of_property === "New" ? "New Launch" : "Ready to Move") : property.status;
  const propertyType = isLive ? property.property_type : property.category;
  const showBedsBaths = shouldShowBedsBaths(propertyType);
  const propertyAttributes = isLive ? (property.property_attributes || {}) : {};
  const ageOfProperty = isLive ? property.age_of_property : property.ageOfProperty;
  const societyName = isLive ? property.society_name : property.societyName;
  const builderName = isLive ? property.builder_name : property.builderName;
  const reraId = isLive ? property.rera_id : property.reraId;
  const floor = property.floor;
  const totalFloors = isLive ? property.total_floors : property.totalFloors;
  const nearbyPlaces = isLive ? [] : (property.nearbyPlaces || []);

  // Owner contact details (fall back to brand contact only if listing has none)
  const ownerName: string = (isLive ? property.contact_name : property.contactName) || "Property Owner";
  const ownerPhoneRaw: string = (isLive ? property.contact_phone : property.contactPhone) || "";
  const ownerWhatsappRaw: string = (isLive ? property.whatsapp_number : property.whatsappNumber) || ownerPhoneRaw;
  const digits = (v: string) => (v || "").replace(/[^0-9]/g, "");
  const ownerPhone = digits(ownerPhoneRaw);
  const ownerWhatsapp = digits(ownerWhatsappRaw) || BRAND_WHATSAPP;
  const waNumber = ownerWhatsapp.length === 10 ? `91${ownerWhatsapp}` : ownerWhatsapp;
  const enquiryText = `Hi, I'm interested in: ${title} - ${locality}, ${city}`;

  // similar is fetched from DB above; fallback to empty array

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground flex items-center gap-1"><Home className="w-3 h-3" /> Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/buy" className="hover:text-foreground">Buy</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{city}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{locality}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-1 min-w-0">
              {/* Images */}
              <div className="mb-6 rounded-2xl overflow-hidden">
                <div className="relative h-64 sm:h-80 md:h-[450px]">
                  <img src={images[activeImg] || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => {
                        const compareItem = {
                          id: property.id || id || "",
                          title, image: images[0] || "/placeholder.svg",
                          price, area, areaUnit: areaUnit || "sq.ft",
                          bedrooms, bathrooms, city, locality,
                          furnishing, propertyType,
                        };
                        isInCompare(compareItem.id) ? removeItem(compareItem.id) : addItem(compareItem);
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow transition-colors ${isInCompare(property.id || id || "") ? "bg-accent text-accent-foreground" : "bg-card/90"}`}
                      title={isInCompare(property.id || id || "") ? "Remove from compare" : "Add to compare"}
                    >
                      <GitCompareArrows className="w-5 h-5" />
                    </button>
                    <SavePropertyButton propertyId={property.id || id || ""} className="w-10 h-10 bg-card/90" />
                    <button className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center shadow">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                  {verified && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Verified Listing
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 mt-2">
                    {images.map((img: string, i: number) => (
                      <button key={i} onClick={() => setActiveImg(i)} className={`flex-1 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? "border-accent" : "border-transparent"}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title + Price */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {featured && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground">Featured</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status === "Ready to Move" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>{status}</span>
                    {reraId && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">RERA Verified</span>}
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2 break-words">{title}</h1>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{address || `${locality}, ${city}`}</span>
                  </div>
                </div>
                <div className="text-left md:text-right flex-shrink-0">
                  <p className="text-2xl md:text-3xl font-display font-bold text-accent break-words">{formatPrice(price, priceUnit)}</p>
                  {pricePerSqft > 0 && <p className="text-sm text-muted-foreground">₹{pricePerSqft.toLocaleString("en-IN")}/sq.ft</p>}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {showBedsBaths && bedrooms && (
                  <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <BedDouble className="w-5 h-5 text-accent mx-auto mb-1" />
                    <p className="font-display font-bold text-lg">{bedrooms}</p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                )}
                {showBedsBaths && bathrooms && (
                  <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <Bath className="w-5 h-5 text-accent mx-auto mb-1" />
                    <p className="font-display font-bold text-lg">{bathrooms}</p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                )}
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <Maximize2 className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="font-display font-bold text-lg">{formatArea(area, areaUnit).replace(` ${areaUnit}`, "")}</p>
                  <p className="text-xs text-muted-foreground">{areaUnit}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <Car className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="font-display font-bold text-lg">{parking || 0}</p>
                  <p className="text-xs text-muted-foreground">Parking</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-border mb-6">
                <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                  {(["overview", "amenities", "nearby", "reviews"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`pb-3 text-sm font-medium capitalize flex-shrink-0 transition-colors ${tab === t ? "border-b-2 border-accent text-accent" : "text-muted-foreground"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {tab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-semibold mb-3">About this property</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description || "No description provided."}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Property Type", value: propertyType },
                      { label: "Furnishing", value: furnishing },
                      { label: "Facing", value: facing },
                      { label: "Age of Property", value: ageOfProperty },
                      ...((floor !== undefined && floor !== null) ? [{ label: "Floor", value: totalFloors ? `${floor} of ${totalFloors}` : String(floor) }] : []),
                      ...(societyName ? [{ label: "Society", value: societyName }] : []),
                      ...(builderName ? [{ label: "Builder", value: builderName }] : []),
                      ...(reraId ? [{ label: "RERA ID", value: reraId }] : []),
                      ...Object.entries(propertyAttributes)
                        .filter(([, value]) => value !== null && value !== undefined && value !== "")
                        .map(([key, value]) => ({ label: ATTRIBUTE_LABELS[key] || key.replace(/_/g, " "), value: typeof value === "boolean" ? (value ? "Yes" : "No") : String(value) })),
                    ].filter(d => d.value).map(({ label, value }) => (
                      <div key={label} className="bg-muted/30 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className="text-sm font-medium truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "amenities" && (
                <div>
                  <h3 className="font-display font-semibold mb-4">Amenities & Features</h3>
                  {amenities.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {amenities.map((a: string) => (
                        <div key={a} className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {a}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No amenities listed.</p>
                  )}
                </div>
              )}

              {tab === "nearby" && (
                <div>
                  <h3 className="font-display font-semibold mb-4">Location & Nearby Places</h3>
                  {(() => {
                    const coords = getPropertyCoords({ ...property, city, locality, id: property.id || id });
                    if (!coords) {
                      return <p className="text-muted-foreground text-sm">Location coordinates not available for this property.</p>;
                    }
                    return <PropertyMap center={coords} title={title} height="420px" radiusMeters={1500} />;
                  })()}
                </div>
              )}

              {tab === "reviews" && (
                <PropertyReviews propertyId={property.id || id || ""} />
              )}

              {/* AI Price Prediction + Recommendations */}
              <div className="mt-8 space-y-6">
                <AiPricePrediction
                  property={{
                    city, locality, propertyType, bedrooms, bathrooms,
                    area: Number(area), areaUnit, price: Number(price),
                    furnishing, ageOfProperty, listingType: isLive ? property.listing_type : property.type,
                  }}
                />
                <AiRecommendations
                  property={{
                    id: property.id || id || "", city, locality, propertyType,
                    bedrooms, price: Number(price), listingType: isLive ? property.listing_type : property.type,
                  }}
                />
              </div>
            </div>

            {/* Contact Sidebar */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-20 space-y-4">
                <LeadForm propertyId={isLive ? property.id : undefined} title="Interested? Get in Touch" />

                <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                    <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center font-display font-bold text-lg text-foreground">
                      P
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm">Property Owner</p>
                      <p className="text-xs text-muted-foreground">{city}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <a
                      href={`https://wa.me/${BRAND_WHATSAPP}?text=${encodeURIComponent(`Hi, I'm interested in: ${title} - ${locality}, ${city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-white bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                    <button className="w-full btn-gold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                      <Phone className="w-4 h-4" /> Contact Owner
                    </button>
                    <button className="w-full btn-navy py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4" /> Send Message
                    </button>
                    <Link to="/home-loans" className="block w-full py-3 rounded-xl border border-border text-center text-sm font-medium hover:bg-muted transition-all">
                      Calculate EMI
                    </Link>
                  </div>
                </div>

                {price > 100000 && (
                  <div className="bg-card rounded-2xl border border-border p-5">
                    <h4 className="font-display font-semibold text-sm mb-3">Quick EMI Estimate</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Price</span>
                        <span className="font-medium">{formatPrice(price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Loan Amount (80%)</span>
                        <span className="font-medium">{formatPrice(price * 0.8)}</span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="text-muted-foreground">Est. EMI @8.5%</span>
                        <span className="font-display font-bold text-accent">₹{Math.round(price * 0.8 * (0.085/12) / (1 - Math.pow(1 + 0.085/12, -240))).toLocaleString()}/mo</span>
                      </div>
                    </div>
                    <Link to="/home-loans" className="block mt-3 text-xs text-accent font-medium text-center">Full EMI Calculator →</Link>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {similar.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-display font-bold mb-6">Similar Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {similar.map((p: any) => (
                  <PropertyCard key={p.id} property={{
                    id: p.id,
                    title: p.title,
                    type: p.listing_type,
                    category: p.property_type,
                    price: Number(p.price) || 0,
                    priceUnit: p.price_unit === "monthly" ? "monthly" : "total",
                    area: Number(p.area) || 0,
                    areaUnit: p.area_unit || "sq.ft",
                    bedrooms: p.bedrooms, bathrooms: p.bathrooms,
                    city: p.city, locality: p.locality, address: p.address || "",
                    image: (p.images && p.images[0]) || "/placeholder.svg",
                    images: p.images || ["/placeholder.svg"],
                    amenities: p.amenities || [],
                    furnishing: p.furnishing || "Unfurnished",
                    status: "Ready to Move",
                    postedBy: "Owner",
                    postedDate: "",
                    verified: !!p.is_verified,
                    featured: !!p.is_featured,
                    isNew: !!p.is_new,
                    description: p.description || "",
                    facing: p.facing || "",
                    parking: p.parking || 0,
                    ageOfProperty: p.age_of_property || "",
                    nearbyPlaces: [],
                    pricePerSqft: Number(p.price_per_sqft) || 0,
                  } as any} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Floating Enquire Now Button */}
      <button
        onClick={() => setShowLeadForm(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <MessageSquare className="w-5 h-5" />
        Enquire Now
      </button>

      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enquire About This Property</DialogTitle>
          </DialogHeader>
          <LeadForm propertyId={id} onSuccess={() => setShowLeadForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyDetail;
