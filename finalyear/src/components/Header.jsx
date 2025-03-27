import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
  <header className="header">
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/test">Test Configuration</Link>
      <Link to="/">Logout</Link>
    </nav>
  </header>
);

export default Header;
