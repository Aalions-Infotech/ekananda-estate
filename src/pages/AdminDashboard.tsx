import { useState, useEffect, useMemo } from "react";
import logoImg from "@/assets/ekananda-logo.webp";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard, Home, Users, Crown, Bell, Settings,
  CheckCircle, XCircle, Clock, Trash2, LogOut, Star,
  TrendingUp, DollarSign, Building2, Shield, AlertTriangle,
  Search, RefreshCw, Activity, Edit, FileText,
  ChevronDown, ChevronUp, Eye, Ban, RotateCcw, Send,
  History, Download, Upload, MoreHorizontal, Globe,
  Megaphone, BarChart3, PieChart, Calendar, Mail,
  UserCheck, UserX, Layers, Sliders, Database,
  Sun, Moon, Menu, X, Plus, UserPlus, Briefcase
} from "lucide-react";
import AdminAddProperty from "@/components/admin/AdminAddProperty";
import AdminListingEditor from "@/components/admin/AdminListingEditor";
import AdminAgentManagement from "@/components/admin/AdminAgentManagement";
import AdminArticleManagement from "@/components/admin/AdminArticleManagement";
import AdminProjectManagement from "@/components/admin/AdminProjectManagement";
import AdminUserDashboardView from "@/components/admin/AdminUserDashboardView";
import AdminAgentDashboardView from "@/components/admin/AdminAgentDashboardView";
import AdminLeadsView from "@/components/admin/AdminLeadsView";
import AdminAdvancedAnalytics from "@/components/admin/AdminAdvancedAnalytics";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminPlatformSettings from "@/components/admin/AdminPlatformSettings";
import AdminUpdateRequests from "@/components/admin/AdminUpdateRequests";
import AdminDataExport from "@/components/admin/AdminDataExport";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";

