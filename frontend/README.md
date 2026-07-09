# Frontend

The React dashboard is scaffolded with Vite in Phase 4. To create it:

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm run dev
```

The dev server runs on http://localhost:5173 and talks to the FastAPI backend
on http://localhost:8000 (CORS is already open for local dev).

## Planned components (Phase 4)
- PromptForm — submit box + model selector (TinyLlama / Mistral)
- LogFeed — table of prompts with decision + response
- RulesManager — add / edit / delete / toggle rules
- StatsPanel — blocked vs. allowed counts

Backend endpoints available to the frontend:
- `POST /prompt`  — submit a prompt
- `GET  /logs`    — recent prompt history
- `GET  /stats`   — blocked / allowed counts
- `GET/POST/PUT/DELETE /rules` — rules CRUD
