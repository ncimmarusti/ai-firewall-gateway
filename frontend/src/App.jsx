import { NavLink, Routes, Route } from "react-router-dom";
import TestPage from "./pages/TestPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import RulesPage from "./pages/RulesPage.jsx";
import SummaryPage from "./pages/SummaryPage.jsx";

export default function App() {
  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">
          <span className="brand-mark">▚</span>
          <span className="brand-text">
            AI FIREWALL
            <em>gateway console</em>
          </span>
        </div>

        <nav className="nav">
          <NavLink to="/" end className="nav-link">
            <span className="nav-num">01</span> Test
          </NavLink>
          <NavLink to="/history" className="nav-link">
            <span className="nav-num">02</span> History
          </NavLink>
          <NavLink to="/rules" className="nav-link">
            <span className="nav-num">03</span> Rules
          </NavLink>
          <NavLink to="/summary" className="nav-link">
            <span className="nav-num">04</span> Summary
          </NavLink>
        </nav>

        <div className="rail-foot">
          <span className="dot" /> gateway online
        </div>
      </aside>

      <main className="stage">
        <Routes>
          <Route path="/" element={<TestPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </main>
    </div>
  );
}
