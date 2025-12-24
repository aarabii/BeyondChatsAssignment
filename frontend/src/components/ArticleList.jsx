import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/articles")
      .then((res) => {
        setArticles(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">Loading articles...</div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Latest Articles</h1>
        <p className="text-gray-500 mt-2">
          Curated content from the BeyondChats engineering team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            {/* Thumbnail Image */}
            <div className="h-48 bg-gray-200 relative">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-2 text-xs text-blue-600 font-semibold uppercase tracking-wider mb-3">
                <span>Blog</span>
                <span>•</span>
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                <Link
                  to={`/article/${article.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {article.title}
                </Link>
              </h2>

              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {article.description ||
                  "No description available for this article."}
              </p>

              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {article.author ? article.author[0] : "B"}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {article.author || "BeyondChats"}
                  </span>
                </div>
                <Link
                  to={`/article/${article.id}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Read Article →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
