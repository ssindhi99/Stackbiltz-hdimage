import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import "./HeaderBar.scss";

const HeaderBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false); // Close menu when route changes
  }, [location]);

  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">
          <Link to="/">PhotoEditPro</Link>
        </h1>

        <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <ul>
            {["/", "/Upscaler", "/resize", "/image-merge"].map(
              (path, index) => (
                <li key={index}>
                  <Link to={path}>{path.replace("/", "") || "Home"}</Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <button
          className="menu-icon"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
};

export default HeaderBar;
