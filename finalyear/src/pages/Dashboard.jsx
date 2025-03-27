import React from 'react';

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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

const Navbar = () => {
  return (
    <nav style={{ backgroundColor: '#333', padding: '10px', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>SecureAPI</div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</a>
        <a href="/test-config" style={{ color: 'white', textDecoration: 'none' }}>Test</a>
        <a href="/logout" style={{ color: 'white', textDecoration: 'none' }}>Logout</a>
      </div>
    </nav>
  );
};


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


const Dashboard = () => {
  const barData = {
    labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
    datasets: [
      {
        label: 'Top affected categories',
        data: [15, 25, 10, 5],
        backgroundColor: '#4CAF50',
        borderRadius: 4,
        barThickness: 70,
        maxBarThickness: 80,
      },
    ],
  };
  

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows custom height for the chart
    plugins: {
      legend: { display: false },
    },
  };
  

  const lineData = {
    labels: ['June', 'July', 'August', 'September'],
    datasets: [
      {
        label: 'Test results over time',
        data: [10, 20, 15, 25],
        borderColor: '#007BFF',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const stats = [
    { title: 'Total APIs tested', value: 38 },
    { title: 'Vulnerabilities detected', value: 0 },
    { title: 'API security tests', value: 2 },
    { title: 'API security workflows', value: 1 },
  ];

  const riskLevels = [
    { title: 'Critical', value: 0 },
    { title: 'High', value: 0 },
    { title: 'Medium', value: 0 },
    { title: 'Low', value: 0 },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a2e', color: 'white', borderRadius: '8px' }}>
      <Navbar />
      <h1>API Security Test</h1>
      <p>You have 2 API security tests and 1 API security workflow</p>
     
      {/* Stats Section */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              flex: '1 1 calc(25% - 16px)',
              padding: '16px',
              backgroundColor: '#333',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <h3>{stat.title}</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Risk Levels */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {riskLevels.map((risk, index) => (
          <div
            key={index}
            style={{
              flex: '1 1 calc(25% - 16px)',
              padding: '16px',
              backgroundColor: '#444',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <h4>{risk.title}</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{risk.value}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{ marginBottom: '10rem', height: '50vh' }}>
        <h3>Top affected categories</h3>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      {/* Line Chart */}
      <div style={{ marginBottom: '24px' }}>
        <h3>Test results over time</h3>
        <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
    </div>
  );
};

export default Dashboard;
