Local dev setup for server

1. Copy `.env.example` to `.env` inside the `server/` folder and fill the secret values.

```bash
cd server
cp .env.example .env
# edit .env and set secrets
```

2. Install dependencies and start server

```bash
cd server
npm install
npm run server
```

3. For quick frontend testing without Clerk/OpenAI configured, use the dev endpoints:

- `POST /dev/generate-blog-title` -> returns fallback titles
- `POST /dev/generate-article` -> returns fallback article

4. To test the real AI flows, set `GEMINI_API_KEY` (or other provider keys) and ensure `CLERK` is configured for auth.

Notes:
- Keep real secrets out of source control. Use OS environment variables or a secrets manager for production.
