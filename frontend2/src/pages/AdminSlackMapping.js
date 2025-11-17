import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function AdminSlackMapping() {
  const [mappings, setMappings] = useState([]);
  const [slackId, setSlackId] = useState('');
  const [userId, setUserId] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API}/admin/slack-mapping`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setMappings(r.data.mappings))
      .catch(() => {});
  }, []);

  const create = async () => {
    await axios.post(`${API}/admin/slack-mapping`, { slackId, userId: Number(userId) }, { headers: { Authorization: `Bearer ${token}` } });
    const r = await axios.get(`${API}/admin/slack-mapping`, { headers: { Authorization: `Bearer ${token}` } });
    setMappings(r.data.mappings);
    setSlackId(''); setUserId('');
  };

  const del = async (sid) => {
    await axios.delete(`${API}/admin/slack-mapping/${sid}`, { headers: { Authorization: `Bearer ${token}` } });
    setMappings(mappings.filter(m => m.slackId !== sid));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl mb-4">Slack → User mappings</h2>
      <div className="flex gap-2 mb-4">
        <input className="border p-2 rounded" placeholder="Slack ID (U0123456)" value={slackId} onChange={e => setSlackId(e.target.value)} />
        <input className="border p-2 rounded" placeholder="User ID (app)" value={userId} onChange={e => setUserId(e.target.value)} />
        <button onClick={create} className="bg-blue-600 text-white px-3 py-1 rounded">Map</button>
      </div>
      <table className="w-full">
        <thead><tr><th>Slack ID</th><th>User</th><th>Action</th></tr></thead>
        <tbody>
          {mappings.map(m => (
            <tr key={m.slackId}>
              <td>{m.slackId}</td>
              <td>{m.user?.name} ({m.user?.email})</td>
              <td><button onClick={() => del(m.slackId)} className="text-red-600">Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
