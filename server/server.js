// import dotenv from "dotenv";
// dotenv.config();
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express'
import { requireAuth } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';
import { generateBlogTitle } from './controllers/aiController.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import { handleClerkWebhook } from './controllers/clerkWebhookController.js';


const app = express();
await connectCloudinary();
app.use(cors())
// Simple request logger to help debug routing from PowerShell/clients
app.use((req, res, next) => {
    try {
        console.log(`[REQ] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
        console.log('[HEADERS]', Object.fromEntries(Object.entries(req.headers).slice(0, 20)));
    } catch (e) {
        // ignore logging errors
    }
    next();
});
app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook)
app.use(express.json())
app.use(clerkMiddleware())

// Temporary test route to invoke the `generateBlogTitle` controller directly.
// Useful for local testing without using the frontend or Clerk auth flow.
app.post('/test-ai', async (req, res) => {
    try {
        req.auth = async () => ({ userId: req.headers['x-dev-user-id'] || 'dev-test' });
        req.plan = 'premium';
        req.free_usage = 0;
        if (!req.body || !req.body.prompt) {
            req.body = { prompt: 'Generate 3 sample blog titles about AI and healthcare' };
        }
        await generateBlogTitle(req, res);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

app.get('/', (req, res) =>res.send('Server is live'));

// In development allow a quick bypass for testing endpoints without Clerk auth.
// Set header `x-dev-bypass: true` and optional `x-dev-user-id` when testing.
if (process.env.NODE_ENV === 'production') {
    app.use(requireAuth())
} else {
    app.use(async (req, res, next) => {
        if (req.headers['x-dev-bypass'] === 'true') {
            req.auth = async () => ({ userId: req.headers['x-dev-user-id'] || 'dev-user' })
            // Provide default plan and usage for dev tests
            req.plan = 'premium'
            req.free_usage = 0
            return next()
        }
        return requireAuth()(req, res, next)
    })
}

app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)
const PORT=process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log('Server is running on port', PORT);
    // Log presence of important env vars (do NOT print the values)
    const requiredVars = ['GEMINI_API_KEY','STABILITY_API_KEY','DATABASE_URL','CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET','CLERK_WEBHOOK_SIGNING_SECRET'];
    requiredVars.forEach(v => console.log(`${v}:`, process.env[v] ? 'SET' : 'MISSING'));
    
});

// Dev-only quick endpoints that return fallback content for frontend testing
app.post('/dev/generate-blog-title', (req, res) => {
    const prompt = req.body?.prompt || 'Generate 3 blog titles about AI and healthcare';
    const keyword = (prompt || '').match(/"([^"]+)"/)?.[1] || 'AI and healthcare';
    const content = `- ${keyword} — 5 Ways AI is Changing It\n- The Future of ${keyword} and AI\n- How AI Improves ${keyword}\n`;
    res.json({ success: true, content });
});

app.post('/dev/generate-article', (req, res) => {
    const topic = req.body?.prompt || req.body?.topic || 'The future of artificial intelligence';
    const article = `# ${topic}\n\nThis is a placeholder article about ${topic}. Replace with AI-generated content when configured.`;
    res.json({ success: true, article });
});