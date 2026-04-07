import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getContent } from '../services/api';

const CATEGORY_OPTIONS = ['all', 'acne', 'dryness', 'oily', 'sensitive', 'general'];

const ContentList = () => {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};
        if (category !== 'all') {
          params.category = category;
        }

        const response = await getContent(params);
        setArticles(Array.isArray(response) ? response : []);
      } catch (err) {
        setError(err.message || 'Unable to load articles');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [category]);

  const previewText = (text = '') => {
    if (text.length <= 180) return text;
    return `${text.slice(0, 180).trim()}...`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-pink-600">Skincare Education</h1>
          <p className="mt-2 text-gray-600">Read practical skincare articles, guides, and tips tailored for different skin concerns.</p>
        </div>

        <div className="min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All categories' : option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading articles...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No articles found for this category.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <article key={article._id} className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-xl hover:border-pink-200">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-700">
                  {article.category}
                </span>
                <span className="text-xs text-gray-400">
                  {article.tags?.slice(0, 2).join(' • ')}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{article.title}</h2>
              <p className="text-sm text-gray-600 leading-6 mb-6">{previewText(article.content)}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">{article.tags?.length || 0} tags</span>
                <Link
                  to={`/content/${article._id}`}
                  className="rounded-full bg-pink-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-700"
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentList;