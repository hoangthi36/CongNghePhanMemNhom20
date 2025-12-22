import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import sampleData from "./data.json";
import "./Residents.css";

export default function Residents() {
  const [residents, setResidents] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "/";
        const res = await fetch(`${base}house-hold/all-households`);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!mounted) return;
        const normalized = (Array.isArray(data) ? data : []).map((h) => ({
          id: h._id || h.id,
          name: h.namehousehold || h.name || "-",
          address: h.address || "-",
          head: h.namehead || "-",
          headId: h.identification_head || "-",
          members: Array.isArray(h.members) ? h.members : [],
          raw: h,
        }));
        setResidents(normalized);
      } catch (e) {
        // fallback to local sample data
        const normalized = (Array.isArray(sampleData) ? sampleData : []).map((h) => ({
          id: h._id || h.id,
          name: h.namehousehold || h.name || "-",
          address: h.address || "-",
          head: h.namehead || "-",
          headId: h.identification_head || "-",
          members: Array.isArray(h.members) ? h.members : [],
          raw: h,
        }));
        if (mounted) setResidents(normalized);
      }
    };

    load();
    return () => { mounted = false };
  }, []);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="residents-page">
      <div className="residents-header">
        <h2>Danh sách hộ gia đình</h2>
        <Link to="/residents/add" className="btn add-btn">Thêm mới</Link>
      </div>

      <div className="residents-table-wrap">
        <table className="residents-table">
          <thead>
            <tr>
              <th>Tên hộ</th>
              <th>Địa chỉ</th>
              <th>Chủ hộ</th>
              <th>Số thành viên</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {residents.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">Không có dữ liệu</td>
              </tr>
            ) : (
              residents.map((r) => (
                <React.Fragment key={r.id}>
                  <tr>
                    <td>{r.name}</td>
                    <td>{r.address}</td>
                    <td>{r.head} <div className="muted">({r.headId})</div></td>
                    <td>{r.members.length}</td>
                    <td className="actions">
                      <button className="btn small" onClick={() => toggleExpand(r.id)}>{expandedId === r.id ? 'Ẩn' : 'Xem'}</button>
                      <Link to={`/residents/edit/${r.id}`} className="btn small">Sửa</Link>
                    </td>
                  </tr>

                  {expandedId === r.id && (
                    <tr className="members-row">
                      <td colSpan={5} style={{ padding: 8 }}>
                        <div className="members-list">
                          <strong>Thành viên:</strong>
                          <ul>
                            {r.members.length === 0 ? (
                              <li className="muted">Không có thành viên</li>
                            ) : (
                              r.members.map((m) => (
                                <li key={m._id || m.identification || JSON.stringify(m)}>
                                  {m.name || m.ten || "-"} — {m.relationship || m.relationship || "-"} {m.identification ? `(${m.identification})` : ''}
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
