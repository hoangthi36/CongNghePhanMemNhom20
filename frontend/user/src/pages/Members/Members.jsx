import React, { useEffect, useState } from "react";
import { useAuth } from "../../components/Context/AuthContext";

const Members = () => {
  const { user } = useAuth();
  const cmndKey = user && user.cmnd ? String(user.cmnd) : null;

  const [members, setMembers] = useState([]);
  const [fullName, setFullName] = useState("");
  const [memberCmnd, setMemberCmnd] = useState("");
  const [relationship, setRelationship] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const storageKey = (id) => `members_${id}`;

  useEffect(() => {
    if (!cmndKey) return;
    try {
      const raw = localStorage.getItem(storageKey(cmndKey));
      const data = raw ? JSON.parse(raw) : [];
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      setMembers([]);
    }
  }, [cmndKey]);

  const saveMembers = (list) => {
    if (!cmndKey) return;
    localStorage.setItem(storageKey(cmndKey), JSON.stringify(list));
    setMembers(list);
  };

  const clearForm = () => {
    setFullName("");
    setMemberCmnd("");
    setRelationship("");
    setEditingIndex(-1);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !memberCmnd || !relationship) {
      setError("Vui lòng điền tất cả các trường.");
      return;
    }

    // duplicate check (by CMND)
    const otherIndex = members.findIndex((m, i) => String(m.cmnd) === String(memberCmnd) && i !== editingIndex);
    if (otherIndex !== -1) {
      setError("Thành viên với CMND này đã tồn tại.");
      return;
    }

    const payload = { fullName, cmnd: memberCmnd, relationship };

    if (editingIndex >= 0) {
      const updated = [...members];
      updated[editingIndex] = payload;
      saveMembers(updated);
      setToast("Cập nhật thành viên thành công.");
    } else {
      const updated = [...members, payload];
      saveMembers(updated);
      setToast("Thêm thành viên thành công.");
    }

    clearForm();
    setTimeout(() => setToast(""), 1800);
  };

  const handleEdit = (index) => {
    const m = members[index];
    if (!m) return;
    setFullName(m.fullName || "");
    setMemberCmnd(m.cmnd || "");
    setRelationship(m.relationship || "");
    setEditingIndex(index);
    setError("");
  };

  const handleDelete = (index) => {
    const ok = window.confirm("Xóa thành viên này?");
    if (!ok) return;
    const updated = members.filter((_, i) => i !== index);
    saveMembers(updated);
    setToast("Xóa thành viên thành công.");
    setTimeout(() => setToast(""), 1600);
  };

  if (!cmndKey) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Vui lòng đăng nhập để quản lý thành viên.</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.cardFull}>
        <h2 style={styles.title}>Thành viên hộ gia đình</h2>

        {error && <div style={styles.error}>{error}</div>}
        {toast && <div style={styles.toast}>{toast}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Họ và tên</label>
            <input style={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>CMND</label>
            <input style={styles.input} value={memberCmnd} onChange={(e) => setMemberCmnd(e.target.value)} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Quan hệ</label>
            <input style={styles.input} value={relationship} onChange={(e) => setRelationship(e.target.value)} />
          </div>

          <div style={styles.actions}>
            <button type="submit" style={styles.button}>{editingIndex >= 0 ? "Lưu" : "Thêm"}</button>
            <button type="button" onClick={clearForm} style={styles.buttonAlt}>Hủy</button>
          </div>
        </form>

        <div style={styles.listWrap}>
          {members.length === 0 ? (
            <div style={styles.empty}>Chưa có thành viên nào.</div>
          ) : (
            members.map((m, i) => (
              <div key={i} style={styles.memberCard}>
                <div>
                  <div style={styles.memberName}>{m.fullName}</div>
                  <div style={styles.memberMeta}>CMND: {m.cmnd} · {m.relationship}</div>
                </div>
                <div style={styles.memberActions}>
                  <button onClick={() => handleEdit(i)} style={styles.smallBtn}>Sửa</button>
                  <button onClick={() => handleDelete(i)} style={styles.smallBtnDanger}>Xóa</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "#f8fafc" },
  cardFull: { width: "100%", maxWidth: 920, padding: 20, borderRadius: 12, background: "#fff", boxShadow: "0 8px 30px rgba(2,6,23,0.06)", border: "1px solid rgba(79,70,229,0.04)" },
  title: { margin: 0, marginBottom: 12, color: "#111827" },
  form: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, alignItems: "end", marginBottom: 14 },
  field: { display: "flex", flexDirection: "column" },
  label: { fontSize: 13, color: "#374151", marginBottom: 6 },
  input: { padding: "8px 10px", borderRadius: 8, border: "1px solid #e6e6f2", fontSize: 14 },
  actions: { display: "flex", gap: 8 },
  button: { padding: "8px 12px", borderRadius: 8, background: "#4F46E5", color: "#fff", border: "none", cursor: "pointer" },
  buttonAlt: { padding: "8px 12px", borderRadius: 8, background: "#e5e7eb", color: "#111827", border: "none", cursor: "pointer" },
  listWrap: { marginTop: 8, display: "flex", flexDirection: "column", gap: 10 },
  empty: { color: "#6b7280", padding: 12 },
  memberCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, border: "1px solid #eef2ff", background: "#fff" },
  memberName: { fontWeight: 600 },
  memberMeta: { color: "#6b7280", fontSize: 13, marginTop: 4 },
  memberActions: { display: "flex", gap: 8 },
  smallBtn: { padding: "6px 10px", borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer" },
  smallBtnDanger: { padding: "6px 10px", borderRadius: 8, background: "#fee2e2", border: "none", cursor: "pointer", color: "#b91c1c" },
  error: { background: "#fee2e2", color: "#b91c1c", padding: 8, borderRadius: 6, marginBottom: 8 },
  toast: { background: "#eef2ff", color: "#3730a3", padding: 8, borderRadius: 6, marginBottom: 8 },
};

export default Members;
