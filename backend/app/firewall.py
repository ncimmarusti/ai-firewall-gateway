"""Firewall engine: load active rules and inspect prompts."""
import re
from .database import get_conn


def load_active_rules():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, name, pattern, severity FROM rules WHERE is_active = 1"
        ).fetchall()
        return [dict(r) for r in rows]


def inspect(prompt: str):
    """Return (decision, matched_rule_name_or_None).

    decision is 'blocked' if any active rule pattern matches, else 'allowed'.
    """
    for rule in load_active_rules():
        try:
            if re.search(rule["pattern"], prompt):
                return "blocked", rule["name"]
        except re.error:
            # Skip malformed patterns rather than crashing the request.
            continue
    return "allowed", None
