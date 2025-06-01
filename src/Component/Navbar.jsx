// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaUsers,
  FaCog,
  FaPaintBrush,
  FaSearch,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import "../styles/Navbar.css";
import logo from "../assets/cleam-logo-transparent.png";

const navItems = [
  { to: "/home-page", icon: <FaHome />, label: "Home" },
  { to: "/Conversations", icon: <FaUsers />, label: "Social" },
  { to: "/account-activity", icon: <FaUser />, label: "Preferences" },
  { to: "/StyleGuide", icon: <FaPaintBrush />, label: "Style Guide" },
  { to: "/settings", icon: <FaCog />, label: "Settings" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const resp = await fetch(
        `https://webdev.cse.buffalo.edu/hci/api/api/claem/users?email=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await resp.json();
      const id = data?.[0]?.[0]?.id;
      if (id) {
        navigate(`/profile/${id}`);
        setSearchQuery("");
        setShowSearch(false);
        setError("");
      } else {
        setError("User not found");
      }
    } catch (err) {
      console.error(err);
      setError("Search error");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/home-page" className="logo-link">
          <img src={logo} alt="Strings Attached logo" className="navbar-logo" />
        </Link>
        <div className="brand-text">
          <div className="brand-title">Strings Attached</div>
          <div className="brand-slogan">Swipe with a purpose, date with a passion.</div>
        </div>
      </div>

      <div className="nav-content">
        {isMobile ? (
          <>
            <button
              className="search-toggle"
              aria-label={showSearch ? "Close search bar" : "Open search bar"}
              onClick={() => {
                setShowSearch((v) => !v);
                setShowDropdown(false);
              }}
            >
              {showSearch ? <FaTimes /> : <FaSearch />}
            </button>

            <button
              className="dropdown-toggle"
              aria-label={showDropdown ? "Close menu" : "Open navigation menu"}
              onClick={() => {
                setShowDropdown((v) => !v);
                setShowSearch(false);
              }}
            >
              {showDropdown ? <FaTimes /> : <FaBars />}
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={isActive(item.to) ? "active" : ""}
                    onClick={() => setShowDropdown(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {showSearch && (
              <form onSubmit={handleSearch} className="mobile-search-bar">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" aria-label="Submit mobile user search">Go</button>
              </form>
            )}
          </>
        ) : (
          <>
            <form onSubmit={handleSearch} className="nav-search">
              <input
                type="text"
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="search-btn"
                aria-label="Submit desktop user search"
              >
                <FaSearch />
              </button>
            </form>

            <ul className="nav-links">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`nav-item ${isActive(item.to) ? "active" : ""}`}
                  >
                    {item.icon}
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        {error && <div className="search-error-message">{error}</div>}
      </div>
    </nav>
  );
};

export default Navbar;
