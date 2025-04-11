// frontend/src/api/auth.js
const API_URL = "http://localhost:8000"; // Ensure this matches your backend URL

// Helper function to handle API responses
const handleResponse = async (response) => {
  const text = await response.text(); // Get the raw response text for debugging
  console.log("Raw response text:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error("Error parsing response as JSON:", error);
    throw new Error("Invalid response from server: not valid JSON");
  }

  if (!response.ok) {
    console.error("Response not ok:", response.status, data);
    throw new Error(data.detail || "Request failed");
  }
  return data;
};

// Login function
export const loginUser = async (credentials) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    console.log("Sending login request to:", `${API_URL}/api/login`);
    console.log("Request body:", formData.toString());

    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    console.log("Login response status:", response.status);
    console.log("Login response headers:", [...response.headers.entries()]);

    const data = await handleResponse(response);

    console.log("Login response data:", data);

    // Ensure user data is present
    const userData = data.user || { username: credentials.username };
    console.log("Computed userData:", userData);

    if (!userData.username) {
      throw new Error("Username not found in response");
    }

    const result = {
      success: true,
      token: data.access_token,
      user: userData,
    };
    console.log("Returning result:", result);

    return result;
  } catch (error) {
    console.error("Login error in loginUser:", error);
    return {
      success: false,
      message: error.message || "Login failed. Please try again.",
    };
  }
};

// Register function
export const registerUser = async (userData) => {
  try {
    console.log("Sending signup request to:", `${API_URL}/api/signup`);
    console.log("Request body:", JSON.stringify(userData));

    const response = await fetch(`${API_URL}/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
      }),
    });

    console.log("Signup response status:", response.status);
    console.log("Signup response headers:", [...response.headers.entries()]);

    const data = await handleResponse(response);
    console.log("Signup response data:", data);

    return { success: true, data };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.message || "Registration failed. Please try again.",
    };
  }
};

// Logout function
export const logoutUser = () => {
  console.log("Logging out user...");
  localStorage.removeItem("access_token");
  localStorage.removeItem("user"); // Remove the full user object
};

// Check authentication status
export const checkAuth = () => {
  const token = localStorage.getItem("access_token");
  console.log("checkAuth - Token found:", !!token);
  return !!token;
};

// Get current user info
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");
  console.log("getCurrentUser - Retrieved user and token:", { user, token });
  return {
    user: user ? JSON.parse(user) : null,
    token,
  };
};

// Protected API request helper
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    console.log(`Sending authFetch request to: ${API_URL}${url}`);
    console.log("Request headers:", headers);
    console.log("Request options:", options);

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    console.log("authFetch response status:", response.status);
    console.log("authFetch response headers:", [...response.headers.entries()]);

    const data = await handleResponse(response);
    console.log("authFetch response data:", data);

    return data;
  } catch (error) {
    console.error("authFetch error:", error);
    if (error.message.includes("401") || error.message === "Unauthorized") {
      console.log("Unauthorized request, logging out...");
      logoutUser();
    }
    throw error;
  }
};

// Verify token validity
export const verifyToken = async () => {
  try {
    if (!checkAuth()) {
      console.log("verifyToken - No token found");
      return false;
    }

    console.log("Verifying token with /api/protected...");
    const data = await authFetch("/api/protected");

    console.log("verifyToken response data:", data);

    // Check if the response contains a username, indicating a valid token
    const isValid = !!data.username;
    console.log("verifyToken - Token is valid:", isValid);

    return isValid;
  } catch (error) {
    console.error("verifyToken error:", error);
    return false;
  }
};