import { useState } from "react";
import { Search, Mic, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { propertyTypes } from "@/data/properties";
import { isLucknowPincode, lookupPincode } from "@/lib/lucknowPincodes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchBarProps {
  variant?: "hero" | "page";
}

const SearchBar = ({ variant = "hero" }: SearchBarProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "commercial" | "plot" | "investment" | "new-launch" | "listings">("buy");
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Lucknow");
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("All Residentials");

  const tabs = [
    { key: "buy", label: "Residentials" },
    { key: "rent", label: "Rent/Lease" },
    { key: "new-launch", label: "New", badge: true },
    { key: "commercial", label: "Commercials" },
    { key: "plot", label: "Plots/Land" },
    { key: "investment", label: "Investment Property" },
    { key: "listings", label: "property list" },
  ] as const;

  const handleSearch = () => {
    const path = activeTab === "buy" ? "/buy" : 
                 activeTab === "rent" ? "/rent" :
                 activeTab === "commercial" ? "/commercial" :
                 activeTab === "plot" ? "/buy?type=plot" :
                activeTab === "investment" ? "/buy?type=investment" :
                 activeTab === "listings" ? "/buy" :
                 "/new-projects";
    const params = new URLSearchParams();
    const q = query.trim();
    // Lucknow PIN code shortcut → expand to localities + map center
    if (isLucknowPincode(q)) {
      const hit = lookupPincode(q);
      if (hit) {
        params.set("pincode", hit.pincode);
        params.set("localities", hit.localities.join(","));
      }
    } else if (q) {
      params.set("q", q);
    }
    if (selectedCity !== "All Lucknow") params.set("locality", selectedCity);
    params.set("city", "Lucknow");
    if (selectedType && selectedType !== "All Residentials") {
      params.set("propertyType", selectedType);
    }
    navigate(`${path}?${params.toString()}`);
  };

  return (
    <div className={`${variant === "hero" ? "w-full max-w-3xl" : "w-full"}`}>
      {/* Tabs */}
      <div className={`flex items-center gap-1 mb-0 overflow-x-auto scrollbar-hide ${variant === "hero" ? "" : ""}`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-t-xl transition-all flex items-center gap-1 flex-shrink-0 whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-card text-accent border-t-2 border-t-accent shadow-sm"
                : variant === "hero"
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
            {"badge" in tab && tab.badge && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            )}
          </button>
        ))}
        <div className="ml-auto hidden md:block flex-shrink-0">
          <button
            onClick={() => navigate("/post-property")}
            aria-label="Post your property listing for free"
            className={`px-3 lg:px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ring-gold ${
              variant === "hero"
                ? "text-gold hover:text-gold/90 hover:bg-white/10"
                : "bg-gold/10 text-foreground hover:bg-gold/20 dark:bg-transparent dark:text-gold dark:hover:bg-white/5"
            }`}
          >
            <span className="whitespace-nowrap">Post Property</span>
            <span className="badge-new shrink-0">FREE</span>
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-card rounded-b-2xl rounded-tr-2xl shadow-lg border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center">
          {/* Property Type Selector */}
          <div className="flex-shrink-0 border-b sm:border-b-0 sm:border-r border-border">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-44 border-0 rounded-none h-12 sm:h-auto px-4 sm:py-4 text-sm font-medium bg-transparent hover:bg-muted focus:ring-0 focus:ring-offset-0 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-card">
                {["All Residentials", "Apartment",  "Plot/Land", "Builder Floor", ].map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="flex-1 min-w-0 flex items-center px-3 sm:px-4 gap-2 border-b sm:border-b-0 border-border">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search locality, project, landmark or PIN…"
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 py-3 sm:py-4"
            />
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors hidden sm:block">
              <Mic className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors hidden sm:block">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-6 py-3.5 sm:py-4 btn-navy text-sm font-semibold flex-shrink-0 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
