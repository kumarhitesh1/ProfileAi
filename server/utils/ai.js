const OpenAI = require('openai');

const groq = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

module.exports = { groq };