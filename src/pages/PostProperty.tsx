import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Upload, Clock, Info, X, ImagePlus, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrg } from "@/context/OrgContext";
import { Building2 } from "lucide-react";
import { useEffect } from "react";

const LISTING_TYPES: Array<[string, string]> = [
  ["sell", "Sell"],
  ["rent_lease", "Rent / Lease"],
  ["residential", "Residentials"],
  ["commercial", "Commercials"],
];

const PROPERTY_TYPES_BY_LISTING: Record<string, string[]> = {
  sell:        ["Plot/Land", "House", "Apartment", "Villa", "Builder Floor", "Agriculture Land", "Warehouse", "Office", "Other"],
  rent_lease:  ["Apartment", "Plot/Land", "House", "PG", "Warehouse", "Office", "Shop", "Other"],
  residential: ["Plot/Land", "Apartment", "Villa", "House", "Builder Floor", "Agriculture Land", "Other"],
  commercial:  ["Plot/Land", "Shop", "Warehouse", "Office", "Other"],
};

const APPROVAL_AUTHORITIES = ["RERA", "LDA", "Gram Panchayat", "Nagar Nigam", "Free Hold", "Other"];

type FieldDef = { key: string; label: string; type: "text" | "number" | "select" | "boolean"; options?: string[]; placeholder?: string; required?: boolean };

const FIELDS_BY_PROPERTY_TYPE: Record<string, FieldDef[]> = {
  "Agriculture Land": [
    { key: "front_width", label: "Front Width (ft)", type: "number" },
    { key: "back_width", label: "Back Width (ft)", type: "number" },
    { key: "plot_length", label: "Plot Length (ft)", type: "number" },
    { key: "total_land_area", label: "Total Land Area (acre)", type: "number", required: true },
    { key: "water_availability", label: "Water Availability", type: "select", options: ["Borewell", "Canal", "River", "None"] },
    { key: "soil_type", label: "Soil Type", type: "select", options: ["Black", "Red", "Alluvial", "Sandy", "Loamy", "Other"] },
    { key: "road_access", label: "Road Access", type: "select", options: ["Tar Road", "Mud Road", "Highway", "None"] },
    { key: "irrigation_facility", label: "Irrigation Facility", type: "boolean" },
    { key: "electricity_connection", label: "Electricity Connection", type: "boolean" },
    { key: "boundary_available", label: "Boundary Available", type: "boolean" },
  ],
  "Plot/Land": [
    { key: "plot_width", label: "Plot Width (ft)", type: "number" },
    { key: "plot_length", label: "Plot Length (ft)", type: "number" },
    { key: "corner_plot", label: "Corner Plot", type: "boolean" },
    { key: "boundary_wall", label: "Boundary Wall", type: "boolean" },
    { key: "road_width", label: "Road Width (ft)", type: "number" },
    { key: "facing", label: "Facing", type: "select", options: ["East","West","North","South","North-East","North-West","South-East","South-West"] },
    { key: "construction_allowed", label: "Construction Allowed", type: "boolean" },
    { key: "zone_type", label: "Zone Type", type: "select", options: ["Residential","Commercial","Industrial","Mixed-use","Agricultural"] },
  ],
  "Office": [
    { key: "cabin_count", label: "Cabin Count", type: "number" },
    { key: "washrooms", label: "Washrooms", type: "number" },
    { key: "reception_area", label: "Reception Area", type: "boolean" },
    { key: "pantry", label: "Pantry", type: "boolean" },
    { key: "parking", label: "Parking Spots", type: "number" },
    { key: "floor", label: "Floor", type: "number" },
    { key: "total_floors", label: "Total Floors", type: "number" },
    { key: "power_backup", label: "Power Backup", type: "boolean" },
    { key: "furnishing", label: "Furnishing", type: "select", options: ["Unfurnished","Semi-Furnished","Fully Furnished"] },
    { key: "conference_room", label: "Conference Room", type: "boolean" },
  ],
  "Shop": [
    { key: "frontage", label: "Shop Frontage (ft)", type: "number" },
    { key: "floor", label: "Floor", type: "number" },
    { key: "washrooms", label: "Washrooms", type: "number" },
    { key: "power_backup", label: "Power Backup", type: "boolean" },
    { key: "parking", label: "Parking Spots", type: "number" },
  ],
  "Warehouse": [
    { key: "shed_height", label: "Shed Height (ft)", type: "number" },
    { key: "power_load", label: "Power Load (kVA)", type: "number" },
    { key: "dock_availability", label: "Dock Availability", type: "boolean" },
    { key: "crane_facility", label: "Crane Facility", type: "boolean" },
    { key: "industrial_water_supply", label: "Industrial Water Supply", type: "boolean" },
    { key: "office_space", label: "Office Space", type: "boolean" },
    { key: "warehouse_area", label: "Warehouse Area (sq.ft)", type: "number" },
    { key: "truck_access", label: "Truck Access", type: "boolean" },
  ],
};

