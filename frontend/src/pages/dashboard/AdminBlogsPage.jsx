import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import SectionHeader from '../../components/ui/SectionHeader';
import { blogApi } from '../../services/blog.api';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';
import { FileText, CheckCircle, Edit, Eye, Layers, Star, ListChecks, FilePlus2 } from 'lucide-react';

const emptyForm = {
  id: '',
  title: '',
  excerpt: '',
  content: '',
  tags: '',
  imageUrl: '',
  imageAlt: '',
  featured: false,
  published: false
};

export default function AdminBlogsPage() {
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [publishingId, setPublishingId] = useState('');
  const [form, setForm] = useState(emptyForm);

  const editing = useMemo(() => Boolean(form.id), [form.id]);

  const loadBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await blogApi.listAdmin();
      setBlogs(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load blogs.');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    if (location.pathname.endsWith('/new')) {
      setForm(emptyForm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const onEdit = (blog) => {
    setForm({
      id: blog._id,
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      tags: (blog.tags || []).join(', '),
      imageUrl: blog.image?.url || '',
      imageAlt: blog.image?.alt || '',
      featured: Boolean(blog.featured),
      published: Boolean(blog.published)
    });
  };

  const resetForm = () => setForm(emptyForm);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }
    if ((form.content || '').trim().length < 100) {
      toast.error('Content must be at least 100 characters.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      featured: form.featured,
      published: form.published,
      image: {
        url: form.imageUrl.trim(),
        alt: form.imageAlt.trim()
      }
    };

    setSubmitting(true);
    try {
      if (editing) {
        const previous = blogs.find((blog) => blog._id === form.id);
        await blogApi.update(form.id, payload);
        if (form.published && !previous?.published) {
          await blogApi.publish(form.id);
        }
        toast.success('Blog updated successfully.');
      } else {
        const created = await blogApi.create(payload);
        const newId = created.data?._id;
        if (form.published && newId) {
          await blogApi.publish(newId);
        }
        toast.success('Blog created successfully.');
      }
      resetForm();
      await loadBlogs();
    } catch (err) {
      toast.error(err.message || 'Failed to save blog.');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    const confirmed = window.confirm('Delete this blog post? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await blogApi.remove(id);
      toast.success('Blog deleted successfully.');
      await loadBlogs();
      if (form.id === id) {
        resetForm();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete blog.');
    } finally {
      setDeletingId('');
    }
  };

  const onPublish = async (id) => {
    setPublishingId(id);
    try {
      await blogApi.publish(id);
      toast.success('Blog published successfully.');
      await loadBlogs();
    } catch (err) {
      toast.error(err.message || 'Failed to publish blog.');
    } finally {
      setPublishingId('');
    }
  };

  // Stat cards for summary
  const publishedCount = blogs.filter(b => b.published).length;
  const draftCount = blogs.filter(b => !b.published).length;
  const featuredCount = blogs.filter(b => b.featured).length;
  const statCards = [
    { label: 'Total Posts', value: blogs.length, icon: FileText, tone: 'default' },
    { label: 'Published', value: publishedCount, icon: CheckCircle, tone: 'success' },
    { label: 'Drafts', value: draftCount, icon: Edit, tone: 'neutral' },
    { label: 'Featured', value: featuredCount, icon: Star, tone: 'primary' },
  ];

  return (
    <>
      <Seo title="Blogs | Hirexo" description="Admin content management for blog posts." />
      <DashboardHeader
        title="Blog Management"
        description="Create, edit, publish, and manage blog posts for the public site."
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={resetForm}><FilePlus2 size={16} style={{marginRight: 6}} /> New Post</Button>
            <Button variant="ghost"><Eye size={16} style={{marginRight: 6}} /> View All</Button>
          </div>
        }
      />

      {/* Stat cards row */}
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1.1rem', marginBottom: '1.5rem' }}>
        {statCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} tone={card.tone} />
        ))}
      </div>

      {/* Blog Management Workspace */}
      <div className="form-grid" style={{ gridTemplateColumns: '2.1fr 1.1fr', gap: '2.2rem', alignItems: 'start', marginBottom: '2.2rem' }}>
        {/* Main Editor Area */}
        <Card style={{ padding: 0, overflow: 'visible' }}>
          <form className="form-grid" style={{ padding: '1.5rem 1.2rem', gap: '1.3rem' }} onSubmit={onSubmit}>
            <SectionHeader eyebrow={editing ? 'Edit Blog Post' : 'New Blog Post'} title={editing ? 'Edit Content' : 'Create Content'} align="left" />
            {/* Basic Info */}
            <div>
              <Input label="Title" value={form.title} onChange={e => setForm(current => ({ ...current, title: e.target.value }))} required />
              <Input label="Tags (comma separated)" value={form.tags} onChange={e => setForm(current => ({ ...current, tags: e.target.value }))} placeholder="hiring, careers, interview" />
            </div>
            {/* Excerpt */}
            <div>
              <Textarea label="Excerpt" value={form.excerpt} onChange={e => setForm(current => ({ ...current, excerpt: e.target.value }))} rows={3} />
              <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>Short summary, max 200 characters.</div>
            </div>
            {/* Content Editor */}
            <div>
              <label className="field">
                <span className="field-label">Content</span>
                <textarea
                  className="input textarea"
                  style={{ minHeight: 220, fontFamily: 'inherit', fontSize: 16, background: '#f8fcf9', border: '1.5px solid var(--border)', boxShadow: '0 2px 8px rgba(26,138,86,0.04)' }}
                  value={form.content}
                  onChange={e => setForm(current => ({ ...current, content: e.target.value }))}
                  required
                />
              </label>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>Write the full blog content here. Minimum 100 characters.</div>
            </div>
            {/* Media */}
            <div className="grid-2" style={{ gap: '1.1rem' }}>
              <Input label="Image URL" value={form.imageUrl} onChange={e => setForm(current => ({ ...current, imageUrl: e.target.value }))} />
              <Input label="Image alt text" value={form.imageAlt} onChange={e => setForm(current => ({ ...current, imageAlt: e.target.value }))} />
            </div>
            {/* Editor Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Button type="submit" disabled={submitting} variant="primary">{submitting ? 'Saving...' : editing ? 'Update Blog' : 'Create Blog'}</Button>
              {editing ? <Button type="button" variant="secondary" onClick={resetForm}>Cancel Edit</Button> : null}
              <Button type="button" variant="ghost"><Eye size={15} style={{marginRight: 5}} /> Preview</Button>
            </div>
          </form>
        </Card>
        {/* Publish/Settings Panel */}
        <Card style={{ padding: '1.2rem 1.1rem', minWidth: 0 }}>
          <SectionHeader eyebrow="Publish Settings" title="Post Settings" align="left" />
          <div style={{ display: 'grid', gap: 18, marginTop: 10 }}>
            <label className="field checkbox-row" style={{ fontWeight: 600, fontSize: 15 }}>
              <input type="checkbox" checked={form.featured} onChange={e => setForm(current => ({ ...current, featured: e.target.checked }))} />
              <span>Featured Post</span>
            </label>
            <label className="field checkbox-row" style={{ fontWeight: 600, fontSize: 15 }}>
              <input type="checkbox" checked={form.published} onChange={e => setForm(current => ({ ...current, published: e.target.checked }))} />
              <span>Publish Immediately</span>
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Button type="submit" disabled={submitting} variant="primary" style={{ flex: 1 }}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="ghost" style={{ flex: 1 }}><Eye size={15} style={{marginRight: 5}} /> Preview</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Blog Posts Management Table */}
      <Card>
        <SectionHeader eyebrow="Manage Posts" title="All Blog Posts" align="left" />
        {loading ? <Loader label="Loading blogs..." /> : null}

        {!loading && error ? (
          <EmptyState title="Could not load blog posts" description={error} actionLabel="Retry" onAction={loadBlogs} />
        ) : null}

        {!loading && !error && !blogs.length ? (
          <EmptyState title="No blog posts yet" description="Create your first post using the form above." actionLabel={null} />
        ) : null}

        {!loading && !error && blogs.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Views</th>
                  <th>Published At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id}>
                    <td>
                      <strong>{blog.title}</strong>
                      <br />
                      <small>{blog.slug}</small>
                    </td>
                    <td>
                      <Badge tone={blog.published ? 'success' : 'neutral'}>{blog.published ? 'Published' : 'Draft'}</Badge>
                    </td>
                    <td>{blog.featured ? <Badge tone="primary">Featured</Badge> : <span style={{ color: 'var(--muted)' }}>No</span>}</td>
                    <td>{blog.viewCount || 0}</td>
                    <td>{formatDate(blog.publishedAt || blog.createdAt)}</td>
                    <td>
                      <div className="form-links">
                        <Button size="sm" variant="secondary" onClick={() => onEdit(blog)}><Edit size={14} style={{marginRight: 4}} /> Edit</Button>
                        {!blog.published ? (
                          <Button size="sm" variant="primary" disabled={publishingId === blog._id} onClick={() => onPublish(blog._id)}>
                            {publishingId === blog._id ? 'Publishing...' : <><CheckCircle size={14} style={{marginRight: 4}} /> Publish</>}
                          </Button>
                        ) : null}
                        <Button size="sm" variant="danger" disabled={deletingId === blog._id} onClick={() => onDelete(blog._id)}>
                          {deletingId === blog._id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </>
  );
}
