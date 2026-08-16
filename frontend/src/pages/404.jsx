import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-bold text-gray-800 mb-4">404</p>
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-gray-400 mb-6">
          The page you're looking for doesn't exist
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
        >
          ← Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
