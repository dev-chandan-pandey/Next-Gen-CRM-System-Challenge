import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);

  useEffect(() => {
    axios.get(`${API}/leads/${id}`).then((r) => setLead(r.data.lead)).catch(() => {});
  }, [id]);

  if (!lead) return <div>Loading...</div>;

  return (
    <div>
      <h2>{lead.name} — {lead.status}</h2>
      <p>Email: {lead.email} | Phone: {lead.phone}</p>
      <h3>Activities</h3>
      <ul>
        {lead.activities.map((a) => (
          <li key={a.id}>
            <b>{a.type}</b> by {a.user?.name} at {new Date(a.createdAt).toLocaleString()}<br />
            {a.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
