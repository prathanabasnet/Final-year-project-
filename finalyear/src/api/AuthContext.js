import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "./auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Starting initializeAuth...");
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      let parsedUser = null;
      if (storedUser && typeof storedUser === "string" && storedUser !== "undefined") {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
          localStorage.removeItem("user");
        }
      }

      if (token && parsedUser) {
        console.log("Verifying token on app load...");
        try {
          const isValid = await Promise.race([
            verifyToken(token),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Token verification timed out")), 5000))
          ]);
          console.log("Token verification result:", isValid);
          if (isValid) {
            setUser(parsedUser);
            console.log("User state set in initializeAuth:", parsedUser);
          } else {
            console.log("Token invalid, clearing auth data...");
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            setUser(null);
            navigate("/", { replace: true });
          }
        } catch (error) {
          console.error("Error during token verification:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setUser(null);
          navigate("/", { replace: true });
        }
      } else {
        console.log("No token or user data found, clearing auth data...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setUser(null);
      }

      console.log("Finished initializeAuth, setting loading to false");
      setLoading(false);
    };

    // Remove the `loading` dependency to ensure this only runs once on mount
    initializeAuth();
  }, [navigate]); // Only depend on `navigate`

  const login = (token, userData) => {
    const defaultUser = { username: "unknown" };
    const finalUserData = userData || defaultUser;
    console.log("Logging in with userData:", finalUserData);
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(finalUserData));
    setUser(finalUserData);
    console.log("User state after login:", finalUserData);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);