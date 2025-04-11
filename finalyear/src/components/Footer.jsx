import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  background-color: #161b22;
  padding: 10px 20px;
  color: #c9d1d9;
  text-align: center;
`;

const FooterLink = styled.a`
  color: #58a6ff;
  text-decoration: none;
  margin: 0 5px;
  &:hover {
    text-decoration: underline;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <p>© {new Date().getFullYear()} API Security Testing Framework. All rights reserved.</p>
      <nav>
        <FooterLink href="/terms" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </FooterLink>
        <span> | </span>
        <FooterLink href="/privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </FooterLink>
      </nav>
    </FooterContainer>
  );
};

export default Footer;