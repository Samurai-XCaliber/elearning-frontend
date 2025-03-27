import React, { useState } from "react";
import "./header.css";
import { Link } from "react-router-dom";

const Header = ({ isAuth }) => {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <header>
      <div className="logo">
        <img src="../../../public/E learning.svg" alt="Logo" />
        EDUSEI
      </div>

      <div className="menu-toggle" onClick={toggleMenu}>
        ☰
      </div>

      <div className={`link ${menuActive ? "active" : ""}`}>
        <Link to={"/"}>Home</Link>
        <Link to={"/courses"}>Courses</Link>
        <Link to={"/live-classes"}>Live Classes</Link>
        <Link to={"/about"}>About</Link>
        {isAuth ? (
          <Link to={"/account"}>Account</Link>
        ) : (
          <Link to={"/login"}>Login</Link>
        )}
      </div>
    </header>
  );
};

export default Header;
