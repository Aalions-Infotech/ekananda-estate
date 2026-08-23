// Lightweight CSV export helpers used across admin & agent dashboards.

const escapeCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let str: string;
  if (typeof value === "object") {
    try { str = JSON.stringify(value); } catch { str = String(value); }
  } else {
    str = String(value);
  }
  str = str.replace(/\r?\n/g, " ").trim();
  if (/[",;]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

export const toCsv = (rows: Record<string, unknown>[], columns?: string[]): string => {
  if (!rows.length) return "";
  const cols = columns?.length ? columns : Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const header = cols.map(escapeCell).join(",");
  const body = rows.map(r => cols.map(c => escapeCell(r[c])).join(",")).join("\n");
  return `${header}\n${body}`;
};

export const downloadCsv = (filename: string, rows: Record<string, unknown>[], columns?: string[]) => {
  const csv = toCsv(rows, columns);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const stamped = (base: string) => `${base}-${new Date().toISOString().slice(0, 10)}.csv`;
