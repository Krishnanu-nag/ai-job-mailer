// Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css"

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const isLoggedIn = userInfo && userInfo.yourName && userInfo.college && userInfo.phone;

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    if (onLogout) onLogout(); // notify parent
    navigate("/"); // redirect
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <nav className="navbar">
     <div className="nav-items">
         <span className="navbar-btns">
        <button className="navbar-btns" onClick={handleHome}>
          Home
        </button>
      </span>
      <span className="navbar-btns">
        {isLoggedIn && (
          <button className="navbar-btns" onClick={handleLogout}>
            Logout
          </button>
        )}
      </span>
     </div>
    </nav>
  );
}
