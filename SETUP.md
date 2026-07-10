# Setup

## 1. Install Ollama and pull the models

Install Ollama from https://ollama.com/download, then:

```bash
ollama pull tinyllama    # vulnerable baseline (~640 MB)
ollama pull mistral      # comparison model (~4.1 GB)
```

Ollama serves an API on http://localhost:11434 automatically.

## 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download en_core_web_sm   # NLP model for Presidio DLP
python -m uvicorn app.main:app --reload
```

Backend runs on http://localhost:8000 (docs at /docs). First start creates
`firewall.db` and seeds the firewall rules.

**Note:** the first request after startup is slow — Presidio loads its NLP model
into memory on first use. After that it's fast.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (http://localhost:5173). The backend must be running too.

## How the two layers work

- **Layer 1 — input firewall:** regex rules inspect each prompt and block known
  injection patterns before they reach the model. Toggle on the Test page.
- **Layer 2 — output DLP:** Microsoft Presidio scans the model's *response* for
  entities that look like secrets (credentials, SSNs, emails, credit cards) and
  redacts them. This catches attacks that slip past the input rules.

A planted fake secret (`SWORDFISH-9931`) lives in the model's system prompt so
extraction attempts have a real target. Presidio detects it by *shape*, not by
knowing the value — the way real DLP works.
