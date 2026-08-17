const Portfolio = require("../models/portfolio");
const tryCatch = require("../utils/tryCatch");
const { uploadToCloudinary } = require("../utils/cloudinary");
const slugify = require("slugify");
const { groq } = require("../utils/ai");
const path = require("path");
const fs = require("fs");

async function createPortfolio(req, res) {
  let profilePic = req.user.profilePic || null;
  if (req.file) {
    const result = await uploadToCloudinary(req.file);
    profilePic = result.secure_url;
  }

  // parse JSON strings if sent as FormData
  const body = { ...req.body };
  if (typeof body.education === "string")
    body.education = JSON.parse(body.education);
  if (typeof body.experience === "string")
    body.experience = JSON.parse(body.experience);
  if (typeof body.projects === "string")
    body.projects = JSON.parse(body.projects);
  if (typeof body.socialLinks === "string")
    body.socialLinks = JSON.parse(body.socialLinks);
  if (typeof body.skills === "string") body.skills = JSON.parse(body.skills);

  if (body.theme && !ALLOWED_THEMES.includes(body.theme)) {
    return res.status(400).json({
      success: false,
      message: `Invalid theme: ${body.theme}`,
    });
  }

  const slug =
    slugify(body.name || req.user.name, { lower: true }) + "-" + Date.now();

  const portfolioData = new Portfolio({
    ...body,
    user: req.user.id,
    name: body.name || req.user.name,
    email: body.email || req.user.email,
    profilePic,
    slug,
  });
  await portfolioData.save();
  res.status(201).json({ success: true, data: portfolioData });
}

async function getAllPortfolios(req, res) {
  const portfolios = await Portfolio.find({ user: req.user.id });

  const data = portfolios.map((portfolio) => {
    const generatedHtml = {};
    portfolio.generatedHtml.forEach((value, key) => {
      generatedHtml[key] = value;
    });
    return { ...portfolio.toObject(), generatedHtml };
  });

  res.status(200).json({ success: true, data });
}

async function getPortfolioById(req, res) {
  const { id } = req.params;
  const portfolio = await Portfolio.findOne({ _id: id, user: req.user.id });
  if (!portfolio) {
    return res
      .status(404)
      .json({ success: false, message: "Portfolio not found" });
  }

  // convert Map to plain object
  const generatedHtml = {};
  portfolio.generatedHtml.forEach((value, key) => {
    generatedHtml[key] = value;
  });

  res.status(200).json({
    success: true,
    data: {
      ...portfolio.toObject(),
      generatedHtml,
    },
  });
}

async function updatePortfolio(req, res) {
  const { id } = req.params;

  const body = { ...req.body };
  if (typeof body.education === "string")
    body.education = JSON.parse(body.education);
  if (typeof body.experience === "string")
    body.experience = JSON.parse(body.experience);
  if (typeof body.projects === "string")
    body.projects = JSON.parse(body.projects);
  if (typeof body.socialLinks === "string")
    body.socialLinks = JSON.parse(body.socialLinks);
  if (typeof body.skills === "string") body.skills = JSON.parse(body.skills);
  if (typeof body.profilePic === "string" && body.profilePic === "null") {
    body.profilePic = null;
  }

  if (body.theme && !ALLOWED_THEMES.includes(body.theme)) {
    return res.status(400).json({
      success: false,
      message: `Invalid theme: ${body.theme}`,
    });
  }

  if (req.file) {
    const result = await uploadToCloudinary(req.file);
    body.profilePic = result.secure_url;
  }

  const portfolio = await Portfolio.findOneAndUpdate(
    { _id: id, user: req.user.id },
    body,
    { returnDocument: "after" },
  );
  if (!portfolio) {
    return res
      .status(404)
      .json({ success: false, message: "Portfolio not found" });
  }
  res.status(200).json({ success: true, data: portfolio });
}

async function deletePortfolio(req, res) {
  const { id } = req.params;
  const portfolio = await Portfolio.findOneAndDelete({
    _id: id,
    user: req.user.id,
  });
  if (!portfolio) {
    return res
      .status(404)
      .json({ success: false, message: "Portfolio not found" });
  }
  res
    .status(200)
    .json({ success: true, message: "Portfolio deleted successfully" });
}

