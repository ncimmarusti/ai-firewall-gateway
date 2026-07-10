# AI Firewall / Gateway

A two-layer security gateway that sits between a user and a large language model.
It stops malicious prompts going **in** (prompt injection) and sensitive data
leaking **out** (data loss), and demonstrates — with real before/after numbers —
why filtering belongs in front of an LLM.

## The idea

Prompt injection is the top entry on the OWASP LLM Top 10, and models can be
tricked into revealing data they were told to protect. This project makes the
case concretely: a fake secret is planted in the model's context, and you can run
attacks with the firewall off vs. on and watch the difference. The design is
**defense in depth** — two independent layers, so an attack that slips past the
first is still caught by the second.

## The two layers

**Layer 1 — input firewall.** Regex rules inspect each prompt before it reaches
the model and block known injection patterns. Fast, deterministic, and
transparent — but only catches attacks phrased the way the rules anticipate.

**Layer 2 — output DLP.** Microsoft Presidio scans the model's response for
anything shaped like a secret (credentials, SSNs, emails, credit cards) and
redacts it. It detects data by its *shape*, not by knowing the value — so it
catches leaks that slip past the input rules.

## Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | React + Vite, react-router | Dashboard UI (Test, History, Rules, Summary), port 5173 |
| Backend | FastAPI + Uvicorn | Gateway and API, port 8000 |
| Layer 1 | Python `re` + rules in SQLite | Input injection filtering |
| Layer 2 | Presidio + spaCy | Output DLP, entity detection and redaction |
| LLM | Ollama (TinyLlama, Mistral) | Local model runtime, port 11434 |
| Storage | SQLite (`firewall.db`) | Rules, prompt logs, stats |

## Project docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — the two-layer flow, diagram, component table
- [`REQUIREMENTS.md`](./REQUIREMENTS.md) — functional/non-functional requirements, success criteria
- [`ROADMAP.md`](./ROADMAP.md) — build phases and planned enhancements
- [`SETUP.md`](./SETUP.md) — install and run instructions

## Quick start

See [`SETUP.md`](./SETUP.md). In short: install Ollama and pull the models, run
the FastAPI backend (with Presidio + a spaCy model), then run the React frontend.

## Demo

With the firewall **off**, an extraction prompt leaks the planted secret. With it
**on**, obvious attacks are blocked at input (Layer 1) and any secret in the
output is redacted (Layer 2). The Summary page shows leak rate off vs. on and how
many attacks each layer caught.

## Known limitations

This is a proof of concept, not a production system. Both layers are stateless
and pattern/shape-based, so they're defeated by multi-turn **fragmentation
attacks** (extracting the secret one piece at a time across several prompts).
Leak measurement currently only fires when the full secret appears in a single
response, so fragmented leaks aren't yet scored correctly. There's no
authentication — it's a local demo. See the roadmap for the planned fixes
(session-level leak tracking and an intent-based classifier).

## Status

Learning / portfolio project. Not intended for production use.
