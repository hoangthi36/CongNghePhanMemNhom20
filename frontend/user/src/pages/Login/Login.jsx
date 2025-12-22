import React, { useState } from "react";
import { useAuth } from "../../components/Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [cmnd, setCmnd] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setToast("");

    if (!cmnd || !password) {
      setError("Vui lòng nhập CMND và mật khẩu.");
      return;
    }

    let users = [];
    try {
      const raw = localStorage.getItem("users");
      users = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(users)) users = [];
    } catch (err) {
      users = [];
    }

    const matched = users.find(
      (u) => String(u.cmnd) === String(cmnd) && String(u.password) === String(password)
    );

    if (!matched) {
      setError("CMND hoặc mật khẩu không đúng.");
      return;
    }

    // Save currentUser and update context
    const currentUser = { cmnd: matched.cmnd, apartmentNumber: matched.apartmentNumber, phone: matched.phone };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    login(currentUser);

    setToast("Đăng nhập thành công! Đang chuyển tới trang hồ sơ...");

    setTimeout(() => {
      navigate("/profile");
    }, 700);
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Đăng nhập cư dân</h2>

        {error && <div style={styles.error}>{error}</div>}
        {toast && <div style={styles.toast}>{toast}</div>}

        <label style={styles.label}>CMND / CCCD</label>
        <input
          style={styles.input}
          value={cmnd}
          onChange={(e) => setCmnd(e.target.value)}
          placeholder="Nhập CMND/CCCD"
        />

        <label style={styles.label}>Mật khẩu</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
        />

        <button type="submit" style={styles.button}>
          Đăng nhập
        </button>
        <div style={styles.footerText}>
          Chưa có tài khoản? <Link to="/register" style={styles.link}>Đăng ký</Link>
        </div>
      </form>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "#f8fafc",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 28,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(79,70,229,0.12)",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    border: "1px solid rgba(79,70,229,0.06)",
  },
  title: { margin: "0 0 14px", textAlign: "center", color: "#111827" },
  label: { fontSize: 14, marginTop: 10, marginBottom: 6, color: "#374151" },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e6e6f2",
    outline: "none",
    fontSize: 14,
    background: "#fbfdff",
  },
  button: {
    marginTop: 18,
    padding: "10px 12px",
    borderRadius: 8,
    background: "#4F46E5",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
    boxShadow: "0 6px 18px rgba(79,70,229,0.18)",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "8px 10px",
    borderRadius: 6,
    marginBottom: 8,
    fontSize: 13,
  },
  toast: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "8px 10px",
    borderRadius: 6,
    marginBottom: 8,
    fontSize: 13,
  },
  footerText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
  },
  link: {
    color: "#4F46E5",
    textDecoration: "none",
    fontWeight: 600,
    marginLeft: 6,
  },
};

export default Login;
