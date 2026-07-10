import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function HistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setLogs(await api.getLogs());
    } catch (e) {
      setError("Couldn't load history. Is the backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <header className="page-head">
        <h1>History</h1>
        <p>Every prompt the gateway has inspected, newest first.</p>
      </header>

      <div className="row-refresh">
        <button className="btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>

      {error && <div className="notice notice-error">{error}</div>}
      {loading && <div className="notice">Loading…</div>}

      {!loading && logs.length === 0 && !error && (
        <div className="empty">No prompts yet. Send one from the Test page.</div>
      )}

      {logs.length > 0 && (
        <div className="table-wrap">
          <table className="log-table">
            <thead>
              <tr>
                <th>Verdict</th>
                <th>Firewall</th>
                <th>Prompt</th>
                <th>Model</th>
                <th>Rule</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className={"pill pill-" + row.decision}>{row.decision}</span>
                    {row.leaked ? <span className="pill pill-leak">leaked</span> : null}
                    {row.dlp_redacted ? <span className="pill pill-redact">redacted</span> : null}
                  </td>
                  <td>
                    <span className={"fw " + (row.firewall_enabled ? "fw-on" : "fw-off")}>
                      {row.firewall_enabled ? "on" : "off"}
                    </span>
                  </td>
                  <td className="cell-prompt">{row.prompt}</td>
                  <td className="cell-mono">{row.model}</td>
                  <td className="cell-mono">{row.matched_rule || "—"}</td>
                  <td className="cell-mono cell-time">{row.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
