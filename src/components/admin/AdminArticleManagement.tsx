import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "./RichTextEditor";
import { Plus, Edit, Trash2, Eye, Save, X, Upload, FileText, Globe, Archive, ListChecks, HelpCircle, Search, Megaphone, Building2, Tag } from "lucide-react";

interface AdminArticleManagementProps {
  adminId: string;
}

const AdminArticleManagement = ({ adminId }: AdminArticleManagementProps) => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [propertyOptions, setPropertyOptions] = useState<any[]>([]);
  const emptyForm = {
    title: "", slug: "", excerpt: "", content: "", category: "Market News",
    status: "draft" as "draft" | "published" | "archived", author_name: "",
    seo_title: "", seo_description: "", tags: "", hindi_slug: "", related_locality: "",
    show_toc: true,
    cta_title: "", cta_text: "", cta_button_label: "", cta_button_url: "",
    key_takeaways: [] as string[],
    faqs: [] as { question: string; answer: string }[],
    featured_property_ids: [] as string[],
  };
  const [form, setForm] = useState(emptyForm);

  const categories = ["Market News", "Investment Guide", "Legal", "Interior Design", "Tax & Policy", "Buyer Guide", "Industry Update"];

  useEffect(() => {
    fetchArticles();
    (async () => {
      const { data } = await (supabase.from("property_listings") as any)
        .select("id, title, locality, city, price")
        .order("created_at", { ascending: false })
        .limit(100);
      setPropertyOptions(data || []);
    })();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await (supabase.from("articles") as any).select("*").order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

  const calcReadTime = (content: string) =>
    Math.max(1, Math.ceil(stripHtml(content).split(/\s+/).filter(Boolean).length / 200));

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (article: any) => {
    setForm({
      title: article.title || "",
      slug: article.slug || "",
      excerpt: article.excerpt || "",
      content: article.content || "",
      category: article.category || "Market News",
      status: article.status || "draft",
      author_name: article.author_name || "",
      seo_title: article.seo_title || "",
      seo_description: article.seo_description || "",
      tags: (article.tags || []).join(", "),
      hindi_slug: article.hindi_slug || "",
      related_locality: article.related_locality || "",
      show_toc: article.show_toc !== false,
      cta_title: article.cta_title || "",
      cta_text: article.cta_text || "",
      cta_button_label: article.cta_button_label || "",
      cta_button_url: article.cta_button_url || "",
      key_takeaways: article.key_takeaways || [],
      faqs: article.faqs || [],
      featured_property_ids: article.featured_property_ids || [],
    });
    setEditingId(article.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !stripHtml(form.content)) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `articles/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("article-images").upload(path, imageFile);
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("article-images").getPublicUrl(path);
          imageUrl = urlData.publicUrl;
        }
      }

      const slug = form.slug || generateSlug(form.title);
      const readTime = calcReadTime(form.content);
      const publishedAt = form.status === "published" ? new Date().toISOString() : null;

      const payload: any = {
        title: form.title,
        slug,
        excerpt: form.excerpt || stripHtml(form.content).substring(0, 160),
        content: form.content,
        category: form.category,
        status: form.status,
        author_id: adminId,
        author_name: form.author_name || "Admin",
        read_time: readTime,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        hindi_slug: form.hindi_slug || null,
        related_locality: form.related_locality || null,
        show_toc: form.show_toc,
        cta_title: form.cta_title || null,
        cta_text: form.cta_text || null,
        cta_button_label: form.cta_button_label || null,
        cta_button_url: form.cta_button_url || null,
        key_takeaways: form.key_takeaways.map(t => t.trim()).filter(Boolean),
        faqs: form.faqs.filter(f => f.question.trim() && f.answer.trim()),
        featured_property_ids: form.featured_property_ids,
        ...(imageUrl && { featured_image_url: imageUrl }),
        ...(publishedAt && { published_at: publishedAt }),
      };

      if (editingId) {
        await (supabase.from("articles") as any).update(payload).eq("id", editingId);
        toast({ title: "Article updated!" });
      } else {
        await (supabase.from("articles") as any).insert(payload);
        toast({ title: "Article created!" });
      }

      resetForm();
      fetchArticles();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Permanently delete this article?")) return;
    await (supabase.from("articles") as any).delete().eq("id", id);
    toast({ title: "Article deleted" });
    fetchArticles();
  };

  const togglePublish = async (article: any) => {
    const newStatus = article.status === "published" ? "draft" : "published";
    await (supabase.from("articles") as any).update({
      status: newStatus,
      ...(newStatus === "published" ? { published_at: new Date().toISOString() } : {}),
    }).eq("id", article.id);
    toast({ title: newStatus === "published" ? "Article published!" : "Article unpublished" });
    fetchArticles();
  };

  const fieldClass = "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg">{articles.length} Articles</h3>
          <p className="text-xs text-muted-foreground">Create, edit, publish and manage news articles</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "New Article"}
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl border border-accent/30 p-6 space-y-4">
          <h4 className="font-display font-semibold">{editingId ? "Edit Article" : "Create Article"}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) }))} placeholder="Article title..." className={fieldClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={fieldClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={fieldClass}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Author Name</label>
              <input value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} placeholder="Author name" className={fieldClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className={fieldClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Excerpt</label>
              <input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short description (auto-generated if left blank)" className={fieldClass} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Content *</label>
              <RichTextEditor
                value={form.content}
                onChange={html => setForm(f => ({ ...f, content: html }))}
                placeholder="Write your article... use the toolbar for bold, italic, colors, links and more"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {stripHtml(form.content).split(/\s+/).filter(Boolean).length} words · ~{calcReadTime(form.content)} min read
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Featured Image</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-xs" />
            </div>

            {/* Key Takeaways */}
            <div className="md:col-span-2 rounded-2xl border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold flex items-center gap-2"><ListChecks className="w-4 h-4 text-accent" /> Key Takeaways</label>
                <button type="button" onClick={() => setForm(f => ({ ...f, key_takeaways: [...f.key_takeaways, ""] }))} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-muted">+ Add point</button>
              </div>
              {form.key_takeaways.length === 0 && <p className="text-xs text-muted-foreground">Shown as a highlighted summary box at the top of the article.</p>}
              {form.key_takeaways.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input value={t} onChange={e => setForm(f => ({ ...f, key_takeaways: f.key_takeaways.map((x, xi) => xi === i ? e.target.value : x) }))} placeholder={`Takeaway ${i + 1}`} className={fieldClass} />
                  <button type="button" onClick={() => setForm(f => ({ ...f, key_takeaways: f.key_takeaways.filter((_, xi) => xi !== i) }))} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            {/* FAQs */}
            <div className="md:col-span-2 rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold flex items-center gap-2"><HelpCircle className="w-4 h-4 text-accent" /> FAQs (adds Google FAQ rich-results markup)</label>
                <button type="button" onClick={() => setForm(f => ({ ...f, faqs: [...f.faqs, { question: "", answer: "" }] }))} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-muted">+ Add FAQ</button>
              </div>
              {form.faqs.map((f2, i) => (
                <div key={i} className="space-y-2 border border-border rounded-xl p-3">
                  <div className="flex gap-2">
                    <input value={f2.question} onChange={e => setForm(f => ({ ...f, faqs: f.faqs.map((x, xi) => xi === i ? { ...x, question: e.target.value } : x) }))} placeholder="Question" className={fieldClass} />
                    <button type="button" onClick={() => setForm(f => ({ ...f, faqs: f.faqs.filter((_, xi) => xi !== i) }))} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10"><X className="w-4 h-4" /></button>
                  </div>
                  <textarea value={f2.answer} onChange={e => setForm(f => ({ ...f, faqs: f.faqs.map((x, xi) => xi === i ? { ...x, answer: e.target.value } : x) }))} placeholder="Answer" rows={3} className={fieldClass} />
                </div>
              ))}
            </div>

            {/* CTA block */}
            <div className="md:col-span-2 rounded-2xl border border-border p-4 space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2"><Megaphone className="w-4 h-4 text-accent" /> Call-to-Action Block</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={form.cta_title} onChange={e => setForm(f => ({ ...f, cta_title: e.target.value }))} placeholder="CTA heading" className={fieldClass} />
                <input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} placeholder="CTA supporting text" className={fieldClass} />
                <input value={form.cta_button_label} onChange={e => setForm(f => ({ ...f, cta_button_label: e.target.value }))} placeholder="Button label (e.g. Get Property Details)" className={fieldClass} />
                <input value={form.cta_button_url} onChange={e => setForm(f => ({ ...f, cta_button_url: e.target.value }))} placeholder="Button link (e.g. /buy or https://wa.me/...)" className={fieldClass} />
              </div>
            </div>

            {/* Featured properties inside article */}
            <div className="md:col-span-2 rounded-2xl border border-border p-4 space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-accent" /> Showcase Properties Inside Article</label>
              <input value={form.related_locality} onChange={e => setForm(f => ({ ...f, related_locality: e.target.value }))} placeholder="Locality label (e.g. Gomti Nagar)" className={fieldClass} />
              <div className="max-h-52 overflow-y-auto space-y-1 border border-border rounded-xl p-2">
                {propertyOptions.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg hover:bg-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured_property_ids.includes(p.id)}
                      onChange={e => setForm(f => ({
                        ...f,
                        featured_property_ids: e.target.checked
                          ? [...f.featured_property_ids, p.id]
                          : f.featured_property_ids.filter(id => id !== p.id),
                      }))}
                    />
                    <span className="truncate">{p.title} · {p.locality || p.city}</span>
                  </label>
                ))}
                {propertyOptions.length === 0 && <p className="text-xs text-muted-foreground p-2">No listings available yet.</p>}
              </div>
            </div>

            {/* SEO & extras */}
            <div className="md:col-span-2 rounded-2xl border border-border p-4 space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2"><Search className="w-4 h-4 text-accent" /> SEO & Extras</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} placeholder="SEO title (max 60 chars)" maxLength={70} className={fieldClass} />
                  <p className="text-[11px] text-muted-foreground mt-1">{form.seo_title.length}/60</p>
                </div>
                <div>
                  <input value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} placeholder="Meta description (max 160 chars)" maxLength={180} className={fieldClass} />
                  <p className="text-[11px] text-muted-foreground mt-1">{form.seo_description.length}/160</p>
                </div>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Tags, comma separated" className={fieldClass} />
                <input value={form.hindi_slug} onChange={e => setForm(f => ({ ...f, hindi_slug: e.target.value }))} placeholder="Hindi version slug (optional)" className={fieldClass} />
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={form.show_toc} onChange={e => setForm(f => ({ ...f, show_toc: e.target.checked }))} />
                Show auto Table of Contents (built from H2/H3 headings)
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(article => (
            <div key={article.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start gap-4">
                {article.featured_image_url && (
                  <img src={article.featured_image_url} alt="" className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-display font-bold text-sm">{article.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      article.status === "published" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                      article.status === "archived" ? "bg-muted text-muted-foreground border border-border" :
                      "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}>{article.status}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent border border-accent/20">{article.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{article.excerpt}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{article.author_name || "Admin"}</span>
                    <span>{article.read_time} min read</span>
                    <span>{new Date(article.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => togglePublish(article)} className={`p-2 rounded-xl hover:bg-muted ${article.status === "published" ? "text-emerald-500" : "text-muted-foreground"}`} title={article.status === "published" ? "Unpublish" : "Publish"}>
                    <Globe className="w-4 h-4" />
                  </button>
                  <button onClick={() => startEdit(article)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteArticle(article.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No articles yet. Click "New Article" to create your first one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminArticleManagement;
