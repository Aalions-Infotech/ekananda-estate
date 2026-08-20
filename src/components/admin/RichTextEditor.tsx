import { useRef, useEffect, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, Link2, Link2Off, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Quote, Code, Image as ImageIcon,
  Undo2, Redo2, Heading1, Heading2, Heading3, Pilcrow, Minus, Eraser, Palette, Highlighter,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const FONTS = [
  { label: "Default", value: "" },
  { label: "Sans Serif", value: "Inter, system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Monospace", value: "'JetBrains Mono', Consolas, monospace" },
  { label: "Display", value: "'Playfair Display', Georgia, serif" },
];

const SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "Huge", value: "6" },
];

const COLORS = ["#0f172a", "#475569", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0891b2", "#2563eb", "#7c3aed", "#db2777", "#ffffff"];

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showColors, setShowColors] = useState<"text" | "bg" | null>(null);
  const [sourceMode, setSourceMode] = useState(false);

  // Load external value only when it differs from the live DOM (avoids caret jumps)
  useEffect(() => {
    if (ref.current && !sourceMode && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value, sourceMode]);

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL (https://...)");
    if (!url) return;
    const safe = /^(https?:|mailto:|tel:|\/)/i.test(url) ? url : `https://${url}`;
    exec("createLink", safe);
  };

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    exec("insertImage", url);
  };

  const Btn = ({ onClick, title, active, children }: any) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${active ? "bg-muted text-accent" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );

  const Sep = () => <span className="w-px h-5 bg-border mx-0.5" />;
  const selectClass = "text-xs bg-background border border-border rounded-lg px-1.5 py-1 outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/40 relative">
        <Btn title="Undo" onClick={() => exec("undo")}><Undo2 className="w-4 h-4" /></Btn>
        <Btn title="Redo" onClick={() => exec("redo")}><Redo2 className="w-4 h-4" /></Btn>
        <Sep />
        <Btn title="Bold" onClick={() => exec("bold")}><Bold className="w-4 h-4" /></Btn>
        <Btn title="Italic" onClick={() => exec("italic")}><Italic className="w-4 h-4" /></Btn>
        <Btn title="Underline" onClick={() => exec("underline")}><Underline className="w-4 h-4" /></Btn>
        <Btn title="Strikethrough" onClick={() => exec("strikeThrough")}><Strikethrough className="w-4 h-4" /></Btn>
        <Sep />
        <Btn title="Heading 1" onClick={() => exec("formatBlock", "<h1>")}><Heading1 className="w-4 h-4" /></Btn>
        <Btn title="Heading 2" onClick={() => exec("formatBlock", "<h2>")}><Heading2 className="w-4 h-4" /></Btn>
        <Btn title="Heading 3" onClick={() => exec("formatBlock", "<h3>")}><Heading3 className="w-4 h-4" /></Btn>
        <Btn title="Paragraph" onClick={() => exec("formatBlock", "<p>")}><Pilcrow className="w-4 h-4" /></Btn>
        <Btn title="Quote" onClick={() => exec("formatBlock", "<blockquote>")}><Quote className="w-4 h-4" /></Btn>
        <Btn title="Code block" onClick={() => exec("formatBlock", "<pre>")}><Code className="w-4 h-4" /></Btn>
        <Sep />
        <Btn title="Bullet list" onClick={() => exec("insertUnorderedList")}><List className="w-4 h-4" /></Btn>
        <Btn title="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered className="w-4 h-4" /></Btn>
        <Sep />
        <Btn title="Align left" onClick={() => exec("justifyLeft")}><AlignLeft className="w-4 h-4" /></Btn>
        <Btn title="Align center" onClick={() => exec("justifyCenter")}><AlignCenter className="w-4 h-4" /></Btn>
        <Btn title="Align right" onClick={() => exec("justifyRight")}><AlignRight className="w-4 h-4" /></Btn>
        <Btn title="Justify" onClick={() => exec("justifyFull")}><AlignJustify className="w-4 h-4" /></Btn>
        <Sep />
        <Btn title="Insert link" onClick={addLink}><Link2 className="w-4 h-4" /></Btn>
        <Btn title="Remove link" onClick={() => exec("unlink")}><Link2Off className="w-4 h-4" /></Btn>
        <Btn title="Insert image" onClick={addImage}><ImageIcon className="w-4 h-4" /></Btn>
        <Btn title="Divider" onClick={() => exec("insertHorizontalRule")}><Minus className="w-4 h-4" /></Btn>
        <Sep />
        <Btn title="Text color" active={showColors === "text"} onClick={() => setShowColors(showColors === "text" ? null : "text")}><Palette className="w-4 h-4" /></Btn>
        <Btn title="Highlight" active={showColors === "bg"} onClick={() => setShowColors(showColors === "bg" ? null : "bg")}><Highlighter className="w-4 h-4" /></Btn>
        <Sep />
        <select
          className={selectClass}
          defaultValue=""
          onChange={(e) => { exec("fontName", e.target.value); e.target.value = ""; }}
        >
          <option value="" disabled>Font</option>
          {FONTS.filter(f => f.value).map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
        </select>
        <select
          className={selectClass}
          defaultValue=""
          onChange={(e) => { exec("fontSize", e.target.value); e.target.value = ""; }}
        >
          <option value="" disabled>Size</option>
          {SIZES.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
        </select>
        <Sep />
        <Btn title="Clear formatting" onClick={() => exec("removeFormat")}><Eraser className="w-4 h-4" /></Btn>
        <button
          type="button"
          onClick={() => { if (sourceMode && ref.current) ref.current.innerHTML = value; setSourceMode(!sourceMode); }}
          className={`ml-auto text-[11px] px-2 py-1 rounded-lg border border-border ${sourceMode ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted"}`}
        >
          {sourceMode ? "Visual" : "HTML"}
        </button>

        {showColors && (
          <div className="absolute top-full left-2 mt-1 z-20 bg-card border border-border rounded-xl p-2 shadow-lg grid grid-cols-6 gap-1.5">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { exec(showColors === "text" ? "foreColor" : "hiliteColor", c); setShowColors(null); }}
                className="w-6 h-6 rounded-md border border-border"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        )}
      </div>

      {sourceMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="w-full p-4 bg-background font-mono text-xs outline-none resize-y"
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          data-placeholder={placeholder || "Write your article..."}
          className="rte-content min-h-[320px] max-h-[600px] overflow-y-auto p-4 text-sm outline-none prose prose-sm max-w-none dark:prose-invert"
        />
      )}
    </div>
  );
};

export default RichTextEditor;
