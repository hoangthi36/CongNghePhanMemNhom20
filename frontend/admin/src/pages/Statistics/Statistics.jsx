import React, { useEffect, useState } from "react";
import "./Statistics.css";

export default function Statistics() {
  const [totalHouseholds, setTotalHouseholds] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    // Try multiple common localStorage keys; fall back to defaults
    try {
      const rawHouseholds = localStorage.getItem("households");
      if (rawHouseholds) {
        const arr = JSON.parse(rawHouseholds);
        if (Array.isArray(arr)) setTotalHouseholds(arr.length);
      }

      const rawStats = localStorage.getItem("adminStats");
      if (rawStats) {
        const s = JSON.parse(rawStats);
        if (s.totalCollected != null) setTotalCollected(Number(s.totalCollected) || 0);
        if (s.overdueCount != null) setOverdueCount(Number(s.overdueCount) || 0);
        if (s.totalHouseholds != null) setTotalHouseholds(Number(s.totalHouseholds) || totalHouseholds);
      }

      const rawTotal = localStorage.getItem("totalCollected");
      if (rawTotal) setTotalCollected(Number(rawTotal) || 0);

      const rawOverdue = localStorage.getItem("overdueCount");
      if (rawOverdue) setOverdueCount(Number(rawOverdue) || 0);
    } catch (err) {
      // ignore parse errors
      // keep defaults
    }
  }, []);

  const fmt = (n) => {
    if (typeof n !== "number") return "0";
    return n.toLocaleString();
  };

  return (
    <div className="stats-page">
      <h1 className="stats-title">Thống kê</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Tổng số hộ dân</div>
          <div className="stat-value">{fmt(totalHouseholds)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Tổng tiền đã thu</div>
          <div className="stat-value">{fmt(totalCollected)} ₫</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Số hộ quá hạn</div>
          <div className="stat-value">{fmt(overdueCount)}</div>
        </div>
      </div>
    </div>
  );
}
