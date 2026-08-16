import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/common/Navbar'

const THEMES = ['minimal', 'dark', 'creative', 'glassmorphism', 'cyberpunk']

const STEPS = ['Basic Info', 'Skills', 'Education', 'Experience', 'Projects', 'Publish']

function CreatePortfolio() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [profilePicFile, setProfilePicFile] = useState(null)
    const [profilePicPreview, setProfilePicPreview] = useState(null)

    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        description: '',
        skills: [''],
        education: [{ degree: '', institution: '', year: '' }],
        experience: [{ title: '', company: '', duration: '' }],
        projects: [{ title: '', description: '', link: '' }],
        socialLinks: { github: '', linkedin: '', twitter: '' },
        theme: 'dark',
    })

    const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    // Skills handlers
    const addSkill = () => updateField('skills', [...form.skills, ''])
    const updateSkill = (i, val) => {
        const updated = [...form.skills]
        updated[i] = val
        updateField('skills', updated)
    }
    const removeSkill = (i) => updateField('skills', form.skills.filter((_, idx) => idx !== i))

    // Education handlers
    const addEducation = () => updateField('education', [...form.education, { degree: '', institution: '', year: '' }])
    const updateEducation = (i, field, val) => {
        const updated = [...form.education]
        updated[i] = { ...updated[i], [field]: val }
        updateField('education', updated)
    }
    const removeEducation = (i) => updateField('education', form.education.filter((_, idx) => idx !== i))

    // Experience handlers
    const addExperience = () => updateField('experience', [...form.experience, { title: '', company: '', duration: '' }])
    const updateExperience = (i, field, val) => {
        const updated = [...form.experience]
        updated[i] = { ...updated[i], [field]: val }
        updateField('experience', updated)
    }
    const removeExperience = (i) => updateField('experience', form.experience.filter((_, idx) => idx !== i))

    // Projects handlers
    const addProject = () => updateField('projects', [...form.projects, { title: '', description: '', link: '' }])
    const updateProject = (i, field, val) => {
        const updated = [...form.projects]
        updated[i] = { ...updated[i], [field]: val }
        updateField('projects', updated)
    }
    const removeProject = (i) => updateField('projects', form.projects.filter((_, idx) => idx !== i))

    const handleProfilePic = (e) => {
        const file = e.target.files[0]
        if (file) {
            setProfilePicFile(file)
            setProfilePicPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async () => {
    setLoading(true)
    try {
        const portfolioData = {
            name: form.name,
            email: form.email,
            description: form.description,
            theme: form.theme,
            skills: form.skills.filter(s => s.trim()),
            education: form.education.filter(e => e.degree),
            experience: form.experience.filter(e => e.title),
            projects: form.projects.filter(p => p.title),
            socialLinks: form.socialLinks,
        }

        let res;

        if (profilePicFile) {
            // send as FormData if there's a file
            const formData = new FormData()
            formData.append('profilePic', profilePicFile)
            Object.entries(portfolioData).forEach(([key, value]) => {
                formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
            })
            res = await API.post('/portfolio/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        } else {
            // send as JSON if no file
            res = await API.post('/portfolio/create', portfolioData)
        }

        toast.success('Portfolio created!')
        navigate(`/portfolio/${res.data.data._id}/edit`)
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to create portfolio')
    } finally {
        setLoading(false)
    }
}

    const inputClass = "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition text-sm"
    const labelClass = "block text-sm text-gray-400 mb-1.5"

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition ${i <= step ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            <span className={`hidden sm:block ml-1.5 text-xs ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
                            {i < STEPS.length - 1 && (
                                <div className={`w-6 sm:w-12 h-px mx-2 ${i < step ? 'bg-purple-600' : 'bg-gray-800'}`}></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                    {/* Step 0 — Basic Info */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

                            {/* Profile Pic */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0">
                                    {profilePicPreview ? (
                                        <img src={profilePicPreview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl text-gray-500">👤</span>
                                    )}
                                </div>
                                <div>
                                    <label className="cursor-pointer px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                                        Upload Photo
                                        <input type="file" accept="image/*" onChange={handleProfilePic} className="hidden" />
                                    </label>
                                    <p className="text-gray-500 text-xs mt-1">Optional — JPG, PNG, WebP</p>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} className={inputClass} placeholder="John Doe" />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className={inputClass} placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className={labelClass}>Professional Title / Bio</label>
                                <textarea value={form.description} onChange={e => updateField('description', e.target.value)} className={inputClass + ' resize-none h-24'} placeholder="Full stack developer passionate about building..." />
                            </div>
                        </div>
                    )}

                    {/* Step 1 — Skills */}
                    {step === 1 && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold mb-4">Skills</h2>
                            {form.skills.map((skill, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={skill}
                                        onChange={e => updateSkill(i, e.target.value)}
                                        className={inputClass}
                                        placeholder="e.g. React, Node.js, Python"
                                    />
                                    {form.skills.length > 1 && (
                                        <button onClick={() => removeSkill(i)} className="px-3 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-400 rounded-lg transition text-sm">✕</button>
                                    )}
                                </div>
                            ))}
                            <button onClick={addSkill} className="text-sm text-purple-400 hover:text-purple-300 transition">+ Add Skill</button>
                        </div>
                    )}

                    {/* Step 2 — Education */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold mb-4">Education</h2>
                            {form.education.map((edu, i) => (
                                <div key={i} className="p-4 bg-gray-800 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Education {i + 1}</span>
                                        {form.education.length > 1 && (
                                            <button onClick={() => removeEducation(i)} className="text-red-400 text-xs hover:text-red-300">Remove</button>
                                        )}
                                    </div>
                                    <input type="text" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} className={inputClass} placeholder="B.Tech Computer Science" />
                                    <input type="text" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} className={inputClass} placeholder="University Name" />
                                    <input type="text" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} className={inputClass} placeholder="2024" />
                                </div>
                            ))}
                            <button onClick={addEducation} className="text-sm text-purple-400 hover:text-purple-300 transition">+ Add Education</button>
                        </div>
                    )}

                    {/* Step 3 — Experience */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold mb-4">Experience</h2>
                            {form.experience.map((exp, i) => (
                                <div key={i} className="p-4 bg-gray-800 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Experience {i + 1}</span>
                                        {form.experience.length > 1 && (
                                            <button onClick={() => removeExperience(i)} className="text-red-400 text-xs hover:text-red-300">Remove</button>
                                        )}
                                    </div>
                                    <input type="text" value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} className={inputClass} placeholder="Frontend Developer" />
                                    <input type="text" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} className={inputClass} placeholder="Company Name" />
                                    <input type="text" value={exp.duration} onChange={e => updateExperience(i, 'duration', e.target.value)} className={inputClass} placeholder="6 months / 2022-2023" />
                                </div>
                            ))}
                            <button onClick={addExperience} className="text-sm text-purple-400 hover:text-purple-300 transition">+ Add Experience</button>
                        </div>
                    )}

                    {/* Step 4 — Projects */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold mb-4">Projects</h2>
                            {form.projects.map((proj, i) => (
                                <div key={i} className="p-4 bg-gray-800 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400">Project {i + 1}</span>
                                        {form.projects.length > 1 && (
                                            <button onClick={() => removeProject(i)} className="text-red-400 text-xs hover:text-red-300">Remove</button>
                                        )}
                                    </div>
                                    <input type="text" value={proj.title} onChange={e => updateProject(i, 'title', e.target.value)} className={inputClass} placeholder="Project Title" />
                                    <textarea value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} className={inputClass + ' resize-none h-20'} placeholder="Brief description..." />
                                    <input type="url" value={proj.link} onChange={e => updateProject(i, 'link', e.target.value)} className={inputClass} placeholder="https://github.com/..." />
                                </div>
                            ))}
                            <button onClick={addProject} className="text-sm text-purple-400 hover:text-purple-300 transition">+ Add Project</button>
                        </div>
                    )}

                    {/* Step 5 — Publish */}
                    {step === 5 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold mb-4">Social Links & Theme</h2>
                            <div>
                                <label className={labelClass}>GitHub</label>
                                <input type="url" value={form.socialLinks.github} onChange={e => updateField('socialLinks', { ...form.socialLinks, github: e.target.value })} className={inputClass} placeholder="https://github.com/username" />
                            </div>
                            <div>
                                <label className={labelClass}>LinkedIn</label>
                                <input type="url" value={form.socialLinks.linkedin} onChange={e => updateField('socialLinks', { ...form.socialLinks, linkedin: e.target.value })} className={inputClass} placeholder="https://linkedin.com/in/username" />
                            </div>
                            <div>
                                <label className={labelClass}>Twitter</label>
                                <input type="url" value={form.socialLinks.twitter} onChange={e => updateField('socialLinks', { ...form.socialLinks, twitter: e.target.value })} className={inputClass} placeholder="https://twitter.com/username" />
                            </div>
                            <div>
                                <label className={labelClass}>Select Theme</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {THEMES.map(theme => (
                                        <button
                                            key={theme}
                                            onClick={() => updateField('theme', theme)}
                                            className={`py-2 px-3 rounded-lg text-xs capitalize transition border ${form.theme === theme ? 'border-purple-500 bg-purple-900/30 text-purple-300' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}
                                        >
                                            {theme}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6 pt-4 border-t border-gray-800">
                        <button
                            onClick={() => setStep(s => s - 1)}
                            disabled={step === 0}
                            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition"
                        >
                            Back
                        </button>

                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-medium transition"
                            >
                                {loading ? 'Creating...' : 'Create Portfolio 🚀'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreatePortfolio