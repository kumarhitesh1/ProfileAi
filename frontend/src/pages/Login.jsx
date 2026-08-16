import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import API from '../utils/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'

function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await API.post('/user/login', form)
            login(res.data.user, res.data.token)
            toast.success('Welcome back!')
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await API.post('/user/google-auth', {
                token: credentialResponse.credential
            })
            login(res.data.user, res.data.token)
            toast.success('Welcome!')
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google login failed')
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="w-full max-w-md">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
                            <p className="text-gray-400 text-sm">Login to your ProfileAI account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-gray-800"></div>
                            <span className="text-gray-500 text-sm">or</span>
                            <div className="flex-1 h-px bg-gray-800"></div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google login failed')}
                                theme="filled_black"
                                shape="rectangular"
                                width="100%"
                            />
                        </div>

                        <p className="text-center text-gray-400 text-sm mt-6">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-purple-400 hover:text-purple-300">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login