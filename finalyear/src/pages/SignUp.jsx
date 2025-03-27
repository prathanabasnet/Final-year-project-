import React, { useState } from "react";
import styled, { keyframes } from "styled-components";

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
  background-color: #fff5e1;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(46, 26, 26, 0.3);
  animation: ${floatAnimation} 3s ease-in-out infinite;
`;

const Title = styled.h1`
  text-align: center;
  color: #333333;
  font-size: 24px;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #333333;
  font-size: 14px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #cccccc;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
`;

const SignUpButton = styled.button`
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
  justify-content: center;
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

const SuccessText = styled.p`
  color: green;
  margin-bottom: 20px;
  text-align: center;
`;

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("User registered successfully!");
        setUsername("");
        setEmail("");
        setPassword("");
      } else {
        setError(data.detail || "Failed to sign up. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <Container>
      <Card>
        <Title>Sign Up for API Security Framework</Title>
        <Form onSubmit={handleSubmit}>
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
            Email
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Label>
          <Label>
            Password
            <Input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Label>

          {error && <ErrorText>{error}</ErrorText>}
          {success && <SuccessText>{success}</SuccessText>}

          <SignUpButton type="submit">Sign Up</SignUpButton>
          <Links>
            <Link href="/">Already have an account? Log in</Link>
          </Links>
        </Form>
      </Card>
    </Container>
  );
};

export default SignUp;
