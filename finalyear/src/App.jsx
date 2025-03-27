import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import TestConfig from "./pages/TestConfig";
import Footer from "./components/Footer";

const App = () => (
  <Router>
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Main App Content */}
      <div style={{ flex: 1 }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/test-config" element={<TestConfig />} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </Suspense>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  </Router>
);

export default App;
