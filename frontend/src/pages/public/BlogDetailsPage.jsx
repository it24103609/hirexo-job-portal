import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import { blogApi } from '../../services/blog.api';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';

function getCategoryLabel(category) {
  if (!category) return 'Blog';
  if (typeof category === 'string') return category;
  return category.name || category.slug || 'Blog';
}

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const imageUrl = post?.image?.url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=700&fit=crop';

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await blogApi.getBySlug(slug);
        setPost(res.data || null);
      } catch (err) {
        setPost(null);
        setError(err.message || 'Unable to load this blog post.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) return <Loader label="Loading blog post..." />;

  return (
    <>
      <Seo
        title={`${post?.title || 'Blog'} | Hirexo`}
        description={post?.excerpt || 'Blog details'}
        image={imageUrl}
        type="article"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post?.title,
          description: post?.excerpt || 'Blog details',
          image: imageUrl,
          datePublished: post?.publishedAt || post?.createdAt,
          dateModified: post?.updatedAt || post?.publishedAt || post?.createdAt,
          publisher: {
            '@type': 'Organization',
            name: 'Hirexo'
          }
        }}
      />
      <section className="section-block">
        <div className="shell">
          {error ? (
            <Card className="empty-state">
              <h3>Blog not available</h3>
              <p>{error}</p>
              <Button as={Link} to="/blog">Back to blog list</Button>
            </Card>
          ) : null}

          {!error && !post ? (
            <Card className="empty-state">
              <h3>Blog not found</h3>
              <p>The post may be unpublished or removed.</p>
              <Button as={Link} to="/blog">Back to blog list</Button>
            </Card>
          ) : null}

          {!error && post ? (
            <Card>
              <p className="section-eyebrow">{getCategoryLabel(post.category)}</p>
              <h1>{post.title}</h1>
              <div className="blog-detail-image">
                <img src={imageUrl} alt={post.image?.alt || post.title} loading="eager" />
              </div>
              <p>{post.excerpt}</p>
              <div className="dashboard-actions mb-1">
                <Badge tone="neutral">Published: {formatDate(post.publishedAt || post.createdAt)}</Badge>
                <Badge tone="neutral">Views: {post.viewCount || 0}</Badge>
                {(post.tags || []).map((tag) => <Badge key={tag} tone="neutral">{tag}</Badge>)}
              </div>
              <div className="pre-wrap-text">{post.content}</div>
            </Card>
          ) : null}
        </div>
      </section>
    </>
  );
}
