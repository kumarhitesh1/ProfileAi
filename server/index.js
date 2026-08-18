const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const multer = require('multer');


const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const portfolioRoutes = require('./routes/portfolio');
const userRoutes = require('./routes/user');

app.use('/api', portfolioRoutes);
app.use('/api', userRoutes);


app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(500).json({ success: false, message: err.message || "Something went wrong" });
  }
  next();
});

const PORT= process.env.PORT || 8000;

connectDB().then(() => {app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
});