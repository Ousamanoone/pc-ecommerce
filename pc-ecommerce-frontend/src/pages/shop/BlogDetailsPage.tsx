import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Calendar,
  User,
  Eye,
  ArrowLeft,
  Share2,
  Tag,
  BookOpen,
} from 'lucide-react';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  views: number;
  tags: string[];
  createdAt: string;
}

export const BlogDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await api.get<Blog>(`/blogs/${slug}`);
        setBlog(res.data);
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="py-20 text-center space-y-4">
        <BookOpen className="w-12 h-12 mx-auto text-base-content/30" />
        <h2 className="text-xl font-black text-base-content">Article Not Found</h2>
        <Link to="/" className="btn btn-primary btn-sm rounded-xl">
          Back to Storefront
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-6 space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/60 hover:text-primary mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-primary badge-sm font-bold uppercase text-[9px]">
            {blog.category}
          </span>
          <span className="text-xs text-base-content/50 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(blog.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-base-content tracking-tight leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center justify-between border-b border-base-content/10 py-4 mt-2 text-xs text-base-content/60">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>Written by <strong className="text-base-content">{blog.author}</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {blog.views || 0} views
            </span>
          </div>
        </div>
      </div>

      {blog.coverImage && (
        <div className="rounded-3xl overflow-hidden border border-base-content/10 shadow-lg">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-80 sm:h-96 object-cover"
          />
        </div>
      )}

      <div className="p-4 bg-base-200/60 rounded-2xl border-l-4 border-primary text-sm italic text-base-content/80">
        {blog.summary}
      </div>

      <div className="text-sm sm:text-base leading-relaxed text-base-content/90 whitespace-pre-line space-y-4">
        {blog.content}
      </div>

      {blog.tags && blog.tags.length > 0 && (
        <div className="flex items-center gap-2 pt-6 border-t border-base-content/10 flex-wrap">
          <Tag className="w-4 h-4 text-primary" />
          {blog.tags.map((t, idx) => (
            <span key={idx} className="badge badge-outline badge-xs font-semibold py-2">
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default BlogDetailsPage;