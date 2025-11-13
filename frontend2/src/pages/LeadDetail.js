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
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [type, setType] = useState('NOTE');
  const [content, setContent] = useState('');
  const token = localStorage.getItem('token');

  const fetchLead = () => axios.get(`${API}/leads/${id}`).then(r=>setLead(r.data.lead)).catch(()=>{});

  useEffect(() => { fetchLead(); }, [id]);

  const addActivity = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/leads/${id}/activities`, { type, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent('');
      fetchLead();
    } catch (err) {
      alert('Add activity failed');
    }
  };

  if (!lead) return <div>Loading...</div>;

  return (
    <div>
      <h2>{lead.name} — {lead.status}</h2>
      <p>Email: {lead.email} | Phone: {lead.phone}</p>

      <h3>Add Activity</h3>
      <form onSubmit={addActivity}>
        <select value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="NOTE">Note</option>
          <option value="CALL">Call</option>
          <option value="MEETING">Meeting</option>
          <option value="STATUS_CHANGE">Status Change</option>
        </select>
        <div>
          <textarea placeholder="Content" value={content} onChange={(e)=>setContent(e.target.value)} />
        </div>
        <button type="submit">Add</button>
      </form>

      <h3>Activities</h3>
      <ul>
        {lead.activities.map(a => (
          <li key={a.id}>
            <b>{a.type}</b> by {a.user?.name} • {new Date(a.createdAt).toLocaleString()}<br/>
            {a.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