const AdminDashboard = () => {
  const { user, isAdmin, role, signOut, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [listings, setListings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [realtimeAlerts, setRealtimeAlerts] = useState<string[]>([]);
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilterRole, setUserFilterRole] = useState("all");
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [notifForm, setNotifForm] = useState({ userId: "", title: "", message: "" });
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }
    if (!isAdmin) { navigate("/dashboard", { replace: true }); return; }
    fetchAll();

    const listingSub = supabase
      .channel("admin-listings")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "property_listings" }, (payload) => {
        setRealtimeAlerts(prev => [`🏠 New listing: "${payload.new.title}" at ${new Date().toLocaleTimeString('en-IN')}`, ...prev.slice(0, 19)]);
        setListings(prev => [payload.new, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "property_listings" }, (payload) => {
        setListings(prev => prev.map(l => l.id === payload.new.id ? payload.new : l));
      })
      .subscribe();

    const sponsorSub = supabase
      .channel("admin-sponsorships")
      .on("postgres_changes", { event: "*", schema: "public", table: "sponsorships" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setRealtimeAlerts(prev => [`💰 New sponsorship payment at ${new Date().toLocaleTimeString('en-IN')}`, ...prev.slice(0, 19)]);
        }
        fetchAll();
      })
      .subscribe();

    const userSub = supabase
      .channel("admin-users")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (payload) => {
        setRealtimeAlerts(prev => [`👤 New user registered: ${payload.new.email} at ${new Date().toLocaleTimeString('en-IN')}`, ...prev.slice(0, 19)]);
        setUsers(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(listingSub);
      supabase.removeChannel(sponsorSub);
      supabase.removeChannel(userSub);
    };
  }, [user, isAdmin, authLoading]);

  const fetchAll = async () => {
    setLoading(true);
    const [listRes, profileRes, rolesRes, sponsorRes, plansRes, notifRes, logRes] = await Promise.all([
      supabase.from("property_listings").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("sponsorships").select("*, property_listings(title, city)").order("created_at", { ascending: false }),
      supabase.from("sponsorship_plans").select("*").order("sort_order"),
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setListings(listRes.data || []);
    setUsers(profileRes.data || []);
    setUserRoles(rolesRes.data || []);
    setSponsorships(sponsorRes.data || []);
    setPlans(plansRes.data || []);
    setNotifications(notifRes.data || []);
    setActivityLog(logRes.data || []);
    setLoading(false);
  };

  const logAction = async (action: string, entityType: string, entityId: string, details?: any) => {
    await supabase.from("admin_activity_log").insert({
      admin_id: user!.id, action, entity_type: entityType, entity_id: entityId, details: details || {},
    });
  };

  const sendAdminEmailNotify = async (subject: string, type: string) => {
    try {
      await supabase.functions.invoke("admin-email-notify", {
        body: { to: user?.email, subject, type },
      });
    } catch (e) {
      console.log("Email notification skipped:", e);
    }
  };

  const sendListingEmail = async (listing: any, status: string, note?: string) => {
    try {
      const profile = users.find(u => u.user_id === listing.user_id);
      await supabase.functions.invoke("listing-status-email", {
        body: {
          to: profile?.email || listing.contact_email,
          userName: profile?.full_name || listing.contact_name,
          listingTitle: listing.title,
          status,
          adminNote: note || null,
          listingId: listing.id,
        },
      });
    } catch (e) { console.log("Email notification skipped:", e); }
  };

  const approveListing = async (id: string) => {
    const { error } = await supabase.from("property_listings").update({
      status: "approved", is_verified: true, reviewed_by: user!.id,
      reviewed_at: new Date().toISOString(), admin_note: null,
    }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const listing = listings.find(l => l.id === id);
    if (listing) {
      await logAction("approve_listing", "property_listing", id, { title: listing.title });
      await sendListingEmail(listing, "approved");
    }
    toast({ title: "✅ Listing approved!" });
    fetchAll(); setReviewingId(null);
  };

  const rejectListing = async (id: string, note: string) => {
    if (!note.trim()) { toast({ title: "Provide a rejection reason", variant: "destructive" }); return; }
    await supabase.from("property_listings").update({
      status: "rejected", reviewed_by: user!.id, reviewed_at: new Date().toISOString(), admin_note: note,
    }).eq("id", id);
    const listing = listings.find(l => l.id === id);
    if (listing) {
      await logAction("reject_listing", "property_listing", id, { title: listing.title, reason: note });
      await sendListingEmail(listing, "rejected", note);
    }
    toast({ title: "Listing rejected" }); fetchAll(); setReviewingId(null); setReviewNote("");
  };

  const suspendListing = async (id: string) => {
    await supabase.from("property_listings").update({ status: "suspended" }).eq("id", id);
    await logAction("suspend_listing", "property_listing", id);
    toast({ title: "Listing suspended" }); fetchAll();
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Permanently delete this listing?")) return;
    await supabase.from("property_listings").delete().eq("id", id);
    await logAction("delete_listing", "property_listing", id);
    toast({ title: "Listing deleted" }); fetchAll();
  };

  const featureListing = async (id: string, featured: boolean) => {
    await supabase.from("property_listings").update({ is_featured: featured }).eq("id", id);
    await logAction(featured ? "feature_listing" : "unfeature_listing", "property_listing", id);
    toast({ title: featured ? "Listing featured!" : "Feature removed" }); fetchAll();
  };

  const handleBulkAction = async () => {
    if (selectedListings.size === 0) { toast({ title: "No listings selected", variant: "destructive" }); return; }
    if (!bulkAction) { toast({ title: "Select an action", variant: "destructive" }); return; }
    const ids = Array.from(selectedListings);
    if (bulkAction === "approve") {
      for (const id of ids) await approveListing(id);
    } else if (bulkAction === "suspend") {
      for (const id of ids) await suspendListing(id);
    } else if (bulkAction === "delete") {
      if (!confirm(`Delete ${ids.length} listings permanently?`)) return;
      for (const id of ids) {
        await supabase.from("property_listings").delete().eq("id", id);
        await logAction("bulk_delete_listing", "property_listing", id);
      }
    } else if (bulkAction === "feature") {
      for (const id of ids) await featureListing(id, true);
    }
    setSelectedListings(new Set()); setBulkAction("");
    toast({ title: `Bulk action "${bulkAction}" completed on ${ids.length} listings` }); fetchAll();
  };

  const toggleSelectListing = (id: string) => {
    setSelectedListings(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    if (selectedListings.size === filteredListings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(filteredListings.map(l => l.id)));
    }
  };

  const activateSponsorship = async (id: string) => {
    const s = sponsorships.find(x => x.id === id);
    const now = new Date();
    const expires = new Date(now.getTime() + (s?.duration_days || 30) * 86400000);
    await supabase.from("sponsorships").update({
      status: "active", payment_status: "completed",
      starts_at: now.toISOString(), expires_at: expires.toISOString(),
    }).eq("id", id);
    if (s?.listing_id) {
      await supabase.from("property_listings").update({ is_featured: true }).eq("id", s.listing_id);
      if (s.user_id) {
        await supabase.from("notifications").insert({
          user_id: s.user_id, title: "🚀 Sponsorship Activated!",
          message: `Your ${s.plan_name} sponsorship is active until ${expires.toLocaleDateString('en-IN')}.`, type: "success",
        });
      }
    }
    await logAction("activate_sponsorship", "sponsorship", id);
    toast({ title: "Sponsorship activated!" }); fetchAll();
  };

  const cancelSponsorship = async (id: string) => {
    if (!confirm("Cancel this sponsorship?")) return;
    const s = sponsorships.find(x => x.id === id);
    await supabase.from("sponsorships").update({ status: "cancelled", payment_status: "refunded" }).eq("id", id);
    if (s?.listing_id) {
      await supabase.from("property_listings").update({ is_featured: false }).eq("id", s.listing_id);
    }
    await logAction("cancel_sponsorship", "sponsorship", id);
    toast({ title: "Sponsorship cancelled" }); fetchAll();
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any, assigned_by: user!.id });
    await logAction("change_role", "user", userId, { new_role: newRole });
    toast({ title: `Role updated to ${newRole}` }); fetchAll();
  };

  const verifyUser = async (userId: string, verified: boolean) => {
    await supabase.from("profiles").update({ is_verified: verified }).eq("user_id", userId);
    await logAction(verified ? "verify_user" : "unverify_user", "user", userId);
    toast({ title: verified ? "User verified" : "Verification removed" }); fetchAll();
  };

  const sendNotification = async () => {
    if (!notifForm.userId || !notifForm.title || !notifForm.message) {
      toast({ title: "Fill all fields", variant: "destructive" }); return;
    }
    await supabase.from("notifications").insert({
      user_id: notifForm.userId, title: notifForm.title, message: notifForm.message, type: "info",
    });
    await logAction("send_notification", "user", notifForm.userId, { title: notifForm.title });
    toast({ title: "Notification sent!" });
    setShowNotifModal(false); setNotifForm({ userId: "", title: "", message: "" });
  };

  const broadcastNotification = async (title: string, message: string) => {
    const allUserIds = [...new Set(users.map(u => u.user_id))];
    const inserts = allUserIds.map(uid => ({ user_id: uid, title, message, type: "info" as const }));
    await supabase.from("notifications").insert(inserts);
    await logAction("broadcast_notification", "system", "all", { title, count: allUserIds.length });
    toast({ title: `Broadcast sent to ${allUserIds.length} users` });
  };

  const exportListingsCSV = () => {
    const headers = ["Title", "City", "Locality", "Type", "Price", "Status", "Created"];
    const rows = listings.map(l => [l.title, l.city, l.locality, l.property_type, l.price, l.status, l.created_at]);
    const csv = [headers, ...rows].map(r => r.map((c: any) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "listings_export.csv"; a.click();
    toast({ title: "CSV exported!" });
  };

  // Computed
  const pendingCount = listings.filter(l => l.status === "pending").length;
  const approvedCount = listings.filter(l => l.status === "approved").length;
  const rejectedCount = listings.filter(l => l.status === "rejected").length;
  const suspendedCount = listings.filter(l => l.status === "suspended").length;
  const totalRevenue = sponsorships.filter(s => s.payment_status === "completed").reduce((acc, s) => acc + Number(s.amount), 0);
  const activeSponsors = sponsorships.filter(s => s.status === "active").length;

  const filteredListings = useMemo(() => listings.filter(l => {
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchSearch = !searchQuery || [l.title, l.city, l.locality, l.contact_name, l.contact_email].some(f => f?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  }), [listings, filterStatus, searchQuery]);

  const filteredUsers = useMemo(() => users.filter(u => {
    const ur = userRoles.find(r => r.user_id === u.user_id);
    const matchRole = userFilterRole === "all" || ur?.role === userFilterRole;
    const matchSearch = !userSearchQuery || [u.full_name, u.email, u.city, u.phone].some(f => f?.toLowerCase().includes(userSearchQuery.toLowerCase()));
    return matchRole && matchSearch;
  }), [users, userRoles, userFilterRole, userSearchQuery]);

  // Chart data
  const listingsByCity = useMemo(() => {
    const map: Record<string, number> = {};
    listings.forEach(l => { map[l.city] = (map[l.city] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [listings]);

  const statusPieData = useMemo(() => [
    { name: "Approved", value: approvedCount, color: "#10b981" },
    { name: "Pending", value: pendingCount, color: "#f59e0b" },
    { name: "Rejected", value: rejectedCount, color: "#ef4444" },
    { name: "Suspended", value: suspendedCount, color: "#6b7280" },
  ].filter(d => d.value > 0), [approvedCount, pendingCount, rejectedCount, suspendedCount]);

  const revenueByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    sponsorships.filter(s => s.payment_status === "completed").forEach(s => {
      const month = new Date(s.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      map[month] = (map[month] || 0) + Number(s.amount);
    });
    return Object.entries(map).slice(-6).map(([name, revenue]) => ({ name, revenue }));
  }, [sponsorships]);

  const listingsTrend = useMemo(() => {
    const map: Record<string, number> = {};
    listings.forEach(l => {
      const day = new Date(l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).slice(-14).map(([name, count]) => ({ name, count }));
  }, [listings]);

  const stats = [
    { label: "Total Listings", value: listings.length, sub: `${approvedCount} live · ${pendingCount} pending`, icon: Home, color: "from-blue-500/20 to-blue-600/5", to: "listings" },
    { label: "Pending Review", value: pendingCount, sub: pendingCount > 0 ? "⚠️ Needs attention" : "All clear", icon: Clock, color: "from-amber-500/20 to-amber-600/5", urgent: pendingCount > 0, to: "listings" },
    { label: "Registered Users", value: users.length, sub: `${userRoles.filter(r => r.role === "admin").length} admins · ${userRoles.filter(r => r.role === "agent").length} agents`, icon: Users, color: "from-emerald-500/20 to-emerald-600/5", to: "users" },
    { label: "Revenue (INR)", value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: `${activeSponsors} active sponsors`, icon: DollarSign, color: "from-yellow-500/20 to-yellow-600/5", to: "sponsorships" },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20",
      suspended: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      completed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      failed: "bg-red-500/10 text-red-600 border-red-500/20",
      cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      refunded: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    };
    return `px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] || map.pending}`;
  };

  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "listings", label: "Listings", icon: Home, badge: pendingCount },
    { id: "update-requests", label: "Update Requests", icon: FileText },
    { id: "add-property", label: "Add Property", icon: Plus },
    { id: "agents", label: "Manage Agents", icon: UserPlus },
    { id: "projects", label: "New Projects", icon: Building2 },
    { id: "articles", label: "Articles", icon: FileText },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "sponsorships", label: "Sponsorships", icon: Crown },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "leads", label: "Leads", icon: Mail },
    { id: "audit", label: "Audit Trail", icon: History },
    { id: "exports", label: "Data Export", icon: Download },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "plans", label: "Pricing Plans", icon: DollarSign },
    { id: "realtime", label: "Live Alerts", icon: Activity, badge: realtimeAlerts.length },
    { id: "view-user-dashboard", label: "User Dashboard", icon: Eye },
    { id: "view-agent-dashboard", label: "Agent Dashboard", icon: Briefcase },
    { id: "platform", label: "Platform Settings", icon: Sliders },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading Super Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? "w-16" : "w-[min(17rem,86vw)] md:w-64"} flex-shrink-0 bg-card border-r border-border flex flex-col fixed h-full z-40 transition-all duration-200 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoImg} alt="Ekananda Estate" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-display font-bold">Ekananda Estate</span>}
            </Link>
            <div className="flex items-center gap-1">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded hover:bg-muted text-muted-foreground hidden md:block">
                {sidebarCollapsed ? <ChevronDown className="w-4 h-4 rotate-[-90deg]" /> : <ChevronUp className="w-4 h-4 rotate-[-90deg]" />}
              </button>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground md:hidden">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="mt-3 px-2 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs font-medium text-destructive flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Super Admin Panel
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 truncate">{user?.email}</p>
            </>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setMobileSidebarOpen(false); }}
              title={sidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === item.id ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!sidebarCollapsed && item.badge ? <span className="bg-destructive text-destructive-foreground text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border space-y-0.5">
          <button onClick={() => { navigate("/org/create"); setMobileSidebarOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <Building2 className="w-4 h-4" /> {!sidebarCollapsed && "Create Agency"}
          </button>
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <Globe className="w-4 h-4" /> {!sidebarCollapsed && "View Site"}
          </Link>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-4 h-4" /> {!sidebarCollapsed && "Sign Out"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-w-0 ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"} min-h-screen flex flex-col transition-all duration-200`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base sm:text-lg md:text-xl truncate leading-tight">{navItems.find(n => n.id === tab)?.label}</h1>
              <p className="text-[11px] text-muted-foreground hidden lg:block truncate">Super Admin · {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button onClick={() => navigate("/org/create")} className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90" title="Create agency">
              <Building2 className="w-4 h-4" /> <span className="hidden md:inline">Create Agency</span>
            </button>
            {realtimeAlerts.length > 0 && (
              <button onClick={() => setTab("realtime")} className="relative flex items-center gap-2 px-2.5 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 hover:bg-destructive/20">
                <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="hidden lg:inline">{realtimeAlerts.length} Alert{realtimeAlerts.length > 1 ? "s" : ""}</span>
                <span className="lg:hidden">{realtimeAlerts.length}</span>
              </button>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="Toggle dark mode">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={fetchAll} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-xs font-bold">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 flex-1">
          {/* OVERVIEW */}
          {tab === "exports" && <AdminDataExport />}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                  <button key={s.label} onClick={() => setTab(s.to)} className={`bg-gradient-to-br ${s.color} rounded-2xl border border-border p-5 text-left hover:shadow-md transition-all`}>
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className="w-5 h-5 text-foreground/70" />
                      {(s as any).urgent && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                    </div>
                    <p className="text-3xl font-display font-bold">{s.value}</p>
                    <p className="text-sm font-medium mt-0.5">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                  </button>
                ))}
              </div>

              {realtimeAlerts.length > 0 && (
                <div className="bg-card rounded-2xl border border-primary/30 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <h3 className="font-display font-semibold text-sm">Live Activity Feed</h3>
                    </div>
                    <button onClick={() => setRealtimeAlerts([])} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                  </div>
                  <div className="space-y-2">
                    {realtimeAlerts.slice(0, 5).map((alert, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                        {alert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingCount > 0 && (
                <div className="bg-card rounded-2xl border border-amber-500/30 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-display font-semibold">Pending Approvals ({pendingCount})</h3>
                  </div>
                  <div className="space-y-3">
                    {listings.filter(l => l.status === "pending").slice(0, 5).map(l => (
                      <div key={l.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{l.title}</p>
                          <p className="text-xs text-muted-foreground">{l.locality}, {l.city} · ₹{Number(l.price).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => approveListing(l.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                          <button onClick={() => { setReviewingId(l.id); setTab("listings"); }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mini Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-2xl border border-border p-5">
                  <h3 className="font-display font-semibold mb-3 text-sm">Listing Status</h3>
                  {statusPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <RPieChart>
                        <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                          {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </RPieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-sm py-8 text-center">No data</p>}
                </div>
                <div className="bg-card rounded-2xl border border-border p-5">
                  <h3 className="font-display font-semibold mb-3 text-sm">Listings by City</h3>
                  {listingsByCity.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={listingsByCity}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} /></BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-sm py-8 text-center">No data</p>}
                </div>
                <div className="bg-card rounded-2xl border border-border p-5">
                  <h3 className="font-display font-semibold mb-3 text-sm">User Roles</h3>
                  {["admin", "moderator", "agent", "user"].map(r => (
                    <div key={r} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm capitalize text-muted-foreground">{r}s</span>
                      <span className="font-semibold text-sm">{userRoles.filter(ur => ur.role === r).length}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-sm">Recent Admin Actions</h3>
                  <button onClick={() => setTab("audit")} className="text-xs text-accent hover:underline">View All</button>
                </div>
                {activityLog.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <History className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{log.entity_type} · {new Date(log.created_at).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
                {activityLog.length === 0 && <p className="text-muted-foreground text-xs py-4 text-center">No activity yet</p>}
              </div>
            </div>
          )}

          {/* LISTINGS TAB */}
          {tab === "listings" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by title, city, locality, contact..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all", "pending", "approved", "rejected", "suspended"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      {s} ({s === "all" ? listings.length : listings.filter(l => l.status === s).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-card rounded-xl border border-border px-3 sm:px-4 py-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                  <input type="checkbox" checked={selectedListings.size === filteredListings.length && filteredListings.length > 0} onChange={selectAllFiltered} className="rounded" />
                  Select All ({selectedListings.size})
                </label>
                <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs">
                  <option value="">Bulk Action...</option>
                  <option value="approve">Approve Selected</option>
                  <option value="suspend">Suspend Selected</option>
                  <option value="feature">Feature Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button onClick={handleBulkAction} disabled={!bulkAction || selectedListings.size === 0} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-50">Apply</button>
                <button onClick={exportListingsCSV} className="sm:ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 flex items-center gap-1 whitespace-nowrap">
                  <Download className="w-3 h-3" /> Export CSV
                </button>
              </div>

              <p className="text-xs text-muted-foreground">{filteredListings.length} listings found</p>

              <div className="space-y-3">
                {filteredListings.map(l => (
                  <div key={l.id} className={`bg-card rounded-2xl border p-5 ${l.status === "pending" ? "border-amber-500/30" : "border-border"}`}>
                    {reviewingId === l.id ? (
                      <div className="space-y-3">
                        <p className="font-medium text-sm">Rejection reason for: <strong>{l.title}</strong></p>
                        <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Explain why..." rows={3} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none resize-none focus:ring-2 focus:ring-accent" />
                        <div className="flex gap-2">
                          <button onClick={() => rejectListing(l.id, reviewNote)} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Confirm Reject</button>
                          <button onClick={() => { setReviewingId(null); setReviewNote(""); }} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 lg:gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <input type="checkbox" checked={selectedListings.has(l.id)} onChange={() => toggleSelectListing(l.id)} className="mt-1.5 rounded" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-display font-semibold text-sm truncate">{l.title}</h3>
                                <span className={statusBadge(l.status)}>{l.status}</span>
                                {l.is_featured && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">⭐ Featured</span>}
                                {l.is_verified && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">✓ Verified</span>}
                              </div>
                              <p className="text-xs text-muted-foreground">{l.locality}, {l.city} · {l.property_type} · {l.listing_type}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                                <span className="font-semibold text-foreground">₹{Number(l.price).toLocaleString('en-IN')}</span>
                                {l.bedrooms && <span>{l.bedrooms} BHK</span>}
                                {l.area && <span>{l.area} {l.area_unit}</span>}
                                <span>{new Date(l.created_at).toLocaleDateString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap lg:flex-nowrap lg:flex-shrink-0">
                            {l.status === "pending" && (
                              <>
                                <button onClick={() => approveListing(l.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20">✓ Approve</button>
                                <button onClick={() => setReviewingId(l.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20">✗ Reject</button>
                              </>
                            )}
                            {l.status === "approved" && <button onClick={() => suspendListing(l.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-500/10 text-gray-500 border border-gray-500/20 hover:bg-gray-500/20">Suspend</button>}
                            {(l.status === "suspended" || l.status === "rejected") && <button onClick={() => approveListing(l.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Restore</button>}
                            <button onClick={() => featureListing(l.id, !l.is_featured)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border ${l.is_featured ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" : "bg-muted text-muted-foreground border-border"}`}>
                              {l.is_featured ? "⭐ Unfeature" : "☆ Feature"}
                            </button>
                            <button onClick={() => setExpandedListing(expandedListing === l.id ? null : l.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingListing(l)} className="p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent" title="Full Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteListing(l.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {l.admin_note && (
                          <div className="mt-2 p-2 bg-red-500/5 rounded-lg border border-red-500/10 ml-7">
                            <p className="text-xs text-red-600">Admin note: {l.admin_note}</p>
                          </div>
                        )}
                        {expandedListing === l.id && (
                          <div className="mt-3 ml-7 p-4 bg-muted/30 rounded-xl border border-border space-y-2 text-xs">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div><span className="text-muted-foreground">Owner:</span> <span className="font-medium">{l.contact_name || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{l.contact_phone || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{l.contact_email || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">RERA:</span> <span className="font-medium">{l.rera_id || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">Builder:</span> <span className="font-medium">{l.builder_name || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">Society:</span> <span className="font-medium">{l.society_name || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">Furnishing:</span> <span className="font-medium">{l.furnishing || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">Facing:</span> <span className="font-medium">{l.facing || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">Floor:</span> <span className="font-medium">{l.floor || "N/A"}/{l.total_floors || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">Parking:</span> <span className="font-medium">{l.parking || 0}</span></div>
                              <div><span className="text-muted-foreground">Age:</span> <span className="font-medium">{l.age_of_property || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">Images:</span> <span className="font-medium">{l.images?.length || 0}</span></div>
                            </div>
                            {l.description && <div className="pt-2 border-t border-border"><span className="text-muted-foreground">Description:</span> <p className="mt-1">{l.description}</p></div>}
                            {l.amenities?.length > 0 && <div><span className="text-muted-foreground">Amenities:</span> {l.amenities.join(", ")}</div>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {filteredListings.length === 0 && (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <Home className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No listings found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab === "users" && (
            <AdminUserManagement users={users} userRoles={userRoles} listings={listings} sponsorships={sponsorships} adminId={user!.id} onRefresh={fetchAll} />
          )}

          {/* SPONSORSHIPS TAB */}
          {tab === "sponsorships" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                {["pending", "active", "expired", "cancelled"].map(s => (
                  <div key={s} className="bg-card rounded-2xl border border-border p-4 text-center">
                    <p className="text-2xl font-display font-bold">{sponsorships.filter(sp => sp.status === s).length}</p>
                    <p className="text-sm text-muted-foreground capitalize">{s}</p>
                  </div>
                ))}
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <h3 className="font-display font-semibold mb-3 text-sm">Revenue by Plan</h3>
                {plans.map(p => {
                  const planRevenue = sponsorships.filter(s => s.plan_name === p.name && s.payment_status === "completed").reduce((acc, s) => acc + Number(s.amount), 0);
                  const planCount = sponsorships.filter(s => s.plan_name === p.name).length;
                  return (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm">{p.display_name} <span className="text-muted-foreground">({planCount})</span></span>
                      <span className="font-semibold text-sm text-accent">₹{planRevenue.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
                <div className="pt-2 flex items-center justify-between font-bold text-sm border-t border-border mt-1">
                  <span>Total Revenue</span>
                  <span className="text-accent">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="space-y-3">
                {sponsorships.map(s => (
                  <div key={s.id} className="bg-card rounded-2xl border border-border p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-sm">{s.property_listings?.title || "Unknown"}</p>
                          <span className={statusBadge(s.status)}>{s.status}</span>
                          <span className={statusBadge(s.payment_status)}>{s.payment_status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.plan_name} · {s.duration_days} days · ₹{Number(s.amount).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {s.starts_at && `${new Date(s.starts_at).toLocaleDateString('en-IN')} → `}
                          {s.expires_at && new Date(s.expires_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {s.status === "pending" && (
                          <button onClick={() => activateSponsorship(s.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20">Activate</button>
                        )}
                        {s.status === "active" && (
                          <button onClick={() => cancelSponsorship(s.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20">Cancel</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {sponsorships.length === 0 && (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No sponsorships yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {tab === "analytics" && (
            <AdminAdvancedAnalytics listings={listings} users={users} userRoles={userRoles} sponsorships={sponsorships} />
          )}

          {/* AUDIT TRAIL */}
          {tab === "audit" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{activityLog.length} logged actions</p>
                <button onClick={fetchAll} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              <div className="space-y-2">
                {activityLog.map(log => {
                  const adminProfile = users.find(u => u.user_id === log.admin_id);
                  return (
                    <div key={log.id} className="bg-card rounded-2xl border border-border p-4 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <History className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.entity_type} · ID: {log.entity_id?.substring(0, 8)}...
                          {adminProfile && ` · By: ${adminProfile.email}`}
                        </p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted/30 px-2 py-1 rounded break-all">{JSON.stringify(log.details)}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{new Date(log.created_at).toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
                {activityLog.length === 0 && (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No admin actions logged yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODERATION TAB */}
          {tab === "moderation" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-2xl border border-amber-500/30 p-5 cursor-pointer hover:shadow-md" onClick={() => { setFilterStatus("pending"); setTab("listings"); }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h3 className="font-display font-semibold text-sm">Pending Review</h3>
                  </div>
                  <p className="text-3xl font-display font-bold text-amber-600">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Listings awaiting approval</p>
                </div>
                <div className="bg-card rounded-2xl border border-red-500/30 p-5 cursor-pointer hover:shadow-md" onClick={() => { setFilterStatus("suspended"); setTab("listings"); }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Ban className="w-5 h-5 text-red-500" />
                    <h3 className="font-display font-semibold text-sm">Suspended</h3>
                  </div>
                  <p className="text-3xl font-display font-bold text-red-600">{suspendedCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Suspended listings</p>
                </div>
                <div className="bg-card rounded-2xl border border-border p-5 cursor-pointer hover:shadow-md" onClick={() => { setFilterStatus("rejected"); setTab("listings"); }}>
                  <div className="flex items-center gap-3 mb-3">
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-display font-semibold text-sm">Rejected</h3>
                  </div>
                  <p className="text-3xl font-display font-bold">{rejectedCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Rejected listings</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Unverified Users</h3>
                <div className="space-y-3">
                  {users.filter(u => !u.is_verified).slice(0, 10).map(u => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{u.full_name || "No name"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <button onClick={() => verifyUser(u.user_id, true)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20">Verify</button>
                    </div>
                  ))}
                  {users.filter(u => !u.is_verified).length === 0 && <p className="text-muted-foreground text-sm text-center py-4">All users verified ✓</p>}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Broadcast Notification</h3>
                <p className="text-xs text-muted-foreground mb-3">Send a message to all {users.length} registered users</p>
                <div className="space-y-3">
                  <input placeholder="Notification title" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" id="broadcast-title" />
                  <textarea placeholder="Message content..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none resize-none focus:ring-2 focus:ring-accent" id="broadcast-message" />
                  <button onClick={() => {
                    const title = (document.getElementById("broadcast-title") as HTMLInputElement)?.value;
                    const message = (document.getElementById("broadcast-message") as HTMLTextAreaElement)?.value;
                    if (title && message) broadcastNotification(title, message);
                    else toast({ title: "Fill both fields", variant: "destructive" });
                  }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> Send Broadcast
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === "notifications" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{notifications.length} notifications</p>
              <div className="space-y-3">
                {notifications.slice(0, 50).map(n => (
                  <div key={n.id} className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${n.type === "success" ? "bg-emerald-500/10 text-emerald-500" : n.type === "error" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>
                        {n.type === "success" ? "✓" : n.type === "error" ? "✗" : "ℹ"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString('en-IN')}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${n.is_read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                        {n.is_read ? "read" : "unread"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRICING PLANS */}
          {tab === "plans" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans.map((plan, i) => (
                  <div key={plan.id} className={`bg-card rounded-2xl border p-6 ${i === 1 ? "border-accent" : "border-border"}`}>
                    <h3 className="font-display font-bold text-lg mb-1">{plan.display_name}</h3>
                    <p className="text-muted-foreground text-xs mb-3">{plan.description}</p>
                    <p className="text-3xl font-display font-bold text-accent mb-1">₹{Number(plan.price).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground mb-3">for {plan.duration_days} days</p>
                    {plan.stripe_price_id && <p className="text-xs text-muted-foreground mb-3 font-mono bg-muted/50 px-2 py-1 rounded">Stripe: {plan.stripe_price_id}</p>}
                    <ul className="space-y-1.5 mb-4">
                      {plan.features?.map((f: string) => (
                        <li key={f} className="flex items-center gap-2 text-xs"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{f}</li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">{sponsorships.filter(s => s.plan_name === plan.name).length} purchases</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${plan.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{plan.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REALTIME ALERTS */}
          {tab === "realtime" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <h2 className="font-display font-bold">Live Activity Feed</h2>
                <button onClick={() => setRealtimeAlerts([])} className="ml-auto text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1 rounded-lg">Clear All</button>
              </div>
              {realtimeAlerts.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No live alerts yet. New listings, sponsorships, and user actions will appear here in real-time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {realtimeAlerts.map((alert, i) => (
                    <div key={i} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                      <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                      <p className="text-sm flex-1">{alert}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADD PROPERTY TAB */}
          {tab === "add-property" && (
            <div>
              <AdminAddProperty userId={user!.id} onSuccess={fetchAll} />
            </div>
          )}

          {/* AGENTS TAB */}
          {tab === "agents" && (
            <AdminAgentManagement users={users} userRoles={userRoles} onRefresh={fetchAll} adminId={user!.id} />
          )}

          {/* PROJECTS TAB */}
          {tab === "projects" && (
            <AdminProjectManagement adminId={user!.id} />
          )}

          {/* ARTICLES TAB */}
          {tab === "articles" && (
            <AdminArticleManagement adminId={user!.id} />
          )}

          {tab === "leads" && <AdminLeadsView />}


          {tab === "settings" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> Super Admin Account</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-sm font-medium">Admin Email</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs bg-red-500/10 text-red-600 border border-red-500/20 font-semibold uppercase">{role}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-sm font-medium">User ID</p>
                      <p className="text-xs text-muted-foreground font-mono">{user?.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-sm font-medium">Login Password</p>
                      <p className="text-xs text-muted-foreground">••••••••• (set during signup)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Database className="w-5 h-5" /> Platform Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Listings", val: listings.length },
                    { label: "Approved", val: approvedCount },
                    { label: "Pending", val: pendingCount },
                    { label: "Rejected", val: rejectedCount },
                    { label: "Suspended", val: suspendedCount },
                    { label: "Total Users", val: users.length },
                    { label: "Total Revenue", val: `₹${totalRevenue.toLocaleString('en-IN')}` },
                    { label: "Active Sponsors", val: activeSponsors },
                  ].map(s => (
                    <div key={s.label} className="bg-muted/30 rounded-xl p-3 text-center">
                      <p className="text-xl font-display font-bold">{s.val}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Sliders className="w-5 h-5" /> Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button onClick={() => navigate("/org/create")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-all text-left">
                    <Building2 className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Create Agency</p>
                      <p className="text-xs text-muted-foreground">Set up a new agency, branch, and team workspace</p>
                    </div>
                  </button>
                  <button onClick={exportListingsCSV} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-all text-left">
                    <Download className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Export All Listings</p>
                      <p className="text-xs text-muted-foreground">Download CSV of all property listings</p>
                    </div>
                  </button>
                  <button onClick={fetchAll} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-all text-left">
                    <RefreshCw className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Refresh All Data</p>
                      <p className="text-xs text-muted-foreground">Force reload all platform data</p>
                    </div>
                  </button>
                  <button onClick={() => setTab("moderation")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-all text-left">
                    <Shield className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Content Moderation</p>
                      <p className="text-xs text-muted-foreground">Review pending & flagged content</p>
                    </div>
                  </button>
                  <button onClick={() => setTab("audit")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-all text-left">
                    <History className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">View Audit Trail</p>
                      <p className="text-xs text-muted-foreground">Review all admin actions</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Embedded User Dashboard View */}
          {tab === "view-user-dashboard" && (
            <AdminUserDashboardView users={users} userRoles={userRoles} listings={listings} sponsorships={sponsorships} />
          )}

          {/* Embedded Agent Dashboard View */}
          {tab === "view-agent-dashboard" && (
            <AdminAgentDashboardView users={users} userRoles={userRoles} />
          )}

          {tab === "platform" && <AdminPlatformSettings />}

          {tab === "update-requests" && user && (
            <AdminUpdateRequests adminId={user.id} />
          )}
        </div>
      </div>

      {/* Listing Editor Modal */}
      {editingListing && (
        <AdminListingEditor
          listing={editingListing}
          adminId={user!.id}
          onSave={() => { setEditingListing(null); fetchAll(); }}
          onClose={() => setEditingListing(null)}
        />
      )}

      {/* Notification Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNotifModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold mb-4">Send Notification</h3>
            <div className="space-y-3">
              <input value={notifForm.title} onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent" />
              <textarea value={notifForm.message} onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))} placeholder="Message..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none resize-none focus:ring-2 focus:ring-accent" />
              <div className="flex gap-2">
                <button onClick={sendNotification} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Send</button>
                <button onClick={() => setShowNotifModal(false)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
