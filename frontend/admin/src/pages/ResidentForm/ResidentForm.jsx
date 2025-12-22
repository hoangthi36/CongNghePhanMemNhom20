import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Backbutton from "../../components/Backbutton/Backbutton";
import "./ResidentForm.css";

export default function ResidentForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!id) return; // add mode
    try {
      const raw = localStorage.getItem("residents");
      if (!raw) return;
      const arr = JSON.parse(raw);
      const found = arr.find((r) => String(r.id) === String(id));
      if (found) {
        setName(found.name || "");
        setUnit(found.unit || "");
        setPhone(found.phone || "");
      }
    } catch (e) {
      // ignore
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = localStorage.getItem("residents");
    let arr = [];
    if (raw) {
      try { arr = JSON.parse(raw) || []; } catch { arr = []; }
    }

    if (id) {
      const next = arr.map((r) => (String(r.id) === String(id) ? { ...r, name, unit, phone } : r));
      localStorage.setItem("residents", JSON.stringify(next));
    } else {
      const newId = `r_${Date.now()}`;
      const next = [{ id: newId, name, unit, phone }, ...arr];
      localStorage.setItem("residents", JSON.stringify(next));
    }

    navigate("/residents");
  };

  return (
    <div className="resident-form-page">
      <div className="form-top">
        <Backbutton />
        <h2>{id ? "Sửa cư dân" : "Thêm cư dân"}</h2>
      </div>

      <form className="resident-form" onSubmit={handleSubmit}>
        <label>
          Tên
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Số căn hộ
          <input value={unit} onChange={(e) => setUnit(e.target.value)} required />
        </label>

        <label>
          SĐT
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn save">Lưu</button>
        </div>
      </form>
    </div>
  );
}
