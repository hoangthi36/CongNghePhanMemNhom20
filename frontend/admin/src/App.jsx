import React from "react";
import{useState} from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import RegisterUser from "./pages/registerUser/registerUser.jsx";
import Statistics from "./pages/Statistics/Statistics.jsx";
import Residents from "./pages/Residents/Residents.jsx";
import Posts from "./pages/Posts/Posts.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
// Bills
import Bills from "./pages/Bills/Bills";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className={`app-layout ${isLoggedIn ? 'with-sidebar' : ''}`}>
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
          <Route path="/posts" element={<Posts />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/register" element={<RegisterUser />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;
