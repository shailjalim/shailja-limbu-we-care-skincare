import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getContentById } from '../services/api';

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getContentById(id);
        setArticle(response);
      } catch (err) {
        setError(err.message || 'Unable to load article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading article...</div>;
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-red-500">
        {error || 'Content not found'}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/content')}
            className="px-6 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition"
          >
            Back to articles
          </button>
          <Link
            to="/dashboard"
            className="px-6 py-3 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-50 transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-pink-600 hover:text-pink-700"
        >
          ← Back
        </button>
        <Link to="/content" className="text-sm font-medium text-gray-500 hover:text-pink-600">
          Browse all articles
        </Link>
      </div>

      <article className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-700">
            {article.category}
          </span>
          {article.tags?.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <p className="text-sm text-gray-500 mb-8">
          Published {new Date(article.createdAt || Date.now()).toLocaleDateString()}
        </p>

        <div className="prose max-w-none prose-p:text-gray-700 prose-p:leading-7 whitespace-pre-line">
          {article.content}
        </div>
      </article>
    </div>
  );
};

export default ContentDetail;