# AI Firewall / Gateway

A proof-of-concept **prompt injection detection and mitigation gateway**. It sits
between a user and a locally-hosted LLM, inspecting prompts against a
configurable rules database and demonstrating—with before/after metrics—why
filtering belongs in front of production LLMs.

## Why

Prompt injection is the top entry on the OWASP LLM Top 10. This project makes the
case concretely: run a vulnerable model with no protection, then the same model
behind the firewall, using an identical suite of known attacks. The difference is
the demo.

## Stack

| Layer | Tech |
|-------|------|
| Backend / gateway | FastAPI |
| Frontend / dashboard | React |
| Storage | SQLite |
| LLM runtime | Ollama (TinyLlama baseline, Mistral 7B comparison) |

## Architecture

See [`architecture.mermaid`](./architecture.mermaid).

## Project docs

- [`REQUIREMENTS.md`](./REQUIREMENTS.md) — functional/non-functional requirements, success criteria
- [`ROADMAP.md`](./ROADMAP.md) — phased build plan with checkboxes
- `RESULTS.md` — before/after findings (added in Phase 5)

## Quick start

> Filled in as the project is built (Phase 0).

```bash
# 1. Models
ollama pull tinyllama
ollama pull mistral

# 2. Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. Frontend
cd frontend && npm install && npm run dev
```

## Status

Proof of concept — learning/portfolio project. Not intended for production use.
