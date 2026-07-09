"""FastAPI gateway: inspects prompts, routes to Ollama, logs everything."""
import os
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .database import init_db, seed_rules, get_conn
from .firewall import inspect

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "tinyllama")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_rules()
    yield


app = FastAPI(title="AI Firewall Gateway", lifespan=lifespan)

# React dev server runs on a different port; allow it during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- models ----------
class PromptIn(BaseModel):
    prompt: str
    model: str | None = None


class RuleIn(BaseModel):
    name: str
    pattern: str
    severity: str = "medium"
    is_active: bool = True


# ---------- health ----------
@app.get("/health")
def health():
    return {"status": "ok"}


# ---------- prompt flow ----------
@app.post("/prompt")
async def submit_prompt(body: PromptIn):
    decision, matched = inspect(body.prompt)
    model = body.model or DEFAULT_MODEL
    response_text = None

    if decision == "allowed":
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                r = await client.post(
                    f"{OLLAMA_URL}/api/generate",
                    json={"model": model, "prompt": body.prompt, "stream": False},
                )
                r.raise_for_status()
                response_text = r.json().get("response", "")
        except Exception as e:
            response_text = f"[LLM error: {e}]"

    with get_conn() as conn:
        conn.execute(
            "INSERT INTO prompts (prompt, model, decision, matched_rule, response) "
            "VALUES (?, ?, ?, ?, ?)",
            (body.prompt, model, decision, matched, response_text),
        )

    return {
        "decision": decision,
        "matched_rule": matched,
        "model": model,
        "response": response_text,
    }


@app.get("/logs")
def get_logs(limit: int = 100):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM prompts ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


@app.get("/stats")
def stats():
    with get_conn() as conn:
        blocked = conn.execute(
            "SELECT COUNT(*) c FROM prompts WHERE decision='blocked'"
        ).fetchone()["c"]
        allowed = conn.execute(
            "SELECT COUNT(*) c FROM prompts WHERE decision='allowed'"
        ).fetchone()["c"]
        return {"blocked": blocked, "allowed": allowed, "total": blocked + allowed}


# ---------- rules CRUD ----------
@app.get("/rules")
def list_rules():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM rules ORDER BY id").fetchall()
        return [dict(r) for r in rows]


@app.post("/rules")
def create_rule(rule: RuleIn):
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO rules (name, pattern, severity, is_active) VALUES (?, ?, ?, ?)",
            (rule.name, rule.pattern, rule.severity, int(rule.is_active)),
        )
        return {"id": cur.lastrowid, **rule.model_dump()}


@app.put("/rules/{rule_id}")
def update_rule(rule_id: int, rule: RuleIn):
    with get_conn() as conn:
        cur = conn.execute(
            "UPDATE rules SET name=?, pattern=?, severity=?, is_active=? WHERE id=?",
            (rule.name, rule.pattern, rule.severity, int(rule.is_active), rule_id),
        )
        if cur.rowcount == 0:
            raise HTTPException(404, "Rule not found")
        return {"id": rule_id, **rule.model_dump()}


@app.delete("/rules/{rule_id}")
def delete_rule(rule_id: int):
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM rules WHERE id=?", (rule_id,))
        if cur.rowcount == 0:
            raise HTTPException(404, "Rule not found")
        return {"deleted": rule_id}
