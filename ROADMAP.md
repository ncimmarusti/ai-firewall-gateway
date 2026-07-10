# Roadmap — AI Firewall / Gateway

Build phases and planned enhancements. Checked items are done. GitHub renders
`- [ ]` as interactive checkboxes.

---

## Phase 0 — Setup & Planning  ✅
- [x] Repo, README, architecture diagram, requirements
- [x] Ollama installed; TinyLlama and Mistral pulled
- [x] Backend (FastAPI) and frontend (React + Vite) scaffolded

## Phase 1 — Backend Core  ✅
- [x] FastAPI app with `/health`, `/prompt`, `/logs`, `/stats`, `/rules`
- [x] SQLite schema: prompts, rules, logs
- [x] Ollama call wired in; every request logged

## Phase 2 — Layer 1: Input Firewall  ✅
- [x] Rules loader and regex inspection
- [x] Block vs. allow decision with reason logging
- [x] Five seeded rule categories
- [x] Live rules management (CRUD) in the dashboard

## Phase 3 — Dashboard  ✅
- [x] Test page: model selector, firewall toggle, example attacks
- [x] History page: all attempts with verdicts and entities
- [x] Rules page: add / edit / delete / toggle
- [x] Summary page: leak rate off vs. on, per-layer counts

## Phase 4 — Demo Mechanics  ✅
- [x] Planted fake secret in the model's system prompt
- [x] Per-request firewall on/off toggle
- [x] Outcome-based verdict (did the secret leak?)

## Phase 5 — Layer 2: Output DLP  ✅
- [x] Presidio + spaCy integration
- [x] Entity detection by shape (credential, SSN, email, credit card, phone)
- [x] Redaction of detected secrets on output
- [x] Defense-in-depth: catches input bypasses on the way out

---

## Planned enhancements

**Measurement fix (do first):**
- [ ] Session-level cumulative leak tracking — detect the secret escaping in fragments across multiple turns, so stats stop reporting "safe" when it actually leaked.

**Layer 3 — intent-based detection:**
- [ ] LLM-as-judge classifier (using Mistral) that reads the prompt/conversation and flags extraction *intent*, regardless of wording — catches reworded and multi-turn (fragmentation) attacks that defeat Layers 1 and 2.
- [ ] Toggle for Layer 3, matching the existing firewall toggle, for on/off demos.

**Further:**
- [ ] Expand DLP entity set and add configurable redaction policies.
- [ ] Output-side rule management (egress rules, not just input).
- [ ] Package as an OpenAI-compatible proxy so it reads like a real gateway.

---

## Known limitations (documented, not bugs)

- Layers 1 and 2 are stateless and pattern/shape-based; defeated by fragmentation attacks.
- Leak measurement is per-response until the session-level fix lands.
- No authentication; local demo only.
