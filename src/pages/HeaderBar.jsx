import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import "./HeaderBar.scss";

const HeaderBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        {/* Logo */}
        <h1 className="logo">
          <Link to="/">PhotoEditPro</Link>
        </h1>

        {/* Navigation Links */}
        <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <ul>
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/Upscaler" onClick={() => setMenuOpen(false)}>
                Up Scaler
              </Link>
            </li>
            <li>
              <Link to="/resize" onClick={() => setMenuOpen(false)}>
                ReSize Image
              </Link>
            </li>
            <li>
              <Link to="/image-merge" onClick={() => setMenuOpen(false)}>
                Ai Image
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Menu Icon */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
