# Architecture

How a prompt flows through the AI firewall gateway.

```mermaid
flowchart TD
    User([User]) -->|submits prompt| UI[React Web Dashboard]

    subgraph Frontend
        UI
        Rules[Rules Management UI]
        Feed[Live Prompt Feed / Stats]
    end

    UI -->|POST /prompt| API[FastAPI Gateway]
    Rules -->|CRUD /rules| API
    Feed -->|GET /logs| API

    subgraph Backend[FastAPI Backend]
        API --> Inspect{Firewall<br/>Inspection}
        Inspect -->|load active rules| DB[(SQLite)]
    end

    Inspect -->|match found| Blocked[Block + Log]
    Inspect -->|no match| Forward[Forward to LLM]

    Forward --> Ollama[Ollama Runtime]
    subgraph LLM[Local LLM]
        Ollama --> Base[TinyLlama<br/>vulnerable baseline]
        Ollama --> Comp[Mistral 7B<br/>comparison]
    end

    Ollama -->|response| LogResp[Log Response]
    Blocked --> DB
    LogResp --> DB

    DB -->|logs + stats| Feed

    classDef store fill:#2d3748,stroke:#4a5568,color:#fff;
    classDef decision fill:#744210,stroke:#975a16,color:#fff;
    class DB store;
    class Inspect decision;
```

## Flow summary

1. User submits a prompt through the React dashboard.
2. FastAPI gateway loads active rules from SQLite and inspects the prompt.
3. On a rule match, the request is blocked and logged.
4. Otherwise it's forwarded to Ollama (TinyLlama baseline or Mistral comparison).
5. The response is logged, and the dashboard reads logs and stats back from SQLite.
