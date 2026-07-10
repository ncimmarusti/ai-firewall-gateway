# Architecture

Two-layer AI firewall gateway. A prompt passes the gate twice: input inspection
on the way in, output DLP on the way out.

```mermaid
flowchart TD
    User([User]) -->|prompt + model + firewall on/off| UI

    subgraph FE["Frontend - React + Vite (port 5173)"]
        UI[Dashboard]
        Test[Test page]
        History[History page]
        Rules[Rules page]
        Summary[Summary page]
        UI --- Test
        UI --- History
        UI --- Rules
        UI --- Summary
    end

    UI -->|POST /prompt| GW

    subgraph BE["Backend - FastAPI + Uvicorn (port 8000)"]
        GW[Gateway]
        GW --> FWon{firewall on?}
        FWon -->|no| Model
        FWon -->|yes| L1

        subgraph L1box["Layer 1 - Input firewall"]
            L1{regex rules match?}
        end
        L1 -->|match| Blocked[Blocked at input]
        L1 -->|no match| Model[Call model]

        Model --> Ollama

        Ollama --> L2
        subgraph L2box["Layer 2 - Output DLP (Presidio + spaCy)"]
            L2{secret shape in response?}
        end
        L2 -->|detected + firewall on| Redact["Redact to REDACTED"]
        L2 -->|detected + firewall off| Leak[Secret leaks]
        L2 -->|clean| Clean[Response passes]
    end

    subgraph LLM["Local LLM - Ollama (port 11434)"]
        Ollama[Ollama runtime + planted secret in system prompt]
        Ollama --> Tiny[TinyLlama - baseline]
        Ollama --> Mist[Mistral - comparison]
    end

    Blocked --> DB[(SQLite - firewall.db)]
    Redact --> DB
    Leak --> DB
    Clean --> DB

    L1 -. reads rules .- DB

    DB -->|/logs| History
    DB -->|/stats| Summary
    DB <-->|/rules CRUD| Rules

    Redact -->|verdict| UI
    Blocked -->|verdict| UI
    Leak -->|verdict| UI
    Clean -->|verdict| UI

    classDef store fill:#2d3748,stroke:#4a5568,color:#fff;
    classDef decision fill:#744210,stroke:#975a16,color:#fff;
    classDef bad fill:#5b1a17,stroke:#f85149,color:#fff;
    classDef good fill:#12341f,stroke:#3fb950,color:#fff;
    class DB store;
    class FWon,L1,L2 decision;
    class Blocked,Redact good;
    class Leak bad;
```

## Flow in words

1. The user submits a prompt from the React dashboard, with the chosen model and
   the firewall on/off state.
2. The FastAPI gateway receives it. If the firewall is on, **Layer 1** checks the
   prompt against regex rules loaded from SQLite. A match is blocked and logged --
   it never reaches the model.
3. A prompt that passes (or any prompt when the firewall is off) is sent to
   Ollama, which runs TinyLlama or Mistral. A fake secret is planted in the
   system prompt so extraction attempts have a real target.
4. The model's response runs through **Layer 2** -- Presidio (on spaCy) scans it
   for anything shaped like a secret. If found and the firewall is on, it's
   redacted; if the firewall is off, the secret leaks unredacted.
5. Every outcome is written to SQLite. The dashboard reads history, stats, and
   rules back from the same database.

## Components

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | React + Vite, react-router | Dashboard UI, four pages, port 5173 |
| Backend | FastAPI + Uvicorn | Gateway and API, port 8000 |
| Layer 1 | Python regex + rules table | Input injection filtering |
| Layer 2 | Presidio + spaCy | Output DLP, entity redaction |
| LLM | Ollama (TinyLlama, Mistral) | Local model runtime, port 11434 |
| Storage | SQLite (firewall.db) | Rules, prompt logs, stats |
