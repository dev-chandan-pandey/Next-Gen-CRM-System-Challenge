// import React from 'react';

// export default function Dashboard() {
//   return (
//     <div>
//       <h2>Dashboard</h2>
//       <p>Analytics charts will be here (monthly leads, conversion rates, team performance).</p>
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, ArcElement);

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function Dashboard() {
  const token = localStorage.getItem("token");
  const [lineData, setLineData] = useState(null);
  const [conversion, setConversion] = useState(null);

  useEffect(() => {
    axios.get(`${API}/analytics/leads-by-day?range=30`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const labels = res.data.data.map(d => d.day);
      const numbers = res.data.data.map(d => d.count);
      setLineData({
        labels,
        datasets: [{
          label: "Leads per Day (30 days)",
          data: numbers,
          borderColor: "blue",
          backgroundColor: "rgba(0,0,255,0.2)"
        }]
      });
    });

    axios.get(`${API}/analytics/conversion`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setConversion(res.data));

  }, [token]);

  if (!lineData || !conversion) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2>Dashboard</h2>

      {/* Line chart */}
      <div style={{ width: 600, background: "#fff", padding: 20, borderRadius: 8 }}>
        <Line data={lineData} />
      </div>

      {/* Conversion Gauge (simple text + circle) */}
      <div style={{ marginTop: 30 }}>
        <h3>Conversion Rate</h3>
        <div style={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "#f1f1f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24
        }}>
          {conversion.conversionRate.toFixed(2)}%
        </div>
        <p>Total Leads: {conversion.total}</p>
        <p>Won Leads: {conversion.won}</p>
      </div>
    </div>
  );
}
