import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/axios";
import toast from "react-hot-toast";
import Navbar from "../components/common/Navbar";
import Loader from "../components/common/Loader";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [stats, setStats] = useState({ totalPortfolios: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfoliosRes, statsRes] = await Promise.all([
        API.get("/portfolio/get"),
        API.get("/portfolio/stats"),
      ]);
      setPortfolios(portfoliosRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;
    try {
      await API.delete(`/portfolio/delete/${id}`);
      toast.success("Portfolio deleted");
      setPortfolios(portfolios.filter((p) => p._id !== id));
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const res = await API.put(`/portfolio/toggle/${id}`);
      toast.success(res.data.message);
      setPortfolios(
        portfolios.map((p) =>
          p._id === id ? { ...p, isPublic: res.data.isPublic } : p,
        ),
      );
    } catch (err) {
      toast.error("Failed to toggle visibility");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.name}! 👋</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your AI-generated portfolios
            </p>
          </div>
          <Link
            to="/portfolio/create"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            + New Portfolio
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Total Portfolios</p>
            <p className="text-2xl font-bold text-purple-400">
              {stats.totalPortfolios}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Total Views</p>
            <p className="text-2xl font-bold text-pink-400">
              {stats.totalViews}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Public</p>
            <p className="text-2xl font-bold text-green-400">
              {portfolios.filter((p) => p.isPublic).length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Private</p>
            <p className="text-2xl font-bold text-gray-400">
              {portfolios.filter((p) => !p.isPublic).length}
            </p>
          </div>
        </div>

        {/* Portfolios */}
        {portfolios.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-4xl mb-4">🎨</p>
            <h2 className="text-xl font-semibold mb-2">No portfolios yet</h2>
            <p className="text-gray-400 text-sm mb-6">
              Create your first AI-powered portfolio
            </p>
            <Link
              to="/portfolio/create"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition"
            >
              Create Portfolio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio._id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4"
              >
                {/* Portfolio Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {portfolio.profilePic ? (
                      <img
                        src={portfolio.profilePic}
                        alt={portfolio.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                        {portfolio.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">
                        {portfolio.name}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {portfolio.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${portfolio.isPublic ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-400"}`}
                  >
                    {portfolio.isPublic ? "Public" : "Private"}
                  </span>
                </div>

                {/* Theme & Views */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="capitalize px-2 py-1 bg-gray-800 rounded-md">
                    {portfolio.theme}
                  </span>
                  <span>👁 {portfolio.views} views</span>
                </div>

                {/* Generated themes */}
                {portfolio.generatedHtml &&
                  Object.keys(portfolio.generatedHtml).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(portfolio.generatedHtml).map((theme) => (
                        <span
                          key={theme}
                          className="text-xs px-2 py-0.5 bg-purple-900/40 text-purple-300 rounded-full capitalize"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-gray-800">
                  <button
                    onClick={() => navigate(`/portfolio/${portfolio._id}/edit`)}
                    className="flex-1 text-xs py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(portfolio._id)}
                    className="flex-1 text-xs py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-center"
                  >
                    {portfolio.isPublic ? "Make Private" : "Make Public"}
                  </button>
                  {portfolio.customSlug || portfolio.slug ? (
                    <button
                      onClick={() => {
                        const slug = portfolio.customSlug || portfolio.slug;
                        navigator.clipboard.writeText(
                          `${window.location.origin}/view/${slug}`,
                        );
                        toast.success("Link copied!");
                      }}
                      className="flex-1 text-xs py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-center"
                    >
                      Copy Link
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleDelete(portfolio._id)}
                    className="text-xs py-2 px-3 bg-red-900/40 hover:bg-red-900/60 text-red-400 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
