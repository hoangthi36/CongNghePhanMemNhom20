import React from "react";
import{useState} from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Statistics from "./pages/Statistics/Statistics.jsx";
import Residents from "./pages/Residents/Residents.jsx";
import ResidentForm from "./pages/ResidentForm/ResidentForm.jsx";
import Meters from "./pages/Meters/Meters.jsx";
import Posts from "./pages/Posts/Posts.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";

// Bills
import Bills from "./pages/Bills/Bills";
import BillForm from "./pages/Bills/BillForm";
import OverdueList from "./pages/Bills/OverdueList";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app-layout">
     {isLoggedIn && <Sidebar />}
      <div className="content">
        <Routes>
          {/*neu chua dang nhap thi hien thi trang login*/}
          {!isLoggedIn && (
            <Route path="*" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
          )}
          {isLoggedIn && (
            <>
          <Route path="/" element={<Navigate to="/statistics" />} />         
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/residents" element={<Residents />} />
          <Route path="/residents/add" element={<ResidentForm />} />
          <Route path="/residents/edit/:id" element={<ResidentForm />} />
          <Route path="/meters" element={<Meters />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/bills/add" element={<BillForm />} />
          <Route path="/bills/edit/:id" element={<BillForm />} />
          <Route path="/bills/overdue" element={<OverdueList />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;
