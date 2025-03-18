import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";

const Header = ({isAuth}) => {
  return (
    <header>
        <div className="logo"><img src="../../../public/E learning.svg"/>E-Learning</div>

        <div className="link">
            <Link to={'/'}>Home</Link>
            <Link to={'/courses'}>Courses</Link>
            <Link to={'/live-classes'}>Live Classes</Link>
            <Link to={'/about'}>About</Link>
           {isAuth ? ( 
            <Link to={'/account'}>Account</Link>
          ) : ( 
            <Link to={'/login'}>Login</Link>
          )}
        </div>
    </header>
  );
};

export default Header;
