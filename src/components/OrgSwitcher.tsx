import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Check, Plus, Settings, Users } from "lucide-react";
import { useOrg } from "@/context/OrgContext";

export default function OrgSwitcher({ onHome = false }: { onHome?: boolean }) {
  const navigate = useNavigate();
  const { memberships, currentOrg, setCurrentOrgId, loading } = useOrg();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (loading) return null;

  if (memberships.length === 0) {
    return (
      <button
        onClick={() => navigate("/org/create")}
        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
          onHome ? "border-white/30 text-white hover:bg-white/10" : "border-border text-foreground hover:bg-muted"
        }`}
        title="Create your agency"
      >
        <Building2 className="w-3.5 h-3.5" /> Create Agency
      </button>
    );
  }

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all max-w-[180px] ${
          onHome ? "border-white/30 text-white hover:bg-white/10" : "border-border text-foreground hover:bg-muted"
        }`}
      >
        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{currentOrg?.organization.name || "Personal"}</span>
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute right-0 md:left-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg p-2 w-64 z-50 animate-slide-up">
          <p className="text-xs font-semibold text-muted-foreground px-2 py-1">YOUR AGENCIES</p>
          {memberships.map((m) => (
            <button
              key={m.org_id}
              onClick={() => {
                setCurrentOrgId(m.org_id);
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm hover:bg-muted text-left"
            >
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{m.organization.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
              </div>
              {currentOrg?.org_id === m.org_id && <Check className="w-4 h-4 text-accent" />}
            </button>
          ))}
          <div className="border-t border-border mt-2 pt-2 space-y-1">
            {currentOrg && (
              <>
                <button
                  onClick={() => {
                    navigate("/org/settings");
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm hover:bg-muted"
                >
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button
                  onClick={() => {
                    navigate("/org/members");
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm hover:bg-muted"
                >
                  <Users className="w-4 h-4" /> Members & Branches
                </button>
              </>
            )}
            <button
              onClick={() => {
                navigate("/org/create");
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm hover:bg-muted text-accent"
            >
              <Plus className="w-4 h-4" /> Create new agency
            </button>
          </div>
        </div>
      )}
    </div>
  );
}