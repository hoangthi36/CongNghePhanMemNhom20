import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [cmnd, setCmnd] = useState("");
  const [password, setPassword] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const resetForm = () => {
    setCmnd("");
    setPassword("");
    setApartmentNumber("");
    setPhone("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!cmnd || !password || !apartmentNumber || !phone) {
      setError("Vui lòng điền tất cả các trường.");
      return;
    }

    // load users from localStorage
    const raw = localStorage.getItem("users");
    let users = [];
    try {
      users = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(users)) users = [];
    } catch (e) {
      users = [];
    }

    // check duplicate CMND
    const exists = users.some((u) => String(u.cmnd) === String(cmnd));
    if (exists) {
      setError("CMND đã tồn tại.");
      return;
    }

    const newUser = {
      cmnd,
      password,
      apartmentNumber,
      phone,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    setToast("Đăng ký thành công! Chuyển đến trang đăng nhập...");
    resetForm();

    setTimeout(() => {
      navigate("/login");
    }, 900);
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Đăng ký cư dân</h2>

        {error && <div style={styles.error}>{error}</div>}
        {toast && <div style={styles.toast}>{toast}</div>}

        <label style={styles.label}>CMND</label>
        <input
          style={styles.input}
          value={cmnd}
          onChange={(e) => setCmnd(e.target.value)}
          placeholder="Số CMND / CCCD"
        />

        <label style={styles.label}>Mật khẩu</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
        />

        <label style={styles.label}>Số căn hộ</label>
        <input
          style={styles.input}
          value={apartmentNumber}
          onChange={(e) => setApartmentNumber(e.target.value)}
          placeholder="Ví dụ: A-101"
        />

        <label style={styles.label}>Số điện thoại</label>
        <input
          style={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0xxxxxxxxx"
        />

        <button style={styles.button} type="submit">
          Đăng ký
        </button>
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
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 22,
    borderRadius: 8,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },
  title: { margin: "0 0 14px", textAlign: "center" },
  label: { fontSize: 14, marginTop: 10, marginBottom: 6 },
  input: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #e6e6e6",
    outline: "none",
    fontSize: 14,
  },
  button: {
    marginTop: 18,
    padding: "10px 12px",
    borderRadius: 6,
    background: "#059669",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
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
    background: "#ecfeff",
    color: "#065f46",
    padding: "8px 10px",
    borderRadius: 6,
    marginBottom: 8,
    fontSize: 13,
  },
};

export default Register;