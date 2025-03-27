import React, { useState } from "react";
import styled, { keyframes } from "styled-components"; // Fix: Import `keyframes` correctly

// Define the floating animation
const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// Styled components
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
`;

const ErrorText = styled.p`
  color: red;
  margin-bottom: 20px;
  text-align: center;
`;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        alert("Login successful!");
        window.location.href = "/dashboard";
      } else {
        setError(data.detail || "Invalid username or password");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <Container>
      <Card>
        <Title>Log In to API Security Framework</Title>
        <Form onSubmit={handleLogin}>
          <Label>
            Username
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Label>
          <Label>
            Password
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Label>

          {error && <ErrorText>{error}</ErrorText>}

          <LoginButton type="submit">Login</LoginButton>
          <Links>
            <Link href="/forgot-password">Forgot your password?</Link>
            <Link href="/signup">Don't have an account?</Link>
          </Links>
        </Form>
      </Card>
    </Container>
  );
};
export default Login;