// Escapes HTML-significant characters so user-controlled text can never
// break out of the surrounding markup (stored XSS prevention).
const escapeHtml = (str) => {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// For values used as URLs (href/src). Only allows http(s), relative,
// or hash links — blocks javascript:, data:, and other dangerous schemes.
const safeUrl = (url) => {
  if (!url) return "#";
  const trimmed = String(url).trim();
  if (
    /^(https?:)?\/\//i.test(trimmed) ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/")
  ) {
    return escapeHtml(trimmed);
  }
  return "#";
};

const injectTemplate = (template, portfolio, enhanced) => {
  const nameParts = portfolio.name.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const skillsHtml = enhanced.skills?.length
    ? enhanced.skills
        .map((s) => `<div class="skill-tag">${escapeHtml(s)}</div>`)
        .join("")
    : "";

  const experienceHtml = enhanced.experience?.length
    ? enhanced.experience
        .map(
          (exp) => `
            <div class="timeline-item">
                <div class="timeline-meta">${escapeHtml(exp.duration)}</div>
                <div class="timeline-title">${escapeHtml(exp.title)}</div>
                <div class="timeline-company">${escapeHtml(exp.company)}</div>
                <p>${escapeHtml(exp.description)}</p>
            </div>`,
        )
        .join("")
    : "";

  const educationHtml = enhanced.education?.length
    ? enhanced.education
        .map(
          (edu) => `
            <div class="edu-card">
                <div class="edu-year">${escapeHtml(edu.year)}</div>
                <div class="edu-degree">${escapeHtml(edu.degree)}</div>
                <div class="edu-institution">${escapeHtml(edu.institution)}</div>
            </div>`,
        )
        .join("")
    : "";

  const projectsHtml = enhanced.projects?.length
    ? enhanced.projects
        .map(
          (proj, i) => `
            <a href="${safeUrl(proj.link)}" target="_blank" class="project-card">
                <div class="project-number">0${i + 1}</div>
                <div class="project-title">${escapeHtml(proj.title)}</div>
                <div class="project-desc">${escapeHtml(proj.description)}</div>
                <div class="project-link">View Project →</div>
            </a>`,
        )
        .join("")
    : "";

  const replaceIf = (html, key, value) => {
    const regex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{/if}}`, "g");
    return html.replace(regex, value ? "$1" : "");
  };

  let html = template;

  html = replaceIf(
    html,
    "profilePic",
    portfolio.profilePic && portfolio.profilePic.trim() !== "",
  );
  html = replaceIf(html, "github", portfolio.socialLinks?.github);
  html = replaceIf(html, "linkedin", portfolio.socialLinks?.linkedin);
  html = replaceIf(html, "twitter", portfolio.socialLinks?.twitter);

  html = html
    .replace(/{{name}}/g, escapeHtml(portfolio.name))
    .replace(/{{firstName}}/g, escapeHtml(firstName))
    .replace(/{{lastName}}/g, escapeHtml(lastName))
    .replace(/{{role}}/g, escapeHtml(portfolio.description) || "Developer")
    .replace(/{{description}}/g, escapeHtml(portfolio.description))
    .replace(
      /{{bio}}/g,
      escapeHtml(enhanced.bio) || escapeHtml(portfolio.description),
    )
    .replace(/{{email}}/g, escapeHtml(portfolio.email))
    .replace(/{{profilePic}}/g, safeUrl(portfolio.profilePic))
    .replace(/{{github}}/g, safeUrl(portfolio.socialLinks?.github))
    .replace(/{{linkedin}}/g, safeUrl(portfolio.socialLinks?.linkedin))
    .replace(/{{twitter}}/g, safeUrl(portfolio.socialLinks?.twitter))
    .replace(/{{skills}}/g, skillsHtml)
    .replace(/{{experience}}/g, experienceHtml)
    .replace(/{{education}}/g, educationHtml)
    .replace(/{{projects}}/g, projectsHtml)
    .replace(/{{projectCount}}/g, String(enhanced.projects?.length || 0))
    .replace(/{{skillCount}}/g, String(enhanced.skills?.length || 0));

  if (!skillsHtml)
    html = html.replace(
      /<section[^>]*id="skills"[^>]*>[\s\S]*?<\/section>/g,
      "",
    );
  if (!experienceHtml)
    html = html.replace(
      /<section[^>]*id="experience"[^>]*>[\s\S]*?<\/section>/g,
      "",
    );
  if (!educationHtml)
    html = html.replace(
      /<section[^>]*id="education"[^>]*>[\s\S]*?<\/section>/g,
      "",
    );
  if (!projectsHtml)
    html = html.replace(
      /<section[^>]*id="projects"[^>]*>[\s\S]*?<\/section>/g,
      "",
    );

  html = html.replace(/{{[^}]*}}/g, "");

  return html;
};

const ALLOWED_THEMES = [
  "minimal",
  "dark",
  "cyberpunk",
  "glassmorphism",
  "creative",
];
async function generatePortfolio(req, res) {
  const { id } = req.params;
  const requestedTheme = req.body?.theme;

  const portfolio = await Portfolio.findOne({ _id: id, user: req.user.id });
  if (!portfolio) {
    return res
      .status(404)
      .json({ success: false, message: "Portfolio not found" });
  }

  const selectedTheme = requestedTheme || portfolio.theme;

  if (!ALLOWED_THEMES.includes(selectedTheme)) {
    return res.status(400).json({
      success: false,
      message: `Invalid theme: ${selectedTheme}`,
    });
  }

  const templatePath = path.join(
    __dirname,
    "../templates",
    `${selectedTheme}.html`,
  );
  if (!fs.existsSync(templatePath)) {
    return res.status(400).json({
      success: false,
      message: `Template not found for theme: ${selectedTheme}`,
    });
  }
  const template = fs.readFileSync(templatePath, "utf-8");

  const prompt = `
You are a professional portfolio content writer.
Enhance this portfolio data and return ONLY a valid JSON object.
No explanation, no markdown, no backticks, just pure JSON.

Input data:
- Name: ${portfolio.name}
- Description: ${portfolio.description}
- Skills: ${portfolio.skills.join(", ")}
- Experience: ${JSON.stringify(portfolio.experience)}
- Projects: ${JSON.stringify(portfolio.projects)}
- Education: ${JSON.stringify(portfolio.education)}

Return this exact JSON structure:
{
    "bio": "Write in FIRST PERSON (I, my, me). 2-3 sentences.",
    "skills": ["skill1", "skill2"],
    "experience": [
        {
            "title": "Job Title",
            "company": "Company",
            "duration": "Duration",
            "description": "one line in first person"
        }
    ],
    "projects": [
        {
            "title": "Project Title",
            "description": "enhanced compelling description",
            "link": "url"
        }
    ],
    "education": [
        {
            "degree": "Degree",
            "institution": "Institution",
            "year": "Year"
        }
    ]
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2000,
  });

  let enhanced;
  try {
    const raw = completion.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    enhanced = JSON.parse(raw);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "AI failed to return valid JSON — try again",
      error: error.message,
    });
  }

  const generatedHtml = injectTemplate(template, portfolio, enhanced);

  await Portfolio.findByIdAndUpdate(id, {
    [`generatedHtml.${selectedTheme}`]: generatedHtml,
    theme: selectedTheme,
  });

  res.status(200).json({
    success: true,
    generatedHtml,
  });
}

