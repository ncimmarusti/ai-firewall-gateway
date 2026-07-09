# Roadmap — AI Firewall / Gateway POC

Check items off as you
go. GitHub renders `- [ ]` as interactive checkboxes inside issues and PRs, and
as visible boxes in this file.

**Progress:** 0 / 6 phases complete

---

## Phase 0 — Setup & Planning  ·
- [ ] Create GitHub repo, add README, LICENSE, `.gitignore` (Python + Node)
- [ ] Commit `REQUIREMENTS.md` and `architecture.mermaid`
- [ ] Install Ollama, pull `tinyllama` and `mistral`
- [ ] Confirm both models respond via `ollama run`
- [ ] Set up Python venv (FastAPI) and Node project (React)

## Phase 1 — Backend Core  ·
- [ ] Scaffold FastAPI app with `/health` endpoint
- [ ] Define SQLite schema: `prompts`, `rules`, `logs`
- [ ] `POST /prompt` — accept prompt, return stubbed response
- [ ] Wire Ollama call: forward prompt, capture response
- [ ] Log every request to `logs` table

## Phase 2 — Firewall Engine  ·
- [ ] Rules loader: read active rules from DB on each request
- [ ] Pattern-matching inspection (keyword + regex)
- [ ] Block vs. allow decision + reason logging
- [ ] Seed 5 rule categories (override, leak, roleplay, secrets, evasion)
- [ ] Unit tests for each rule category

## Phase 3 — Rules Management API  ·
- [ ] `GET /rules` — list all rules
- [ ] `POST /rules` — create rule
- [ ] `PUT /rules/{id}` — edit rule
- [ ] `DELETE /rules/{id}` — remove rule
- [ ] Toggle active/inactive per rule

## Phase 4 — React Dashboard  ·
- [ ] Prompt submission form + model selector (TinyLlama / Mistral)
- [ ] Live feed table: prompt, matched rule, decision, response
- [ ] Blocked vs. allowed styling (clear visual distinction)
- [ ] Rules management UI (add / edit / delete / toggle)
- [ ] Stats panel: blocked count, allowed count, top rules triggered

## Phase 5 — Testing & Baseline  ·
- [ ] Curate injection test suite (OWASP LLM Top 10, MITRE ATLAS, jailbreak sets)
- [ ] Run suite against TinyLlama **firewall off** — record failures (baseline)
- [ ] Run same suite **firewall on** — record blocks
- [ ] Produce before/after comparison table
- [ ] Write up findings in `RESULTS.md`

## Phase 6 — Polish & Portfolio  ·
- [ ] README with screenshots + architecture diagram
- [ ] Setup/run instructions (one-command start if possible)
- [ ] Short demo GIF or recording
- [ ] "Future work" section (AI-classifier detection, output moderation)
- [ ] Final code cleanup and comments
