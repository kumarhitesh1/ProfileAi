require('dotenv').config();
const {Groq} = require('groq-sdk');
const g = new Groq({apiKey: process.env.GROQ_API_KEY});
g.chat.completions.create({
    model: 'groq/compound',
    messages: [{role: 'user', content: 'Return only valid JSON: {"bio": "I am a developer", "skills": ["React"], "experience": [], "projects": [], "education": []}'}],
    max_tokens: 500
}).then(r => console.log('SUCCESS:', r.choices[0].message.content))
.catch(e => console.log('ERROR:', e.message));