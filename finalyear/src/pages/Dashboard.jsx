import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import styled from "styled-components";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Styled components
const Container = styled.div`
  min-height: 100vh;
  padding: 20px;
  background-color: #1a1a2e;
  color: white;
  border-radius: 8px;
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: { total_tests: 0, vulnerabilities: 0, tests: 0, workflows: 0 },
    risk_levels: { critical: 0, high: 0, medium: 0, low: 0 },
    categories: {},
    timeline: {},
  });

  // Redirect if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("No token found, redirecting to /...");
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data...");
        const response = await fetch("http://localhost:8000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Dashboard response status:", response.status);
        console.log("Dashboard response headers:", response.headers);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Dashboard error response:", errorData);
          throw new Error(errorData.detail || "Failed to fetch dashboard data");
        }

        const data = await response.json();
        console.log("Dashboard data:", data);
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err.message.includes("401")) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          navigate("/");
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const barData = {
    labels: Object.keys(dashboardData.categories),
    datasets: [
      {
        label: "Top affected categories",
        data: Object.values(dashboardData.categories),
        backgroundColor: "#4CAF50",
        borderRadius: 4,
        barThickness: 70,
        maxBarThickness: 80,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  const lineData = {
    labels: Object.keys(dashboardData.timeline),
    datasets: [
      {
        label: "Test results over time",
        data: Object.values(dashboardData.timeline),
        borderColor: "#007BFF",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const stats = [
    { title: "Total APIs tested", value: dashboardData.stats.total_tests },
    { title: "Vulnerabilities detected", value: dashboardData.stats.vulnerabilities },
    { title: "API security tests", value: dashboardData.stats.tests },
    { title: "API security workflows", value: dashboardData.stats.workflows },
  ];

  const riskLevels = [
    { title: "Critical", value: dashboardData.risk_levels.critical },
    { title: "High", value: dashboardData.risk_levels.high },
    { title: "Medium", value: dashboardData.risk_levels.medium },
    { title: "Low", value: dashboardData.risk_levels.low },
  ];

  return (
    <Container>
      <h1>API Security Test</h1>
      <p>
        You have {dashboardData.stats.tests} API security tests and{" "}
        {dashboardData.stats.workflows} API security workflows
      </p>

      {/* Stats Section */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              flex: "1 1 calc(25% - 16px)",
              padding: "16px",
              backgroundColor: "#333",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3>{stat.title}</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Risk Levels */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        {riskLevels.map((risk, index) => (
          <div
            key={index}
            style={{
              flex: "1 1 calc(25% - 16px)",
              padding: "16px",
              backgroundColor: "#444",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h4>{risk.title}</h4>
            <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>{risk.value}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{ marginBottom: "10rem", height: "50vh" }}>
        <h3>Top affected categories</h3>
        <Bar data={barData} options={barOptions} />
      </div>

      {/* Line Chart */}
      <div style={{ marginBottom: "24px" }}>
        <h3>Test results over time</h3>
        <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
    </Container>
  );
};

export default Dashboard;