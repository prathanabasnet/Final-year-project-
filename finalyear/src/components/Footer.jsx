import React from "react";

const Footer = () => (
  <footer className="footer">
    <p>&copy; {new Date().getFullYear()} API Security Testing Framework. All rights reserved.</p>
    <nav>
      <a href="/terms" target="_blank" rel="noopener noreferrer">
        Terms of Service
      </a>
      <span> | </span>
      <a href="/privacy" target="_blank" rel="noopener noreferrer">
        Privacy Policy
      </a>
    </nav>
  </footer>
);

export default Footer;
