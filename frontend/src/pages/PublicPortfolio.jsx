import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../utils/axios'
import Loader from '../components/common/Loader'

function PublicPortfolio() {
    const { slug } = useParams()
    const [portfolio, setPortfolio] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [selectedTheme, setSelectedTheme] = useState(null)

    useEffect(() => {
        fetchPortfolio()
    }, [slug])

    useEffect(() => {
        if (portfolio?.activeTheme) {
            setSelectedTheme(portfolio.activeTheme)
        }
    }, [portfolio])

    const fetchPortfolio = async () => {
        try {
            const res = await API.get(`/portfolio/view/${slug}`)
            const data = res.data.data
            setPortfolio(data)
            setSelectedTheme(data.activeTheme)
        } catch (err) {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <Loader />

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-6xl mb-4">404</p>
                    <h1 className="text-2xl font-bold mb-2">Portfolio not found</h1>
                    <p className="text-gray-400 mb-6">This portfolio doesn't exist or is private</p>
                    <Link to="/" className="text-purple-400 hover:text-purple-300">← Go Home</Link>
                </div>
            </div>
        )
    }

    const currentHtml = portfolio?.generatedHtml?.[selectedTheme]

    return (
        <div className="min-h-screen bg-gray-950 text-white">

            {/* Top bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to="/" className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ProfileAI
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                            👁 {portfolio.views} views
                        </span>
                        <Link
                            to="/register"
                            className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition hidden sm:block"
                        >
                            Create yours →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Portfolio Content */}
            <div className="pt-14">
                {!currentHtml ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <p className="text-4xl mb-4">🎨</p>
                            <h2 className="text-xl font-semibold mb-2">Portfolio not generated yet</h2>
                            <p className="text-gray-400 text-sm">The owner hasn't generated their portfolio yet</p>
                        </div>
                    </div>
                ) : (
                    <iframe
                        srcDoc={currentHtml}
                        className="w-full border-0"
                        style={{ height: 'calc(100vh - 56px)' }}
                        title={`${portfolio.name}'s Portfolio`}
                    />
                )}
            </div>
        </div>
    )
}

export default PublicPortfolio