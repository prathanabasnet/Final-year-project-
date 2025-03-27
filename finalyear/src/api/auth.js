import axios from "axios";
// API URL (adjust this if your backend URL is different)
const API_URL = "http://127.0.0.1:8000"; // Replace with your backend URL

// Login function
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, message: data.detail || "Login failed" };
    }

    const data = await response.json();
    return { success: true, token: data.access_token };  // Assuming access_token is returned
  } catch (error) {
    return { success: false, message: error.message || "Network error" };
  }
};

// Register function
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, message: data.detail || "Sign-up failed" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message || "Network error" };
  }
};
