import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

// Animation for the floating card effect
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// Styled components for the signup page
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

const SignUpButton = styled.button`
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
  justify-content: center;
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

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const hasNavigated = useRef(false); // Track navigation to prevent loops

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Log the request details for debugging
      console.log("Sending signup request with data:", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // 1. Sign up the user
      const signupResponse = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      // Log the response status and headers
      console.log("Signup response status:", signupResponse.status);
      console.log("Signup response headers:", signupResponse.headers);

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        console.error("Signup error response:", errorData);
        throw new Error(errorData.detail || "Registration failed");
      }

      const signupData = await signupResponse.json();
      console.log("Signup successful, response data:", signupData);

      // 2. Automatically log the user in after successful signup
      console.log("Attempting auto-login with credentials:", {
        username: formData.username,
        password: formData.password,
      });

      const loginResponse = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }),
      });

      console.log("Login response status:", loginResponse.status);
      console.log("Login response headers:", loginResponse.headers);

      if (!loginResponse.ok) {
        const loginErrorData = await loginResponse.json();
        console.error("Auto-login error response:", loginErrorData);
        throw new Error(loginErrorData.detail || "Auto-login failed after signup");
      }

      const { access_token, user } = await loginResponse.json();
      console.log("Auto-login successful, response data:", { access_token, user });

      // 3. Store the authentication data
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("Stored in localStorage:", {
        access_token,
        user: JSON.stringify(user),
      });

      // 4. Redirect to the test config page
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        console.log("Navigating to /test-config...");
        navigate("/test-config", { replace: true });
      }
    } catch (err) {
      console.error("Signup error:", err);

      // Handle specific error cases
      if (err.message === "Failed to fetch") {
        setError(
          "Unable to connect to the server. Please ensure the backend server is running at http://localhost:8000 and try again."
        );
      } else if (err.message.includes("CORS")) {
        setError(
          "CORS error: The backend server is not allowing requests from this origin. Please check the backend CORS configuration."
        );
      } else {
        setError(err.message || "An error occurred during signup");
      }
    } finally {
      setIsLoading(false);
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
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </Label>
          <Label>
            Email
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </Label>
          <Label>
            Password
            <Input
              type="password"
              name="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              minLength="8"
            />
          </Label>

          {error && <ErrorText>{error}</ErrorText>}

          <SignUpButton type="submit" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </SignUpButton>

          <Links>
            <Link href="/">Already have an account? Log in</Link>
          </Links>
        </Form>
      </Card>
    </Container>
  );
};

export default SignUp;