async function getPortfolioBySlug(req, res) {
  const { slug } = req.params;
  const portfolio = await Portfolio.findOneAndUpdate(
    {
      $or: [{ customSlug: slug }, { slug: slug }],
      isPublic: true,
    },
    { $inc: { views: 1 } },
    { returnDocument: "after" },
  );
  if (!portfolio) {
    return res
      .status(404)
      .json({ success: false, message: "Portfolio not found" });
  }

  const generatedHtml = {};
  portfolio.generatedHtml.forEach((value, key) => {
    generatedHtml[key] = value;
  });

  const selectedTheme =
    portfolio.publicTheme || [...portfolio.generatedHtml.keys()][0];

  res.status(200).json({
    success: true,
    data: {
      ...portfolio.toObject(),
      generatedHtml,
      activeTheme: selectedTheme,
      availableThemes: [...portfolio.generatedHtml.keys()],
    },
  });
}

async function setPublicTheme(req, res) {
    const { id } = req.params;
    const { theme } = req.body;

    if (!ALLOWED_THEMES.includes(theme)) {
        return res.status(400).json({ success: false, message: `Invalid theme: ${theme}` });
    }

    const portfolio = await Portfolio.findOneAndUpdate(
        { _id: id, user: req.user.id },
        { publicTheme: theme },
        { returnDocument: 'after' }
    );

  if (!portfolio) {
    return res
      .status(404)
      .json({ success: false, message: "Portfolio not found" });
  }

  res.status(200).json({
    success: true,
    message: `Public theme set to ${theme}`,
    data: portfolio,
  });
}

