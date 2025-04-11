import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { loginUser } from "../api/auth";

// Animation for the floating card effect
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// Styled components for the login page
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #0d1117;
`;

const Card = styled.div`
  width: 400px;
  background-color: #161b22;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(46, 26, 26, 0.3);
  animation: ${floatAnimation} 3s ease-in-out infinite;
`;

const Title = styled.h1`
  text-align: center;
  color: #ffffff;
  font-size: 24px;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #c9d1d9;
  font-size: 14px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #30363d;
  background-color: #0d1117;
  color: #c9d1d9;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #58a6ff;
  }
`;

const LoginButton = styled.button`
  padding: 10px;
  background-color: #238636;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.2s;
  &:hover {
    background-color: #2ea043;
  }
  &:disabled {
    background-color: #5a6e5e;
    cursor: not-allowed;
  }
`;

const Links = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Link = styled.a`
  color: #58a6ff;
  text-decoration: none;
  font-size: 12px;
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorText = styled.p`
  color: #f85149;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
`;

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const hasNavigated = useRef(false); // Track navigation to prevent loops

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!credentials.username || !credentials.password) {
        throw new Error("Username and password are required");
      }

      console.log("Attempting login with credentials:", {
        username: credentials.username,
        password: credentials.password,
      });

      const result = await loginUser({
        username: credentials.username,
        password: credentials.password,
      });

      console.log("Login result:", result);

      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }

      console.log("Login successful, result:", result);
      console.log("result.user:", result.user);

      // Store the token and user in localStorage
      localStorage.setItem("access_token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      console.log("Stored in localStorage:", {
        access_token: localStorage.getItem("access_token"),
        user: localStorage.getItem("user"),
      });

      // Navigate to /test-config
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        console.log("Navigating to /test-config...");
        navigate("/test-config", { replace: true });
      }
    } catch (err) {
      console.error("Login error in handleSubmit:", err);
      if (err.message === "Failed to fetch") {
        setError(
          "Unable to connect to the server. Please ensure the backend server is running at http://localhost:8000 and try again."
        );
      } else if (err.message.includes("CORS")) {
        setError(
          "CORS error: The backend server is not allowing requests from this origin. Please check the backend CORS configuration."
        );
      } else {
        setError(err.message || "Login failed. Please try again.");
      }

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Log In to API Security Framework</Title>
        <Form onSubmit={handleSubmit}>
          <Label>
            Username
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </Label>
          <Label>
            Password
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </Label>

          {error && <ErrorText>{error}</ErrorText>}

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </LoginButton>

          <Links>
            <Link href="/forgot-password">Forgot password?</Link>
            <Link href="/signup">Create account</Link>
          </Links>
        </Form>
      </Card>
    </Container>
  );
};

export default Login;