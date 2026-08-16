import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/axios";
import toast from "react-hot-toast";
import Navbar from "../components/common/Navbar";
import Loader from "../components/common/Loader";

const THEMES = ["minimal", "dark", "creative", "glassmorphism", "cyberpunk"];

function EditPortfolio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [previewTheme, setPreviewTheme] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const [form, setForm] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

  const fetchPortfolio = async () => {
    try {
      const res = await API.get(`/portfolio/get/${id}`);
      const data = res.data.data;
      setPortfolio(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        description: data.description || "",
        theme: data.theme || "dark",
        skills: data.skills?.length ? data.skills : [""],
        education: data.education?.length
          ? data.education
          : [{ degree: "", institution: "", year: "" }],
        experience: data.experience?.length
          ? data.experience
          : [{ title: "", company: "", duration: "" }],
        projects: data.projects?.length
          ? data.projects
          : [{ title: "", description: "", link: "" }],
        socialLinks: data.socialLinks || {
          github: "",
          linkedin: "",
          twitter: "",
        },
        customSlug: data.customSlug || "",
      });
      setProfilePicPreview(data.profilePic || null);
    } catch (err) {
      toast.error("Failed to load portfolio");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Skills
  const addSkill = () => updateField("skills", [...form.skills, ""]);
  const updateSkill = (i, val) => {
    const u = [...form.skills];
    u[i] = val;
    updateField("skills", u);
  };
  const removeSkill = (i) =>
    updateField(
      "skills",
      form.skills.filter((_, idx) => idx !== i),
    );

  // Education
  const addEducation = () =>
    updateField("education", [
      ...form.education,
      { degree: "", institution: "", year: "" },
    ]);
  const updateEducation = (i, field, val) => {
    const u = [...form.education];
    u[i] = { ...u[i], [field]: val };
    updateField("education", u);
  };
  const removeEducation = (i) =>
    updateField(
      "education",
      form.education.filter((_, idx) => idx !== i),
    );

  // Experience
  const addExperience = () =>
    updateField("experience", [
      ...form.experience,
      { title: "", company: "", duration: "" },
    ]);
  const updateExperience = (i, field, val) => {
    const u = [...form.experience];
    u[i] = { ...u[i], [field]: val };
    updateField("experience", u);
  };
  const removeExperience = (i) =>
    updateField(
      "experience",
      form.experience.filter((_, idx) => idx !== i),
    );

  // Projects
  const addProject = () =>
    updateField("projects", [
      ...form.projects,
      { title: "", description: "", link: "" },
    ]);
  const updateProject = (i, field, val) => {
    const u = [...form.projects];
    u[i] = { ...u[i], [field]: val };
    updateField("projects", u);
  };
  const removeProject = (i) =>
    updateField(
      "projects",
      form.projects.filter((_, idx) => idx !== i),
    );

  const handleProfilePic = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const portfolioData = {
        name: form.name,
        email: form.email,
        description: form.description,
        theme: form.theme,
        skills: form.skills.filter((s) => s.trim()),
        education: form.education.filter((e) => e.degree),
        experience: form.experience.filter((e) => e.title),
        projects: form.projects.filter((p) => p.title),
        socialLinks: form.socialLinks,
      };

      // if pic removed — send null
      if (!profilePicPreview && !profilePicFile) {
        portfolioData.profilePic = null;
      }

      let res;
      if (profilePicFile) {
        const formData = new FormData();
        formData.append("profilePic", profilePicFile);
        Object.entries(portfolioData).forEach(([key, value]) => {
          formData.append(
            key,
            value === null
              ? "null"
              : typeof value === "object"
                ? JSON.stringify(value)
                : value,
          );
        });
        res = await API.put(`/portfolio/update/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await API.put(`/portfolio/update/${id}`, portfolioData);
      }

      setPortfolio(res.data.data);
      setProfilePicPreview(res.data.data.profilePic || null);
      toast.success("Portfolio saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // save theme first
      await API.put(`/portfolio/update/${id}`, { theme: form.theme });

      // then generate
      const res = await API.post(
        `/portfolio/generate/${id}`,
        { theme: form.theme },
        { headers: { "Content-Type": "application/json" } },
      );
      toast.success(`Portfolio generated with ${form.theme} theme!`);
      setPortfolio((prev) => ({
        ...prev,
        generatedHtml: {
          ...prev.generatedHtml,
          [form.theme]: res.data.generatedHtml,
        },
      }));
      setPreviewTheme(form.theme);
      setActiveTab("preview");
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleCustomSlug = async () => {
    try {
      await API.put(`/portfolio/custom-slug/${id}`, {
        customSlug: form.customSlug,
      });
      toast.success("Custom URL saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save URL");
    }
  };

  const handleDownload = async (theme) => {
    try {
      const res = await API.get(`/portfolio/download/${id}?theme=${theme}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${portfolio.slug}-${theme}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Download failed");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition text-sm";
  const labelClass = "block text-sm text-gray-400 mb-1.5";

  if (loading || !form) return <Loader />;

  const generatedThemes = portfolio.generatedHtml
    ? Object.keys(portfolio.generatedHtml)
    : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{portfolio.name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {portfolio.description}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {["edit", "generate", "preview", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm capitalize transition ${activeTab === tab ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Edit Tab */}
        {activeTab === "edit" && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-sm text-gray-300">
                Basic Info
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 flex items-center justify-center">
                  {profilePicPreview ? (
                    <img
                      src={profilePicPreview}
                      className="w-full h-full object-cover"
                      alt="profile"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl text-gray-500">
                      👤
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition w-fit">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePic}
                      className="hidden"
                    />
                  </label>
                  {profilePicPreview && (
                    <button
                      onClick={() => {
                        setProfilePicFile(null);
                        setProfilePicPreview(null);
                      }}
                      className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-xs transition w-fit"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={inputClass + " resize-none h-20"}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm text-gray-300">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(i, e.target.value)}
                      className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 w-32"
                      placeholder="Skill"
                    />
                    {form.skills.length > 1 && (
                      <button
                        onClick={() => removeSkill(i)}
                        className="text-red-400 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addSkill}
                  className="px-3 py-1.5 border border-dashed border-gray-700 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-500 transition"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Education */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm text-gray-300">Education</h3>
              {form.education.map((edu, i) => (
                <div key={i} className="p-3 bg-gray-800 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">
                      Education {i + 1}
                    </span>
                    {form.education.length > 1 && (
                      <button
                        onClick={() => removeEducation(i)}
                        className="text-red-400 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(i, "degree", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(i, "institution", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(i, "year", e.target.value)}
                    className={inputClass}
                    placeholder="Year"
                  />
                </div>
              ))}
              <button
                onClick={addEducation}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                + Add Education
              </button>
            </div>

            {/* Experience */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm text-gray-300">
                Experience
              </h3>
              {form.experience.map((exp, i) => (
                <div key={i} className="p-3 bg-gray-800 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">
                      Experience {i + 1}
                    </span>
                    {form.experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(i)}
                        className="text-red-400 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) =>
                      updateExperience(i, "title", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Job Title"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(i, "company", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) =>
                      updateExperience(i, "duration", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Duration"
                  />
                </div>
              ))}
              <button
                onClick={addExperience}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                + Add Experience
              </button>
            </div>

            {/* Projects */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm text-gray-300">Projects</h3>
              {form.projects.map((proj, i) => (
                <div key={i} className="p-3 bg-gray-800 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">
                      Project {i + 1}
                    </span>
                    {form.projects.length > 1 && (
                      <button
                        onClick={() => removeProject(i)}
                        className="text-red-400 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateProject(i, "title", e.target.value)}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <textarea
                    value={proj.description}
                    onChange={(e) =>
                      updateProject(i, "description", e.target.value)
                    }
                    className={inputClass + " resize-none h-16"}
                    placeholder="Description"
                  />
                  <input
                    type="url"
                    value={proj.link}
                    onChange={(e) => updateProject(i, "link", e.target.value)}
                    className={inputClass}
                    placeholder="Link"
                  />
                </div>
              ))}
              <button
                onClick={addProject}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                + Add Project
              </button>
            </div>

            {/* Social Links */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm text-gray-300">
                Social Links
              </h3>
              <input
                type="url"
                value={form.socialLinks.github}
                onChange={(e) =>
                  updateField("socialLinks", {
                    ...form.socialLinks,
                    github: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="GitHub URL"
              />
              <input
                type="url"
                value={form.socialLinks.linkedin}
                onChange={(e) =>
                  updateField("socialLinks", {
                    ...form.socialLinks,
                    linkedin: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="LinkedIn URL"
              />
              <input
                type="url"
                value={form.socialLinks.twitter}
                onChange={(e) =>
                  updateField("socialLinks", {
                    ...form.socialLinks,
                    twitter: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Twitter URL"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl font-medium transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === "generate" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Select Theme</h3>
              <p className="text-gray-400 text-sm mb-4">
                Each theme generates a unique portfolio design
              </p>
              <div className="grid grid-cols-5 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateField("theme", theme)}
                    className={`py-3 rounded-xl text-sm capitalize transition border ${form.theme === theme ? "border-purple-500 bg-purple-900/30 text-purple-300" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"}`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating with AI...
                </>
              ) : (
                "✨ Generate Portfolio"
              )}
            </button>

            {/* Generated themes */}
            {generatedThemes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm text-gray-300">
                  Generated Portfolios
                </h3>
                <div className="space-y-2">
                  {generatedThemes.map((theme) => (
                    <div
                      key={theme}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <span className="capitalize text-sm">{theme}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPreviewTheme(theme);
                            setActiveTab("preview");
                          }}
                          className="text-xs px-3 py-1.5 bg-purple-900/40 text-purple-300 rounded-lg hover:bg-purple-900/60 transition"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDownload(theme)}
                          className="text-xs px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {generatedThemes.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">🎨</p>
                <p className="text-gray-400">No portfolio generated yet</p>
                <button
                  onClick={() => setActiveTab("generate")}
                  className="mt-4 text-sm text-purple-400 hover:text-purple-300"
                >
                  Go to Generate →
                </button>
              </div>
            ) : (
              <div>
                {/* Theme selector for preview */}
                <div className="flex gap-2 p-3 border-b border-gray-800">
                  {generatedThemes.map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setPreviewTheme(theme)}
                      className={`px-3 py-1.5 rounded-lg text-xs capitalize transition ${previewTheme === theme ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
                {previewTheme && portfolio.generatedHtml[previewTheme] && (
                  <iframe
                    srcDoc={portfolio.generatedHtml[previewTheme]}
                    className="w-full h-[600px] border-0"
                    title="Portfolio Preview"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold">Custom URL</h3>
              <p className="text-gray-400 text-sm">
                Set a custom URL for your public portfolio
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    <span className="px-3 text-gray-500 text-sm border-r border-gray-700 py-3">
                      /view/
                    </span>
                    <input
                      type="text"
                      value={form.customSlug}
                      onChange={(e) =>
                        updateField(
                          "customSlug",
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        )
                      }
                      className="flex-1 px-3 py-3 bg-transparent text-white text-sm focus:outline-none"
                      placeholder="your-name"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCustomSlug}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition"
                >
                  Save
                </button>
              </div>
              {(portfolio.customSlug || portfolio.slug) && (
                <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                  <span className="text-xs text-gray-400 flex-1 truncate">
                    {window.location.origin}/view/
                    {portfolio.customSlug || portfolio.slug}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/view/${portfolio.customSlug || portfolio.slug}`,
                      );
                      toast.success("Copied!");
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            {/* Public Theme */}
            {generatedThemes.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <h3 className="font-semibold">Public Theme</h3>
                <p className="text-gray-400 text-sm">
                  Choose which theme visitors see on your public link
                </p>
                <div className="flex flex-wrap gap-2">
                  {generatedThemes.map((theme) => (
                    <button
                      key={theme}
                      onClick={async () => {
                        try {
                          await API.put(`/portfolio/public-theme/${id}`, {
                            theme,
                          });
                          toast.success(`Public theme set to ${theme}`);
                          setPortfolio((prev) => ({
                            ...prev,
                            publicTheme: theme,
                          }));
                        } catch (err) {
                          toast.error(
                            err.response?.data?.message ||
                              "Failed to set theme",
                          );
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm capitalize transition border ${
                        portfolio.publicTheme === theme
                          ? "border-purple-500 bg-purple-900/30 text-purple-300"
                          : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
                {portfolio.publicTheme && (
                  <p className="text-xs text-gray-500">
                    Currently showing:{" "}
                    <span className="text-purple-400 capitalize">
                      {portfolio.publicTheme}
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold">Danger Zone</h3>
              <button
                onClick={async () => {
                  if (!confirm("Delete this portfolio?")) return;
                  await API.delete(`/portfolio/delete/${id}`);
                  toast.success("Portfolio deleted");
                  navigate("/dashboard");
                }}
                className="w-full py-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm transition border border-red-900/50"
              >
                Delete Portfolio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditPortfolio;