async function getStats(req, res) {
  const portfolios = await Portfolio.find({ user: req.user.id });
  const totalPortfolios = portfolios.length;
  let totalViews = 0;
  for (let i = 0; i < totalPortfolios; i++) {
    totalViews += portfolios[i].views;
  }
  return res.status(200).json({
    success: true,
    data: { totalPortfolios, totalViews },
  });
}

async function toggleVisibility(req, res) {
  const { id } = req.params;
  const portfolio = await Portfolio.findOne({ _id: id, user: req.user.id });
  if (!portfolio) {
    return res
      .status(404)
      .json({ success: false, message: "Portfolio not found" });
  }
  portfolio.isPublic = !portfolio.isPublic;
  await portfolio.save();
  return res.status(200).json({
    success: true,
    message: `Portfolio is now ${portfolio.isPublic ? "public" : "private"}`,
    isPublic: portfolio.isPublic,
  });
}

async function downloadPortfolio(req, res) {
  const { id } = req.params;
  const portfolio = await Portfolio.findOne({ _id: id, user: req.user.id });
  if (!portfolio) {
    return res
      .status(404)
      .json({ success: false, message: "Portfolio not found" });
  }

  const { theme } = req.query;
  const selectedTheme = theme || portfolio.theme;
  const html =
    portfolio.generatedHtml.get(selectedTheme) ||
    portfolio.generatedHtml.get(portfolio.theme);

  if (!html) {
    return res.status(400).json({
      success: false,
      message: "Portfolio has not been generated yet",
    });
  }

  res.setHeader("Content-Type", "text/html");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${portfolio.slug}-${selectedTheme}.html"`,
  );
  res.send(html);
}

async function deleteGeneratedHtml(req, res) {
  const { id } = req.params;
  const { theme } = req.query;

  const portfolio = await Portfolio.findOne({ _id: id, user: req.user.id });
  if (!portfolio) {
    return res
      .status(404)
      .json({ success: false, message: "Portfolio not found" });
  }

  if (theme) {
    portfolio.generatedHtml.delete(theme);
    await portfolio.save();
    return res.status(200).json({
      success: true,
      message: `Generated HTML for ${theme} theme deleted`,
    });
  }

  portfolio.generatedHtml.clear();
  await portfolio.save();
  return res
    .status(200)
    .json({ success: true, message: "All generated HTML deleted" });
}

async function updateCustomSlug(req, res) {
  const { id } = req.params;
  const { customSlug } = req.body;

  if (!customSlug) {
    return res
      .status(400)
      .json({ success: false, message: "Custom slug is required" });
  }

  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(customSlug)) {
    return res.status(400).json({
      success: false,
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    });
  }

  const existing = await Portfolio.findOne({ customSlug });
  if (existing && existing._id.toString() !== id) {
    return res
      .status(400)
      .json({ success: false, message: "This slug is already taken" });
  }

  let portfolio;
  try {
    portfolio = await Portfolio.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { customSlug },
      { returnDocument: "after" },
    );
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "This slug is already taken" });
    }
    throw error;
  }

  if (!portfolio) {
    return res
      .status(404)
      .json({ success: false, message: "Portfolio not found" });
  }

  res.status(200).json({
    success: true,
    message: "Custom slug updated successfully",
    data: portfolio,
  });
}

module.exports = {
  createPortfolio: tryCatch(createPortfolio),
  getAllPortfolios: tryCatch(getAllPortfolios),
  getPortfolioById: tryCatch(getPortfolioById),
  updatePortfolio: tryCatch(updatePortfolio),
  deletePortfolio: tryCatch(deletePortfolio),
  generatePortfolio: tryCatch(generatePortfolio),
  getPortfolioBySlug: tryCatch(getPortfolioBySlug),
  setPublicTheme: tryCatch(setPublicTheme),
  getStats: tryCatch(getStats),
  toggleVisibility: tryCatch(toggleVisibility),
  downloadPortfolio: tryCatch(downloadPortfolio),
  deleteGeneratedHtml: tryCatch(deleteGeneratedHtml),
  updateCustomSlug: tryCatch(updateCustomSlug),
};
