import { useEffect, useMemo, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import { blogApi } from '../../services/blog.api';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

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

  return (
    <>
      <Seo title="Blogs | Hirexo" description="Admin content management for blog posts." />
      <DashboardHeader
        title="Blog Management"
        description="Create, edit, publish, and remove blog posts for the public site."
        actions={<Button variant="secondary" onClick={resetForm}>New blog post</Button>}
      />

      <Card>
        <form className="form-grid" onSubmit={onSubmit}>
          <Input label="Title" value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} required />
          <Textarea label="Excerpt" value={form.excerpt} onChange={(e) => setForm((current) => ({ ...current, excerpt: e.target.value }))} rows={3} />
          <Textarea label="Content" value={form.content} onChange={(e) => setForm((current) => ({ ...current, content: e.target.value }))} rows={10} required />
          <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => setForm((current) => ({ ...current, tags: e.target.value }))} placeholder="hiring, careers, interview" />

          <div className="grid-2">
            <Input label="Image URL" value={form.imageUrl} onChange={(e) => setForm((current) => ({ ...current, imageUrl: e.target.value }))} />
            <Input label="Image alt text" value={form.imageAlt} onChange={(e) => setForm((current) => ({ ...current, imageAlt: e.target.value }))} />
          </div>

          <div className="grid-2">
            <label className="field checkbox-row">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((current) => ({ ...current, featured: e.target.checked }))} />
              <span>Featured post</span>
            </label>
            <label className="field checkbox-row">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm((current) => ({ ...current, published: e.target.checked }))} />
              <span>Publish immediately</span>
            </label>
          </div>

          <div className="dashboard-actions">
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update blog' : 'Create blog'}</Button>
            {editing ? <Button type="button" variant="secondary" onClick={resetForm}>Cancel edit</Button> : null}
          </div>
        </form>
      </Card>

      <Card>
        {loading ? <Loader label="Loading blogs..." /> : null}

        {!loading && error ? (
          <div className="empty-state">
            <h3>Could not load blog posts</h3>
            <p>{error}</p>
            <Button onClick={loadBlogs}>Retry</Button>
          </div>
        ) : null}

        {!loading && !error && !blogs.length ? (
          <div className="empty-state">
            <h3>No blog posts yet</h3>
            <p>Create your first post using the form above.</p>
          </div>
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
                      <Badge tone="neutral">{blog.published ? 'Published' : 'Draft'}</Badge>
                    </td>
                    <td>{blog.featured ? 'Yes' : 'No'}</td>
                    <td>{blog.viewCount || 0}</td>
                    <td>{formatDate(blog.publishedAt || blog.createdAt)}</td>
                    <td>
                      <div className="form-links">
                        <Button size="sm" variant="secondary" onClick={() => onEdit(blog)}>Edit</Button>
                        {!blog.published ? (
                          <Button size="sm" variant="secondary" disabled={publishingId === blog._id} onClick={() => onPublish(blog._id)}>
                            {publishingId === blog._id ? 'Publishing...' : 'Publish'}
                          </Button>
                        ) : null}
                        <Button size="sm" variant="secondary" disabled={deletingId === blog._id} onClick={() => onDelete(blog._id)}>
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
