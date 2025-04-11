import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const HeaderContainer = styled.header`
  background-color: #161b22;
  padding: 10px 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    color: #58a6ff;
  }
`;

const LogoutButton = styled.button`
  background-color: #f85149;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #ff6c60;
  }
`;

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <HeaderContainer>
      <Logo>SecureAPI</Logo>
      <Nav>
        <NavLink onClick={() => navigate("/dashboard")}>Dashboard</NavLink>
        <NavLink onClick={() => navigate("/test-config")}>Test Configuration</NavLink>
        <span>{user.username || "User"}</span>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;