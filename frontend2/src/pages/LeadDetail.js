// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// export default function LeadDetail() {
//   const { id } = useParams();
//   const [lead, setLead] = useState(null);

//   useEffect(() => {
//     axios.get(`${API}/leads/${id}`).then((r) => setLead(r.data.lead)).catch(() => {});
//   }, [id]);

//   if (!lead) return <div>Loading...</div>;

//   return (
//     <div>
//       <h2>{lead.name} — {lead.status}</h2>
//       <p>Email: {lead.email} | Phone: {lead.phone}</p>
//       <h3>Activities</h3>
//       <ul>
//         {lead.activities.map((a) => (
//           <li key={a.id}>
//             <b>{a.type}</b> by {a.user?.name} at {new Date(a.createdAt).toLocaleString()}<br />
//             {a.content}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// export default function LeadDetail() {
//   const { id } = useParams();
//   const [lead, setLead] = useState(null);
//   const [type, setType] = useState('NOTE');
//   const [content, setContent] = useState('');
//   const token = localStorage.getItem('token');

//   const fetchLead = () => axios.get(`${API}/leads/${id}`).then(r=>setLead(r.data.lead)).catch(()=>{});

//   useEffect(() => { fetchLead(); }, [id]);

//   const addActivity = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(`${API}/leads/${id}/activities`, { type, content }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setContent('');
//       fetchLead();
//     } catch (err) {
//       alert('Add activity failed');
//     }
//   };

//   if (!lead) return <div>Loading...</div>;

//   return (
//     <div>
//       <h2>{lead.name} — {lead.status}</h2>
//       <p>Email: {lead.email} | Phone: {lead.phone}</p>

//       <h3>Add Activity</h3>
//       <form onSubmit={addActivity}>
//         <select value={type} onChange={(e)=>setType(e.target.value)}>
//           <option value="NOTE">Note</option>
//           <option value="CALL">Call</option>
//           <option value="MEETING">Meeting</option>
//           <option value="STATUS_CHANGE">Status Change</option>
//         </select>
//         <div>
//           <textarea placeholder="Content" value={content} onChange={(e)=>setContent(e.target.value)} />
//         </div>
//         <button type="submit">Add</button>
//       </form>

//       <h3>Activities</h3>
//       <ul>
//         {lead.activities.map(a => (
//           <li key={a.id}>
//             <b>{a.type}</b> by {a.user?.name} • {new Date(a.createdAt).toLocaleString()}<br/>
//             {a.content}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
// frontend/src/pages/LeadDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { deleteLead, fetchLeads } from '../store/slices/leadsSlice';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);

  const fetchLead = () => {
    setLoading(true);
    axios.get(`${API}/leads/${id}`).then((r) => setLead(r.data.lead)).catch(() => setLead(null)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;
    try {
      await dispatch(deleteLead(Number(id))).unwrap();
      // refresh list and navigate back
      dispatch(fetchLeads());
      navigate('/leads');
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!lead) return <div className="p-4">Lead not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">{lead.name} <span className="text-sm text-gray-500">• {lead.status}</span></h2>
          <p className="text-sm text-gray-600">{lead.email} {lead.phone && `• ${lead.phone}`}</p>
          <p className="text-sm text-gray-600">Owner: {lead.owner?.name || '—'}</p>
        </div>
        <div className="space-x-2">
          {user && (user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <>
              <Link to={`/leads/${id}/edit`} className="bg-yellow-400 text-black px-3 py-1 rounded">Edit</Link>
              <button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Activities</h3>
        {lead.activities && lead.activities.length > 0 ? (
          <ul className="space-y-3">
            {lead.activities.map(a => (
              <li key={a.id} className="p-3 border rounded">
                <div className="text-sm text-gray-600"><strong>{a.type}</strong> by {a.user?.name} • {new Date(a.createdAt).toLocaleString()}</div>
                <div className="mt-1">{a.content}</div>
              </li>
            ))}
          </ul>
        ) : <div className="text-sm text-gray-500">No activities yet.</div>}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Add Activity</h3>
        <AddActivityForm leadId={lead.id} onAdded={() => fetchLead()} />
      </div>
    </div>
  );
}

function AddActivityForm({ leadId, onAdded }) {
  const [type, setType] = useState('NOTE');
  const [content, setContent] = useState('');
  const token = localStorage.getItem('token');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/leads/${leadId}/activities`, { type, content }, { headers: { Authorization: `Bearer ${token}` } });
      setContent('');
      if (onAdded) onAdded();
    } catch (err) {
      alert('Add activity failed');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-3">
        <select value={type} onChange={(e)=>setType(e.target.value)} className="border p-2 rounded">
          <option value="NOTE">Note</option>
          <option value="CALL">Call</option>
          <option value="MEETING">Meeting</option>
          <option value="STATUS_CHANGE">Status Change</option>
        </select>
        <div className="flex-1">
          <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Write activity..." className="w-full border p-2 rounded" />
        </div>
      </div>
      <div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Add Activity</button>
      </div>
    </form>
  );
}
