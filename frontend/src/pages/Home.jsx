import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'

function Home() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            {/* Hero */}
            <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-700/50 rounded-full text-sm text-purple-300 mb-8">
                        ✨ AI-Powered Portfolio Generator
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6">
                        Build your portfolio
                        <br />
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            in seconds with AI
                        </span>
                    </h1>

                    <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
                        Fill in your details, pick a theme, and let AI generate a stunning professional portfolio website for you — no coding required.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to={user ? '/dashboard' : '/register'}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-lg transition w-full sm:w-auto text-center"
                        >
                            {user ? 'Go to Dashboard →' : 'Get Started Free →'}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4 border-t border-gray-800">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">Everything you need</h2>
                    <p className="text-gray-400 text-center mb-12">Build, customize and share your portfolio in minutes</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: '🤖',
                                title: 'AI Enhanced Content',
                                desc: 'Groq AI rewrites your bio, experience and projects to sound more professional and compelling.'
                            },
                            {
                                icon: '🎨',
                                title: '5 Beautiful Themes',
                                desc: 'Choose from Minimal, Dark, Creative, Glassmorphism and Cyberpunk themes — each fully responsive.'
                            },
                            {
                                icon: '🔗',
                                title: 'Shareable Link',
                                desc: 'Get a custom URL for your portfolio and share it with recruiters and employers instantly.'
                            },
                            {
                                icon: '📥',
                                title: 'Download HTML',
                                desc: 'Download your portfolio as a single HTML file and host it anywhere — GitHub Pages, Netlify, Vercel.'
                            },
                            {
                                icon: '⚡',
                                title: 'Multiple Themes',
                                desc: 'Generate your portfolio in all 5 themes and switch between them on your public page.'
                            },
                            {
                                icon: '🔒',
                                title: 'Privacy Control',
                                desc: 'Make your portfolio public or private anytime from your dashboard.'
                            },
                        ].map((feature, i) => (
                            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
                                <div className="text-3xl mb-4">{feature.icon}</div>
                                <h3 className="font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Themes showcase */}
            <section className="py-20 px-4 border-t border-gray-800">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">5 stunning themes</h2>
                    <p className="text-gray-400 mb-12">Each theme is unique, responsive and professionally designed</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {['Minimal', 'Dark', 'Creative', 'Glassmorphism', 'Cyberpunk'].map(theme => (
                            <span key={theme} className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-medium hover:border-purple-500 hover:text-purple-300 transition cursor-default">
                                {theme}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 border-t border-gray-800">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to build your portfolio?</h2>
                    <p className="text-gray-400 mb-8">Join developers and students who use ProfileAI to land their dream jobs</p>
                    <Link
                        to={user ? '/dashboard' : '/register'}
                        className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-lg transition"
                    >
                        {user ? 'Go to Dashboard →' : 'Create Your Portfolio Free →'}
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p>Built with ❤️ using MERN + Groq AI</p>
            </footer>
        </div>
    )
}

export default Home