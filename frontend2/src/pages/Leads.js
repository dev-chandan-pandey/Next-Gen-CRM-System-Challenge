// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchLeads } from '../store/slices/leadsSlice';
// import { Link } from 'react-router-dom';

// export default function Leads() {
//   const dispatch = useDispatch();
//   const leads = useSelector((s) => s.leads.list);

//   useEffect(() => {
//     dispatch(fetchLeads());
//   }, [dispatch]);

//   return (
//     <div>
//       <h2>Leads</h2>
//       <Link to="/leads/new">Create Lead</Link>
//       <ul>
//         {leads.map((l) => (
//           <li key={l.id}>
//             <Link to={`/leads/${l.id}`}>{l.name} — {l.status}</Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../store/slices/leadsSlice';
import { Link } from 'react-router-dom';

export default function Leads() {
  const dispatch = useDispatch();
  const leads = useSelector((s) => s.leads.list || []);
  const user = useSelector(s => s.auth.user);

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Leads</h2>
        {user ? <Link className="bg-green-500 text-white px-3 py-1 rounded" to="/leads/new">Create Lead</Link> : <span className="text-sm text-gray-500">Login to create leads</span>}
      </div>
      <div className="bg-white rounded shadow divide-y">
        {leads.map((l) => (
          <Link key={l.id} to={`/leads/${l.id}`} className="block p-4 hover:bg-gray-50">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{l.name}</div>
                <div className="text-sm text-gray-500">{l.email || l.phone || '—'}</div>
              </div>
              <div className="text-sm text-gray-600">{l.status}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