const RESIDENTIAL_FIELDS: FieldDef[] = [
  { key: "bedrooms", label: "Bedrooms", type: "select", options: ["1","2","3","4","5+"], required: true },
  { key: "bathrooms", label: "Bathrooms", type: "select", options: ["1","2","3","4+"], required: true },
  { key: "balconies", label: "Balconies", type: "number" },
  { key: "furnishing", label: "Furnishing", type: "select", options: ["Unfurnished","Semi-Furnished","Fully Furnished"] },
  { key: "floor", label: "Floor Number", type: "number" },
  { key: "total_floors", label: "Total Floors", type: "number" },
  { key: "parking", label: "Parking Spots", type: "number" },
  { key: "facing", label: "Facing", type: "select", options: ["East","West","North","South","North-East","North-West","South-East","South-West"] },
  { key: "carpet_area", label: "Carpet Area (sq.ft)", type: "number" },
  { key: "super_builtup_area", label: "Super Built-up Area (sq.ft)", type: "number" },
];

const RESIDENTIAL_TYPES = new Set(["Apartment","House","Villa","Builder Floor","PG"]);

function getFieldsForType(propertyType: string): FieldDef[] {
  if (FIELDS_BY_PROPERTY_TYPE[propertyType]) return FIELDS_BY_PROPERTY_TYPE[propertyType];
  if (RESIDENTIAL_TYPES.has(propertyType)) return RESIDENTIAL_FIELDS;
  return [];
}

const PostProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [form, setForm] = useState({
    listingType: "sell",
    propertyType: "Apartment",
    city: "",
    locality: "",
    address: "",
    bedrooms: "2",
    bathrooms: "2",
    area: "",
    areaUnit: "sq.ft",
    furnishing: "Unfurnished",
    facing: "",
    parking: "1",
    price: "",
    title: "",
    description: "",
    amenities: [] as string[],
    contactName: "",
    phone: "",
    contactEmail: "",
    reraId: "",
    approvalAuthority: "",
  });

  const update = (k: string, v: string) =>
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === "listingType") {
        const types = PROPERTY_TYPES_BY_LISTING[v as keyof typeof PROPERTY_TYPES_BY_LISTING] || [];
        next.propertyType = types[0] || "Apartment";
      }
      if (k === "listingType" || k === "propertyType") {
        setAttributes({});
      }
      return next;
    });
  const toggleAmenity = (a: string) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
  }));

  const addCustomAmenity = () => {
    const v = customAmenityInput.trim();
    if (!v) return;
    if (v.length > 40) { toast({ title: "Keep amenity under 40 chars", variant: "destructive" }); return; }
    if (form.amenities.some(a => a.toLowerCase() === v.toLowerCase())) {
      toast({ title: "Amenity already added" });
      setCustomAmenityInput("");
      return;
    }
    setForm(f => ({ ...f, amenities: [...f.amenities, v] }));
    setCustomAmenityInput("");
  };

  const amenitiesList = ["Swimming Pool", "Gym", "Security", "Parking", "Lift", "Power Backup", "Club House", "Garden", "Kids Play Area", "WiFi", "Modular Kitchen", "AC", "Laundry", "Visitor Parking"];

  const dynamicFields = useMemo(() => getFieldsForType(form.propertyType), [form.propertyType]);
  const showResidentialBasics = RESIDENTIAL_TYPES.has(form.propertyType);
  const exactPricePerSqft = form.area && form.price && Number(form.area) > 0 ? Math.round(Number(form.price) / Number(form.area)) : 0;

  // Org / branch attribution (optional)
  const { memberships, currentOrg } = useOrg();
  const [attribution, setAttribution] = useState<{ orgId: string; branchId: string }>({ orgId: "", branchId: "" });
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  useEffect(() => {
    if (currentOrg && !attribution.orgId) setAttribution({ orgId: currentOrg.org_id, branchId: "" });
  }, [currentOrg, attribution.orgId]);
  useEffect(() => {
    (async () => {
      if (!attribution.orgId) { setBranches([]); return; }
      const { data } = await (supabase as any).from("org_branches").select("id, name").eq("org_id", attribution.orgId).eq("is_active", true);
      setBranches((data || []) as any);
    })();
  }, [attribution.orgId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) {
        toast({ title: `${f.name} is too large (max 10MB)`, variant: "destructive" });
        return false;
      }
      if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(f.type)) {
        toast({ title: `${f.name} is not a supported format`, variant: "destructive" });
        return false;
      }
      return true;
    });

    const totalImages = images.length + validFiles.length;
    if (totalImages > 20) {
      toast({ title: "Maximum 20 photos allowed", variant: "destructive" });
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (listingId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${listingId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("property-images").upload(path, file, { contentType: file.type });
      if (error) {
        console.error("Upload error:", error);
        continue;
      }
      const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!form.city || !form.locality || !form.price || !form.title || !form.area) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (Number(form.price) <= 0 || Number(form.area) <= 0) {
      toast({ title: "Invalid price or area", description: "Price and area must be greater than zero.", variant: "destructive" });
      return;
    }
    for (const f of dynamicFields) {
      if (f.required && (attributes[f.key] === undefined || attributes[f.key] === "" || attributes[f.key] === null)) {
        toast({ title: `Missing: ${f.label}`, variant: "destructive" });
        return;
      }
    }
    setSubmitting(true);
    try {
      const listingId = crypto.randomUUID();
      let imageUrls: string[] = [];

      if (images.length > 0) {
        setUploadingImages(true);
        imageUrls = await uploadImages(listingId);
        setUploadingImages(false);
      }

      const { error } = await supabase.from("property_listings").insert({
        id: listingId,
        user_id: user.id,
        org_id: attribution.orgId || null,
        branch_id: attribution.branchId || null,
        title: form.title,
        description: form.description,
        listing_type: form.listingType,
        property_type: form.propertyType,
        city: form.city,
        locality: form.locality,
        address: form.address,
        bedrooms: showResidentialBasics ? (parseInt(String(attributes.bedrooms ?? form.bedrooms)) || null) : null,
        bathrooms: showResidentialBasics ? (parseInt(String(attributes.bathrooms ?? form.bathrooms)) || null) : null,
        area: parseFloat(form.area) || null,
        area_unit: form.areaUnit || "sq.ft",
        furnishing: attributes.furnishing || form.furnishing,
        facing: attributes.facing || form.facing || null,
        parking: parseInt(String(attributes.parking ?? form.parking)) || 0,
        price: parseFloat(form.price),
        price_unit: form.listingType === "rent_lease" ? "monthly" : "total",
        price_per_sqft: exactPricePerSqft || null,
        amenities: form.amenities,
        property_attributes: attributes,
        images: imageUrls.length > 0 ? imageUrls : null,
        contact_name: form.contactName || null,
        contact_phone: form.phone || null,
        contact_email: form.contactEmail || user.email,
        rera_id: form.reraId || null,
        approval_authority: form.approvalAuthority || null,
        status: "pending",
        is_new: true,
      });
      if (error) throw error;
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Property Submitted Successfully!",
        message: `Your listing "${form.title}" has been submitted and is pending admin approval. You'll be notified once it's reviewed.`,
        type: "info",
      });
      toast({ title: "Property submitted!", description: "Your listing is pending admin approval." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="bg-gradient-navy py-10">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-display font-bold text-white mb-2">Post Property for Free in Lucknow</h1>
            <p className="text-white/60 text-sm">List your property for free in minutes and connect with genuine buyers & tenants in Lucknow</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Steps */}
          <div className="flex items-center gap-2 mb-8">
            {["Property Info", "Details & Photos", "Contact"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${step > i + 1 ? "bg-gradient-gold text-foreground" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                {i < 2 && <div className={`flex-1 h-0.5 ${step > i + 1 ? "bg-accent" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && !user && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                You need to <button onClick={() => navigate("/auth")} className="underline font-medium">sign in</button> to submit a property listing.
              </p>
            </div>
          )}

          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl mb-4">Property Information</h2>
                {memberships.length > 0 && (
                  <div className="p-3 rounded-xl border border-border bg-muted/40">
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> POST ON BEHALF OF
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={attribution.orgId}
                        onChange={(e) => setAttribution({ orgId: e.target.value, branchId: "" })}
                        className="px-3 py-2 rounded-xl border border-border bg-background text-sm"
                      >
                        <option value="">Personal listing</option>
                        {memberships.map((m) => (
                          <option key={m.org_id} value={m.org_id}>{m.organization.name}</option>
                        ))}
                      </select>
                      <select
                        value={attribution.branchId}
                        onChange={(e) => setAttribution((a) => ({ ...a, branchId: e.target.value }))}
                        disabled={!attribution.orgId || branches.length === 0}
                        className="px-3 py-2 rounded-xl border border-border bg-background text-sm disabled:opacity-50"
                      >
                        <option value="">No branch</option>
                        {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">I want to</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {LISTING_TYPES.map(([v, l]) => (
                      <button key={v} type="button" onClick={() => update("listingType", v)} className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${form.listingType === v ? "border-accent bg-accent/10 text-accent" : "border-border hover:bg-muted"}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Property Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(PROPERTY_TYPES_BY_LISTING[form.listingType] || []).map(t => (
                      <button key={t} type="button" onClick={() => update("propertyType", t)} className={`py-2 rounded-xl border text-sm font-medium transition-all ${form.propertyType === t ? "border-accent bg-accent/10 text-accent" : "border-border hover:bg-muted"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City <span className="text-red-500">*</span></label>
                    <input value={form.city} onChange={e => update("city", e.target.value)} placeholder="e.g. Lucknow" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Locality <span className="text-red-500">*</span></label>
                    <input value={form.locality} onChange={e => update("locality", e.target.value)} placeholder="e.g. Bandra West" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Address</label>
                  <input value={form.address} onChange={e => update("address", e.target.value)} placeholder="Street, building, landmark..." className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Approval Authority</label>
                    <select value={form.approvalAuthority} onChange={e => update("approvalAuthority", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent">
                      <option value="">Select authority</option>
                      {APPROVAL_AUTHORITIES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <p className="text-[11px] text-muted-foreground mt-1">Helps buyers know who approved this property.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {form.approvalAuthority === "RERA" ? "RERA Registration Number" : "Registration / Approval Number"} <span className="text-muted-foreground text-xs">(optional)</span>
                    </label>
                    <input value={form.reraId} onChange={e => update("reraId", e.target.value)} placeholder={form.approvalAuthority === "RERA" ? "e.g. P52100026542" : "Approval / khasra / file number"} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display font-bold text-xl">Property Details</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Showing fields for <span className="font-medium text-foreground">{form.propertyType}</span>. Switch property type in step 1 to see different fields.
                  </p>
                </div>

                {/* Dynamic per-type fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dynamicFields.map(f => {
                    const val = attributes[f.key] ?? "";
                    const setVal = (v: any) => setAttributes(a => ({ ...a, [f.key]: v }));
                    if (f.type === "boolean") {
                      return (
                        <label key={f.key} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-border bg-background cursor-pointer hover:bg-muted/40">
                          <span className="text-sm font-medium">{f.label}{f.required && <span className="text-red-500"> *</span>}</span>
                          <input type="checkbox" checked={!!val} onChange={e => setVal(e.target.checked)} className="w-4 h-4 accent-current" />
                        </label>
                      );
                    }
                    if (f.type === "select") {
                      return (
                        <div key={f.key}>
                          <label className="block text-sm font-medium mb-2">{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
                          <select value={String(val)} onChange={e => setVal(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent">
                            <option value="">Select…</option>
                            {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      );
                    }
                    return (
                      <div key={f.key}>
                        <label className="block text-sm font-medium mb-2">{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
                        <input
                          type={f.type === "number" ? "number" : "text"}
                          value={val}
                          onChange={e => setVal(f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Area <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input type="number" min="1" value={form.area} onChange={e => update("area", e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                      <select value={form.areaUnit} onChange={e => update("areaUnit", e.target.value)} className="px-2 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent">
                        <option value="sq.ft">sq.ft</option>
                        <option value="sq.m">sq.m</option>
                        <option value="sq.yd">sq.yard</option>
                        <option value="biswa">Biswa</option>
                        <option value="bigha">Bigha</option>
                        <option value="acre">Acre</option>
                        <option value="hectare">Hectare</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {form.listingType === "rent_lease" ? "Monthly Rent (₹)" : "Expected Price (₹)"} <span className="text-red-500">*</span>
                    </label>
                    <input type="number" min="1" value={form.price} onChange={e => update("price", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                    {exactPricePerSqft > 0 && <p className="text-[11px] text-muted-foreground mt-1">₹{exactPricePerSqft.toLocaleString("en-IN")}/sq.ft will be shown.</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Property Title <span className="text-red-500">*</span></label>
                  <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="e.g. Spacious 3BHK with City View in Bandra West" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea value={form.description} onChange={e => update("description", e.target.value)} rows={4} placeholder="Describe your property, unique features, nearby landmarks..." className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none resize-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map(a => (
                      <button key={a} onClick={() => toggleAmenity(a)} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${form.amenities.includes(a) ? "border-accent bg-accent/10 text-accent" : "border-border hover:bg-muted"}`}>{a}</button>
                    ))}
                    {form.amenities.filter(a => !amenitiesList.includes(a)).map(a => (
                      <button key={a} onClick={() => toggleAmenity(a)} className="px-3 py-1.5 rounded-lg border border-accent bg-accent/10 text-accent text-xs font-medium flex items-center gap-1">
                        {a}<X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={customAmenityInput}
                      onChange={e => setCustomAmenityInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                      placeholder="Add a custom amenity"
                      maxLength={40}
                      className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button type="button" onClick={addCustomAmenity} className="px-3 py-2 rounded-xl border border-accent bg-accent/10 text-accent text-sm font-medium flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>

                {/* Multi-photo upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Property Photos ({images.length}/20)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {imagePreviews.map((preview, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-border aspect-square">
                          <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-medium">Cover</span>
                          )}
                        </div>
                      ))}
                      {images.length < 20 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-1 transition-colors"
                        >
                          <ImagePlus className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Add More</span>
                        </button>
                      )}
                    </div>
                  )}
                  {imagePreviews.length === 0 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent transition-colors"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Upload Property Photos</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP up to 10MB each. Max 20 photos.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-xl mb-4">Contact Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <input value={form.contactName} onChange={e => update("contactName", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input value={form.phone} onChange={e => update("phone", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" value={form.contactEmail} onChange={e => update("contactEmail", e.target.value)} placeholder={user?.email || "your@email.com"} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-blue-700 dark:text-blue-400">Pending Admin Approval</p>
                      <p className="text-xs text-blue-600/70 mt-1">
                        Your listing will be reviewed by our team within 24 hours. You'll receive a notification once it's approved or if any changes are needed. Approved listings go live immediately!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 text-sm text-muted-foreground">
                  ✅ Listing on Ekananda Estate is <strong>completely FREE</strong>. Optional sponsorship is available to boost your listing to the top.
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-5 border-t border-border">
              {step > 1 && <button onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted">Back</button>}
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} className="flex-1 py-2.5 rounded-xl btn-gold text-sm font-medium">Continue →</button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl btn-navy text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {uploadingImages ? "Uploading photos..." : "Submitting..."}
                    </>
                  ) : (
                    "Submit for Approval"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PostProperty;
