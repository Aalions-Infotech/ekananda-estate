import { useCallback, useEffect, useState } from "react";

export interface RecentProperty {
  id: string;
  title: string;
  image?: string | null;
  price?: number | null;
  locality?: string | null;
  city?: string | null;
  property_type?: string | null;
  listing_type?: string | null;
  area?: number | null;
  area_unit?: string | null;
  viewedAt: number;
}

const KEY = "ee_recently_viewed";
const MAX = 12;

const read = (): RecentProperty[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const trackRecentlyViewed = (item: Omit<RecentProperty, "viewedAt">) => {
  if (!item?.id) return;
  try {
    const next = [{ ...item, viewedAt: Date.now() }, ...read().filter(p => p.id !== item.id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("recently-viewed-updated"));
  } catch {
    /* storage unavailable — ignore */
  }
};

export const useRecentlyViewed = (excludeId?: string) => {
  const [items, setItems] = useState<RecentProperty[]>([]);

  const refresh = useCallback(() => {
    setItems(read().filter(p => p.id !== excludeId));
  }, [excludeId]);

  useEffect(() => {
    refresh();
    window.addEventListener("recently-viewed-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("recently-viewed-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("recently-viewed-updated"));
  }, []);

  return { items, clear, refresh };
};
