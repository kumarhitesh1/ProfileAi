const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./utils/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const portfolioRoutes = require('./routes/portfolio');
const userRoutes = require('./routes/user');

app.use('/api', portfolioRoutes);
app.use('/api', userRoutes);

const PORT= process.env.PORT || 8000;

connectDB().then(() => {app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
});