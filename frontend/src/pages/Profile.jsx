import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../utils/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'

function Profile() {
    const { user, setUser } = useAuth()
    const [profilePicFile, setProfilePicFile] = useState(null)
    const [profilePicPreview, setProfilePicPreview] = useState(user?.profilePic || null)
    const [removepic, setRemovePic] = useState(false)
    const [saving, setSaving] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)

    const [form, setForm] = useState({
        name: user?.name || '',
    })

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    const handleProfilePic = (e) => {
        const file = e.target.files[0]
        if (file) {
            setProfilePicFile(file)
            setProfilePicPreview(URL.createObjectURL(file))
            setRemovePic(false)
        }
    }

    const handleRemovePic = () => {
        setProfilePicFile(null)
        setProfilePicPreview(null)
        setRemovePic(true)
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            let res;
            if (profilePicFile) {
                const formData = new FormData()
                formData.append('name', form.name)
                formData.append('profilePic', profilePicFile)
                res = await API.put('/user/updateprofile', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            } else {
                res = await API.put('/user/updateprofile', {
                    name: form.name,
                    profilePic: removepic ? null : undefined,
                })
            }
            setUser(res.data.user)
            toast.success('Profile updated!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update')
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error('Passwords do not match')
        }
        if (passwordForm.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters')
        }
        setChangingPassword(true)
        try {
            await API.put('/user/changepassword', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            })
            toast.success('Password changed!')
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password')
        } finally {
            setChangingPassword(false)
        }
    }

    const inputClass = "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition text-sm"
    const labelClass = "block text-sm text-gray-400 mb-1.5"

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <div className="max-w-xl mx-auto px-4 pt-24 pb-12">
                <h1 className="text-2xl font-bold mb-8">My Profile</h1>

                {/* Profile Info */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5 mb-6">
                    <h2 className="font-semibold text-gray-300">Profile Information</h2>

                    {/* Profile Pic */}
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 flex items-center justify-center">
                            {profilePicPreview ? (
                                <img src={profilePicPreview} className="w-full h-full object-cover" alt="profile" />
                            ) : (
                                <span className="text-3xl font-bold text-gray-500">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition w-fit">
                                Upload Photo
                                <input type="file" accept="image/*" onChange={handleProfilePic} className="hidden" />
                            </label>
                            {profilePicPreview && (
                                <button
                                    onClick={handleRemovePic}
                                    className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm transition w-fit"
                                >
                                    Remove Photo
                                </button>
                            )}
                            <p className="text-gray-500 text-xs">JPG, PNG or WebP — max 5MB</p>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className={labelClass}>Full Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className={inputClass}
                        />
                    </div>

                    {/* Email — readonly */}
                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            type="email"
                            value={user?.email}
                            disabled
                            className={inputClass + ' opacity-50 cursor-not-allowed'}
                        />
                        <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium transition"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Change Password */}
                {!user?.googleId && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                        <h2 className="font-semibold text-gray-300">Change Password</h2>
                        <div>
                            <label className={labelClass}>Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                className={inputClass}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className={inputClass}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className={inputClass}
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className="w-full py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg font-medium transition"
                        >
                            {changingPassword ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                )}

                {/* Google account note */}
                {user?.googleId && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center text-gray-400 text-sm">
                        🔐 You're signed in with Google — password change is not available
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile