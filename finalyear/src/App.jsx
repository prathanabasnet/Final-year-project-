import React, { Suspense, useState, useEffect } from "react";
import { 
  Routes, 
  Route, 
  Navigate, 
  useLocation,
  useNavigate
} from "react-router-dom";
import { checkAuth, verifyToken } from "./api/auth";
import styled from "styled-components";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import TestConfig from "./pages/TestConfig";
import Footer from "./components/Footer";
import Header from "./components/Header";

// Styled components with full black background
const GlobalContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000000;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #000000;
  color: #ffffff;
  font-size: 1.5rem;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  background-color: #000000;
  color: #ffffff;
`;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const hasToken = checkAuth();
      if (!hasToken) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const isValid = await verifyToken();
        setIsAuthenticated(isValid);
        if (!isValid) navigate('/');
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/');
      }
    };

    verifyAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    return <LoadingContainer>Verifying session...</LoadingContainer>;
  }

  return isAuthenticated ? children : <Navigate to="/" replaceI />;
};

// Layout Component - hides header on auth pages
const Layout = ({ children }) => {
  const location = useLocation();
  const hideHeader = ['/', '/signup'].includes(location.pathname);

  return (
    <GlobalContainer>
      {!hideHeader && <Header />}
      <MainContent>
        {children}
      </MainContent>
      <Footer />
    </GlobalContainer>
  );
};

// App Component
const App = () => {
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setAuthChecked(true);
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingContainer>Loading application...</LoadingContainer>;
  }

  return (
    <Layout>
      <Suspense fallback={<LoadingContainer>Loading page...</LoadingContainer>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test-config" 
            element={
              <ProtectedRoute>
                <TestConfig />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default App;