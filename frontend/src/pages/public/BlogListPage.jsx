import Seo from '../../components/ui/Seo';
import SectionHeader from '../../components/ui/SectionHeader';
import BlogCard from '../../components/blog/BlogCard';
import { blogApi } from '../../services/blog.api';
import { useEffect, useState } from 'react';
import Loader from '../../components/ui/Loader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 9;

  const loadBlogs = async (nextPage = page) => {
    setLoading(true);
    setError('');
    try {
      const skip = (nextPage - 1) * limit;
      const [listRes, featuredRes] = await Promise.all([
        blogApi.list({ skip, limit }),
        blogApi.featured()
      ]);
      setPosts(listRes.data || []);
      setTotal(listRes.pagination?.total || 0);
      setFeaturedPosts(featuredRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load blog posts.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs(page);
  }, [page]);

  const hasNext = page * limit < total;
  const hasPrev = page > 1;

  return (
    <>
      <Seo title="Blog | Hirexo" description="Career tips, hiring advice, and employer branding updates." />
      <section className="section-block blog-list-page">
        <div className="shell">
          <SectionHeader eyebrow="Blog" title="Articles for candidates and employers" description="Useful SEO content and hiring guidance." />
          {loading ? <Loader label="Loading blog posts..." /> : null}

          {!loading && error ? (
            <Card className="empty-state">
              <h3>Could not load blogs</h3>
              <p>{error}</p>
              <Button onClick={() => loadBlogs(page)}>Retry</Button>
            </Card>
          ) : null}

          {!loading && !error ? (
            <>
              {featuredPosts.length ? (
                <>
                  <h3 className="blog-list-subtitle">Featured Posts</h3>
                  <div className="grid-3 mb-1">
                    {featuredPosts.map((post) => <BlogCard key={`featured-${post.slug || post._id}`} post={post} />)}
                  </div>
                </>
              ) : null}

              {posts.length ? (
                <>
                  <div className="grid-3">
                    {posts.map((post) => <BlogCard key={post.slug || post._id} post={post} />)}
                  </div>
                  <div className="dashboard-actions mt-1">
                    <Button variant="secondary" disabled={!hasPrev} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                    <p className="m-0">Page {page}</p>
                    <Button variant="secondary" disabled={!hasNext} onClick={() => setPage((current) => current + 1)}>Next</Button>
                  </div>
                </>
              ) : (
                <Card className="empty-state">
                  <h3>No blog posts yet</h3>
                  <p>Published posts will appear here once the admin publishes them.</p>
                </Card>
              )}
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
