const express = require('express');
const router = express.Router();
const {
    createPortfolio,
    getAllPortfolios,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio,
    generatePortfolio,
    getPortfolioBySlug,
    getStats,
    toggleVisibility,
    downloadPortfolio,
    deleteGeneratedHtml,
    updateCustomSlug,
    setPublicTheme,
} = require('../controllers/portfolio');
const { isAuth } = require('../middlewares/isAuth');
const { upload } = require('../utils/cloudinary');

router.post('/portfolio/create', isAuth, upload.single('profilePic'), createPortfolio);
router.get('/portfolio/get', isAuth, getAllPortfolios);
router.get('/portfolio/get/:id', isAuth, getPortfolioById);
router.put('/portfolio/update/:id', isAuth, upload.single('profilePic'), updatePortfolio);
router.delete('/portfolio/delete/:id', isAuth, deletePortfolio);
router.post('/portfolio/generate/:id', isAuth, generatePortfolio);
router.get('/portfolio/view/:slug', getPortfolioBySlug);
router.put('/portfolio/public-theme/:id', isAuth, setPublicTheme);
router.get('/portfolio/stats', isAuth, getStats);
router.put('/portfolio/toggle/:id', isAuth, toggleVisibility);
router.get('/portfolio/download/:id', isAuth, downloadPortfolio);
router.delete('/portfolio/generated/delete/:id', isAuth, deleteGeneratedHtml);
router.put('/portfolio/custom-slug/:id', isAuth, updateCustomSlug);

module.exports = router;