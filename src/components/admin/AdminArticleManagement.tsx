import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "./RichTextEditor";
import { Plus, Edit, Trash2, Eye, Save, X, Upload, FileText, Globe, Archive } from "lucide-react";

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
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", category: "Market News",
    status: "draft" as "draft" | "published" | "archived", author_name: "",
  });

  const categories = ["Market News", "Investment Guide", "Legal", "Interior Design", "Tax & Policy", "Buyer Guide", "Industry Update"];

  useEffect(() => { fetchArticles(); }, []);

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
    setForm({ title: "", slug: "", excerpt: "", content: "", category: "Market News", status: "draft", author_name: "" });
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
