import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

function getCategoryLabel(category) {
  if (!category) return 'Blog';
  if (typeof category === 'string') return category;
  return category.name || category.slug || 'Blog';
}

export default function BlogCard({ post }) {
  const fallback = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop';
  const imageUrl = post.image?.url || fallback;
  
  return (
    <article className="blog-card card">
      <div className="blog-card-image">
        <img
          src={imageUrl}
          alt={post.image?.alt || post.title}
          loading="lazy"
          onError={(e) => {
            const el = e.currentTarget;
            if (el.src !== fallback) {
              el.onerror = null;
              el.src = fallback;
            } else {
              el.style.display = 'none';
            }
          }}
        />
      </div>
      <div className="blog-card-content">
        {post.publishedAt && (
          <span className="blog-card-date">📅 {formatDate(post.publishedAt)}</span>
        )}
        <h3>{post.title}</h3>
        <p className="blog-excerpt">{post.excerpt || post.content?.substring(0, 150) + '...'}</p>
        <Link className="link-button" to={`/blog/${post.slug}`}>Read more →</Link>
      </div>
    </article>
  );
}
