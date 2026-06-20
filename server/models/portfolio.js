const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
    },
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        duration: String,
      },
    ],
    description: {
      type: String,
    },
    skills: [String],
    projects: [
      {
        title: String,
        description: String,
        link: String,
      },
    ],
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
    },
    theme: {
      type: String,
      default: "minimal",
    },
    generatedHtml: {
      type: Map,
      of: String,
      default: {},
    },
    slug: {
      type: String,
      unique: true,
    },
    customSlug: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;
