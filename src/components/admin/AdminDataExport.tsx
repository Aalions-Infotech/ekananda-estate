import { useState } from "react";
import { Download, Database, Loader2, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv, stamped } from "@/lib/csv";

type Source = {
  id: string;
  table: string;
  label: string;
  description: string;
  columns: string[];
};

const SOURCES: Source[] = [
  {
    id: "listings", table: "property_listings", label: "Property Listings",
    description: "Every listing with pricing, location, owner contact and moderation status.",
    columns: ["id", "title", "listing_type", "property_type", "city", "locality", "price", "area", "area_unit", "price_per_sqft", "status", "is_featured", "is_verified", "contact_name", "contact_phone", "contact_email", "created_at"],
  },
  {
    id: "leads", table: "leads", label: "Leads & Enquiries",
    description: "Buyer enquiries with stage, deal value and assigned agent.",
    columns: ["id", "full_name", "phone", "email", "budget", "property_type", "property_id", "agent_id", "status", "stage", "deal_value", "commission", "expected_close_date", "created_at"],
  },
  {
    id: "profiles", table: "profiles", label: "Users",
    description: "Registered user profiles with contact details and ban status.",
    columns: ["user_id", "full_name", "email", "phone", "city", "is_verified", "is_banned", "created_at"],
  },
  {
    id: "sponsorships", table: "sponsorships", label: "Sponsorships & Payments",
    description: "Paid promotions with plan, amount and payment status.",
    columns: ["id", "user_id", "listing_id", "plan_name", "amount", "duration_days", "status", "payment_status", "starts_at", "expires_at", "created_at"],
  },
  {
    id: "update_requests", table: "property_update_requests", label: "Update Requests",
    description: "Owner-submitted listing changes with review outcome.",
    columns: ["id", "listing_id", "user_id", "status", "admin_note", "reviewed_by", "reviewed_at", "created_at"],
  },
  {
    id: "audit", table: "admin_activity_log", label: "Admin Activity Log",
    description: "Full trail of admin actions for compliance reporting.",
    columns: ["id", "admin_id", "action", "entity_type", "entity_id", "created_at"],
  },
  {
    id: "articles", table: "articles", label: "Articles",
    description: "Blog content with status, category and view counts.",
    columns: ["id", "title", "slug", "category", "status", "author_name", "views", "published_at", "created_at"],
  },
];

const AdminDataExport = () => {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const run = async (src: Source) => {
    setBusy(src.id);
    const { data, error } = await supabase
      .from(src.table as any)
      .select(src.columns.join(","))
      .order("created_at", { ascending: false })
      .limit(5000);
    setBusy(null);

    if (error) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
      return;
    }
    const rows = (data as any[]) || [];
    if (!rows.length) {
      toast({ title: "Nothing to export", description: `No records found in ${src.label}.` });
      return;
    }
    downloadCsv(stamped(src.id), rows, src.columns);
    setCounts(prev => ({ ...prev, [src.id]: rows.length }));
    toast({ title: "Export ready", description: `${rows.length} ${src.label.toLowerCase()} rows downloaded.` });
  };

  const exportAll = async () => {
    for (const src of SOURCES) {
      // eslint-disable-next-line no-await-in-loop
      await run(src);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Data Export Centre</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Download platform data as Excel-ready CSV for reporting, accounting and compliance. Limited to the 5,000 most recent records per export.
            </p>
          </div>
        </div>
        <button
          onClick={exportAll}
          disabled={!!busy}
          className="btn-navy px-4 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 justify-center disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export everything
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {SOURCES.map(src => (
          <div key={src.id} className="bg-card rounded-2xl border border-border p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-4 h-4 text-accent" />
              <h4 className="font-semibold text-sm">{src.label}</h4>
            </div>
            <p className="text-xs text-muted-foreground flex-1">{src.description}</p>
            {counts[src.id] !== undefined && (
              <p className="text-[11px] text-muted-foreground mt-2">Last export: {counts[src.id]} rows</p>
            )}
            <button
              onClick={() => run(src)}
              disabled={!!busy}
              className="mt-4 w-full px-4 py-2 rounded-xl border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy === src.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDataExport;
