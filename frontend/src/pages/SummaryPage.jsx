import { useEffect, useState } from "react";
import { api } from "../api.js";

function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

function Bar({ value, tone }) {
  return (
    <div className="bar-track">
      <div className={"bar-fill bar-" + tone} style={{ width: value + "%" }} />
    </div>
  );
}

export default function SummaryPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setStats(await api.getStats());
    } catch (e) {
      setError("Couldn't load stats. Is the backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const on = stats?.firewall_on;
  const off = stats?.firewall_off;

  const leakRateOff = off ? pct(off.leaked, off.total) : 0;
  const leakRateOn = on ? pct(on.leaked, on.total) : 0;

  return (
    <div className="page">
      <header className="page-head">
        <h1>Did the firewall work?</h1>
        <p>Two layers of defense, measured by outcome: did the secret actually escape?</p>
      </header>

      <div className="row-refresh">
        <button className="btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>

      {error && <div className="notice notice-error">{error}</div>}
      {loading && <div className="notice">Loading…</div>}

      {stats && !loading && (
        <>
          <div className="verdict-banner">
            {off?.total && on?.total ? (
              <>
                Secret leaks: <strong className="txt-block">{leakRateOff}%</strong> with the
                firewall off, <strong className="txt-allow">{leakRateOn}%</strong> with both layers
                on.
              </>
            ) : (
              <>
                Run the same attack with the firewall <strong>off</strong>, then{" "}
                <strong>on</strong>, to fill this in.
              </>
            )}
          </div>

          <div className="compare">
            <div className="metric">
              <div className="metric-head">
                <span>Leak rate — firewall OFF</span>
                <strong className="txt-block">{leakRateOff}%</strong>
              </div>
              <Bar value={leakRateOff} tone="block" />
              <p className="metric-note">
                {off?.leaked ?? 0} of {off?.total ?? 0} unprotected prompts leaked the secret.
              </p>
            </div>

            <div className="metric">
              <div className="metric-head">
                <span>Leak rate — firewall ON</span>
                <strong className="txt-allow">{leakRateOn}%</strong>
              </div>
              <Bar value={leakRateOn} tone="allow" />
              <p className="metric-note">
                {on?.leaked ?? 0} of {on?.total ?? 0} protected prompts leaked the secret.
              </p>
            </div>
          </div>

          <div className="layers">
            <div className="layer-card">
              <div className="layer-tag">Layer 1</div>
              <div className="layer-num">{on?.blocked ?? 0}</div>
              <div className="layer-desc">
                <strong>blocked at input</strong> by the regex firewall rules.
              </div>
            </div>
            <div className="layer-card">
              <div className="layer-tag">Layer 2</div>
              <div className="layer-num">{on?.redacted ?? 0}</div>
              <div className="layer-desc">
                <strong>caught on output</strong> by Presidio DLP — slipped past the rules, redacted
                anyway.
              </div>
            </div>
          </div>

          <div className="takeaway">
            Layer 1 stops the obvious attacks. Layer 2 is the safety net: when a cleverly-worded
            prompt bypasses the input rules, output DLP still catches the secret by its shape and
            redacts it. That's defense in depth — the same pattern real AI gateways use.
          </div>
        </>
      )}
    </div>
  );
}
