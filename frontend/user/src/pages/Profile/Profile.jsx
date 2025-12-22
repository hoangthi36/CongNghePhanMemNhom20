import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/Context/AuthContext";

const Profile = () => {
  const { user, login } = useAuth();
  const [cmnd, setCmnd] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fromContext = user || null;
    const saved = fromContext || (() => {
      try {
        const raw = localStorage.getItem("currentUser");
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    })();

    if (saved) {
      setCmnd(saved.cmnd || "");
      setName(saved.name || "");
      setApartmentNumber(saved.apartmentNumber || "");
      setPhone(saved.phone || "");
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    setError("");

    if (!cmnd) {
      setError("CMND không hợp lệ.");
      return;
    }

    // load users
    let users = [];
    try {
      const raw = localStorage.getItem("users");
      users = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(users)) users = [];
    } catch (err) {
      users = [];
    }

    // find and update
    const idx = users.findIndex((u) => String(u.cmnd) === String(cmnd));
    if (idx === -1) {
      setError("Người dùng không tìm thấy trong hệ thống.");
      return;
    }

    const updated = { ...users[idx] };
    if (name) updated.name = name;
    if (password) updated.password = password;
    updated.apartmentNumber = apartmentNumber;
    updated.phone = phone;
    users[idx] = updated;

    localStorage.setItem("users", JSON.stringify(users));

    const newCurrent = { cmnd: updated.cmnd, name: updated.name, apartmentNumber: updated.apartmentNumber, phone: updated.phone };
    localStorage.setItem("currentUser", JSON.stringify(newCurrent));
    login(newCurrent);

    setToast("Cập nhật thông tin thành công.");
    setPassword("");
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSave}>
        <h2 style={styles.title}>Hồ sơ cư dân</h2>

        {error && <div style={styles.error}>{error}</div>}
        {toast && <div style={styles.toast}>{toast}</div>}

        <label style={styles.label}>CMND / CCCD</label>
        <input style={styles.input} value={cmnd} onChange={(e) => setCmnd(e.target.value)} disabled />

        <label style={styles.label}>Họ tên</label>
        <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên người dùng" />

        <label style={styles.label}>Mật khẩu</label>
        <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Để trống nếu không đổi" />

        <label style={styles.label}>Số căn hộ</label>
        <input style={styles.input} value={apartmentNumber} onChange={(e) => setApartmentNumber(e.target.value)} />

        <label style={styles.label}>Số điện thoại</label>
        <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />

        <button type="submit" style={styles.button}>Lưu thay đổi</button>
      </form>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "#f8fafc",
  },
  card: {
    width: "100%",
    maxWidth: 720,
    padding: 28,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(79,70,229,0.06)",
    background: "#fff",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    border: "1px solid rgba(79,70,229,0.04)",
  },
  title: { gridColumn: "1 / -1", margin: 0, marginBottom: 6, color: "#111827" },
  label: { fontSize: 13, color: "#374151", marginBottom: 6 },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #e6e6f2", outline: "none", fontSize: 14, background: "#fff" },
  button: { gridColumn: "1 / -1", marginTop: 8, padding: "10px 14px", borderRadius: 10, background: "#4F46E5", color: "#fff", border: "none", cursor: "pointer", fontSize: 15 },
  error: { gridColumn: "1 / -1", background: "#fee2e2", color: "#b91c1c", padding: "8px 10px", borderRadius: 6, fontSize: 13 },
  toast: { gridColumn: "1 / -1", background: "#eef2ff", color: "#3730a3", padding: "8px 10px", borderRadius: 6, fontSize: 13 },
};

export default Profile;
