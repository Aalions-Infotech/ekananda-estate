import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronDown, Menu, X, Sun, Moon, 
  Heart, User, LogIn, Building2, Home, 
  MapPin, TrendingUp, BookOpen, Star, Shield, LayoutDashboard, LogOut
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { lucknowLocalities } from "@/data/properties";
import { BRAND_NAME } from "@/constants/brand";
import logoImg from "@/assets/ekananda-logo.webp";
import OrgSwitcher from "@/components/OrgSwitcher";

const Navbar = () => {
  const { theme, toggleTheme, enforced } = useTheme();
  const { user, isAdmin, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Lucknow");
  const [cityDropdown, setCityDropdown] = useState(false);
  const [buyersDropdown, setBuyersDropdown] = useState(false);
  const [tenantsDropdown, setTenantsDropdown] = useState(false);
  const [ownersDropdown, setOwnersDropdown] = useState(false);
  const [insightsDropdown, setInsightsDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const megaMenuBuyers = [
    { label: "Buy a Home", links: ["/buy?type=apartment", "/buy?type=villa", "/buy?type=plot", "/buy?type=penthouse"], names: ["Apartments", "Villas", "Plots/Land",] },
    { label: "Commercial", links: ["/commercial?type=office", "/commercial?type=shop", "/commercial?type=warehouse"], names: ["Office Space", "Shops/Retail", "Warehouses"] },
    { label: "Land & More", links: ["/buy?type=agriculture-land", "/price-trends", "/news"], names: ["Agriculture Land", "Price Trends", "Real Estate News"] },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-[background-color,box-shadow,border-color] duration-300 ease-out will-change-[background-color] ${
      scrolled
        ? "bg-card/95 backdrop-blur-md shadow-md border-b border-border"
        : location.pathname === "/"
          ? "bg-transparent border-b border-transparent"
          : "bg-card border-b border-border"
    }`}>
      <div className="max-w-7xl mx-auto pl-3 pr-4 sm:pl-4 sm:pr-6 lg:pr-10">
        <div className="flex items-center flex-nowrap h-16 gap-2 sm:gap-3 lg:gap-4 min-w-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <img src={logoImg} alt={BRAND_NAME} className="w-10 h-8 sm:w-9 sm:h-9 rounded-lg object-cover flex-shrink-0" />
            <span className={`font-display font-800 text-[13px] sm:text-lg lg:text-xl tracking-tight truncate ${
              !scrolled && location.pathname === "/" ? "text-white" : "text-foreground"
            }`}>
              {BRAND_NAME}
            </span>
          </Link>

          {/* City Selector */}
          <div className="relative hidden sm:block" ref={cityRef}>
            <button
              onClick={() => setCityDropdown(!cityDropdown)}
              className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full border transition-all ${
                !scrolled && location.pathname === "/" 
                  ? "border-white/30 text-white hover:bg-white/10" 
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="max-w-24 truncate">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {cityDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-lg p-3 w-64 z-50">
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">SELECT LOCALITY (LUCKNOW)</p>
                <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto scrollbar-hide">
                  <button
                    onClick={() => { setSelectedCity("All Lucknow"); setCityDropdown(false); }}
                    className="text-left px-2 py-1.5 rounded-lg text-sm hover:bg-muted transition-colors font-medium text-accent"
                  >
                    All Lucknow
                  </button>
                  {lucknowLocalities.map(loc => (
                    <button
                      key={loc}
                      onClick={() => { setSelectedCity(loc); setCityDropdown(false); }}
                      className="text-left px-2 py-1.5 rounded-lg text-sm hover:bg-muted transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Org Switcher (only renders when the user belongs to ≥1 agency) */}
          {user && <OrgSwitcher onHome={!scrolled && location.pathname === "/"} />}

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-1 flex-1 min-w-0">
            {/* For Buyers */}
            <div className="relative group">
              <button
                onMouseEnter={() => setBuyersDropdown(true)}
                onMouseLeave={() => setBuyersDropdown(false)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !scrolled && location.pathname === "/" 
                    ? "text-white hover:bg-white/10" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                For Buyers <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {buyersDropdown && (
                <div
                  onMouseEnter={() => setBuyersDropdown(true)}
                  onMouseLeave={() => setBuyersDropdown(false)}
                  className="absolute top-full left-0 bg-card border border-border rounded-2xl shadow-lg p-5 w-96 z-50 animate-slide-up"
                >
                  <div className="grid grid-cols-3 gap-4">
                    {megaMenuBuyers.map((section) => (
                      <div key={section.label}>
                        <p className="text-xs font-bold text-gold mb-2">{section.label}</p>
                        {section.names.map((name, i) => (
                          <Link
                            key={name}
                            to={section.links[i]}
                            className="block text-sm py-1 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* For Tenants */}
            <div className="relative">
              <button
                onMouseEnter={() => setTenantsDropdown(true)}
                onMouseLeave={() => setTenantsDropdown(false)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !scrolled && location.pathname === "/" 
                    ? "text-white hover:bg-white/10" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                For Tenants <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {tenantsDropdown && (
                <div
                  onMouseEnter={() => setTenantsDropdown(true)}
                  onMouseLeave={() => setTenantsDropdown(false)}
                  className="absolute top-full left-0 bg-card border border-border rounded-2xl shadow-lg p-5 w-72 z-50 animate-slide-up"
                >
                  <p className="text-xs font-bold text-gold mb-3">RENT A HOME</p>
                  {["Rent Apartments", "Rent Villas", "Investment Property", "Rent Commercial"].map(item => (
                    <Link
                      key={item}
                      to={item.includes("Investment") ? "/buy?type=investment" : "/rent"}
                      className="block text-sm py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* For Owners */}
            <div className="relative">
              <button
                onMouseEnter={() => setOwnersDropdown(true)}
                onMouseLeave={() => setOwnersDropdown(false)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !scrolled && location.pathname === "/" 
                    ? "text-white hover:bg-white/10" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                For Owners <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {ownersDropdown && (
                <div
                  onMouseEnter={() => setOwnersDropdown(true)}
                  onMouseLeave={() => setOwnersDropdown(false)}
                  className="absolute top-full left-0 bg-card border border-border rounded-2xl shadow-lg p-5 w-72 z-50 animate-slide-up"
                >
                  <p className="text-xs font-bold text-gold mb-3">MANAGE PROPERTY</p>
                  {["Post Property FREE", "Manage Listings", "Sell Faster with Ads", "Owner Dashboard"].map(item => (
                    <Link
                      key={item}
                      to="/post-property"
                      className="block text-sm py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Insights */}
            <div className="relative">
              <button
                onMouseEnter={() => setInsightsDropdown(true)}
                onMouseLeave={() => setInsightsDropdown(false)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !scrolled && location.pathname === "/" 
                    ? "text-white hover:bg-white/10" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Insights <ChevronDown className="w-3.5 h-3.5" />
                <span className="text-xs bg-gold text-foreground px-1 rounded font-bold ml-0.5">NEW</span>
              </button>
              {insightsDropdown && (
                <div
                  onMouseEnter={() => setInsightsDropdown(true)}
                  onMouseLeave={() => setInsightsDropdown(false)}
                  className="absolute top-full left-0 bg-card border border-border rounded-2xl shadow-lg p-5 w-80 z-50 animate-slide-up"
                >
                  <p className="text-xs font-bold text-gold mb-3">MARKET INTELLIGENCE</p>
                  {[
                    { label: "Price Trends", to: "/price-trends", icon: TrendingUp },
                    { label: "Locality Guide", to: "/locality", icon: MapPin },
                    { label: "Articles & News", to: "/news", icon: BookOpen },
                    { label: "EMI Calculator", to: "/home-loans", icon: Star },
                  ].map(({ label, to, icon: Icon }) => (
                    <Link
                      key={label}
                      to={to}
                      className="flex items-center gap-2 text-sm py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/new-projects"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !scrolled && location.pathname === "/" 
                  ? "text-white hover:bg-white/10" 
                  : "text-foreground hover:bg-muted"
              }`}
            >
              New Projects
            </Link>

            <Link
              to="/agents"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !scrolled && location.pathname === "/" 
                  ? "text-white hover:bg-white/10" 
                  : "text-foreground hover:bg-muted"
              }`}
            >
              Agents
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto flex-shrink-0">
            {/* Theme Toggle */}
            {!enforced && (
            <button
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-full transition-all ${
                !scrolled && location.pathname === "/" 
                  ? "text-white hover:bg-white/10" 
                  : "text-foreground hover:bg-muted"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={`p-2 rounded-full transition-all hidden md:flex ${
                !scrolled && location.pathname === "/" 
                  ? "text-white hover:bg-white/10" 
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Post Property */}
            <Link
              to="/post-property"
              className="hidden xl:flex items-center gap-1.5 px-4 py-2 btn-navy rounded-xl text-sm"
            >
              Post Property
              <span className="badge-new">FREE</span>
            </Link>

            {/* Auth Actions */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdown((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userDropdown}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl border border-border/50 text-sm font-medium hover:bg-muted transition-all ${
                    !scrolled && location.pathname === "/" ? "text-white border-white/30 hover:bg-white/10" : ""
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {userDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg p-2 w-56 z-50 animate-slide-up">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      {role && <p className="text-xs text-gold capitalize mt-0.5">{role}</p>}
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                      >
                        <Shield className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                    >
                      <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                    <button
                      onClick={() => { setUserDropdown(false); signOut(); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive transition-colors w-full text-left mt-1 border-t border-border pt-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 rounded-full sm:rounded-xl sm:border sm:border-border/50 text-sm font-medium transition-all ${
                  !scrolled && location.pathname === "/"
                    ? "text-white hover:bg-white/10 sm:border-white/30"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Login</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-1.5 sm:p-2 rounded-full xl:hidden transition-all ${
                !scrolled && location.pathname === "/" 
                  ? "text-white hover:bg-white/10" 
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-card border-t border-border shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {/* Mobile City Selector */}
            <div className="sm:hidden pb-3 mb-2 border-b border-border">
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground">LOCALITY (LUCKNOW)</p>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                <button
                  onClick={() => { setSelectedCity("All Lucknow"); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedCity === "All Lucknow"
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-muted/50 text-foreground border-border hover:bg-muted"
                  }`}
                >
                  All Lucknow
                </button>
                {lucknowLocalities.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCity(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedCity === c
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-muted/50 text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {[
              { to: "/", label: "Home", icon: Home },
              { to: "/buy", label: "Residentials", icon: Building2 },
              { to: "/rent", label: "Rent/Lease", icon: MapPin },
              { to: "/commercial", label: "Commercials", icon: Building2 },
              { to: "/buy?type=agriculture-land", label: "Agriculture Land", icon: MapPin },
              { to: "/new-projects", label: "New Projects", icon: Star },
              { to: "/buy?type=investment", label: "Investment Property", icon: User },
              { to: "/post-property", label: "Post Property FREE", icon: Building2 },
              { to: "/agents", label: "Find Agents", icon: User },
              { to: "/price-trends", label: "Price Trends", icon: TrendingUp },
              { to: "/home-loans", label: "Home Loans & EMI", icon: Star },
              { to: "/news", label: "News & Articles", icon: BookOpen },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard
                </Link>
                <Link to="/org/members" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  <Building2 className="w-4 h-4 text-muted-foreground" /> My Agency
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                    <Shield className="w-4 h-4 text-muted-foreground" /> Admin Panel
                  </Link>
                )}
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors w-full text-left text-red-500">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                <LogIn className="w-4 h-4 text-muted-foreground" /> Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
