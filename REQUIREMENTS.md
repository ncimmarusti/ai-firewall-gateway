# AI Firewall / Gateway — Requirements Document

**Project:** Two-Layer Prompt-Injection & Data-Loss Gateway (Proof of Concept)
**Type:** Learning / portfolio project (local single-machine lab)

---

## 1. Project Overview

A security gateway between a user and a local LLM that defends in two directions.
Layer 1 inspects incoming prompts and blocks known injection patterns. Layer 2
inspects outgoing responses and redacts sensitive data. A fake secret planted in
the model's context gives extraction attempts a real target, so the system can be
measured by outcome: did the secret actually escape, with the firewall off vs. on?

---

## 2. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | Accept prompts through a web dashboard, with model selection and a firewall on/off toggle. |
| FR-2 | **Layer 1:** inspect each prompt against a configurable rules database and block matches before they reach the model. |
| FR-3 | Forward approved prompts to a local LLM (Ollama) and capture the response. |
| FR-4 | Plant a fake secret in the model's system prompt so extraction attempts have a target. |
| FR-5 | **Layer 2:** scan each response with Presidio for secret-shaped entities and redact them when the firewall is on. |
| FR-6 | Record every event: prompt, decision, matched rule, response, firewall state, entities found, whether it leaked or was redacted. |
| FR-7 | Provide full CRUD on firewall rules through the dashboard. |
| FR-8 | Show a history of all attempts and a summary of firewall effectiveness (leak rate off vs. on, per-layer catch counts). |

---

## 3. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Input inspection adds negligible latency; the LLM call dominates response time. |
| NFR-2 | Presidio loads its NLP model once on first use; subsequent scans are fast. |
| NFR-3 | Persist rules and logs in SQLite; the database recreates and re-seeds on startup if missing. |
| NFR-4 | Code is documented and readable for portfolio review. |
| NFR-5 | Local-only deployment; no authentication (documented limitation). |

---

## 4. Constraints

- **Models:** TinyLlama (weak baseline) and Mistral (comparison), run locally via Ollama.
- **Stack:** FastAPI + Uvicorn (backend), React + Vite (frontend), SQLite (storage), Presidio + spaCy (DLP).
- **Detection:** Layer 1 is regex/signature-based; Layer 2 is entity-shape-based. Neither is AI/intent-based (that's future work).

---

## 5. Success Criteria

- [x] Working dashboard with model selector and firewall toggle.
- [x] Layer 1 blocks known injection categories at input.
- [x] Layer 2 detects and redacts secret-shaped data in output, catching input bypasses.
- [x] Planted secret leaks with the firewall off; is defended with it on.
- [x] Summary shows leak rate off vs. on and per-layer catch counts.
- [x] Rules manageable live from the dashboard.

---

## 6. Known Limitations

- Both layers are **stateless and pattern/shape-based**, so they're defeated by multi-turn **fragmentation attacks** (extracting the secret piece by piece).
- **Leak measurement** only fires when the full secret appears in one response, so fragmented leaks are under-counted — the stats can report "safe" when the secret actually escaped across turns.
- No authentication; local demo only.

---

## 7. Out of Scope (planned — see ROADMAP)

- Session-level cumulative leak tracking (honest measurement of fragmented leaks).
- Layer 3: intent-based classification (LLM-as-judge) to catch reworded and multi-turn attacks.
- Expanded DLP entity set and output-side redaction policies.
