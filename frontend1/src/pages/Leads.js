import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../store/slices/leadsSlice';
import { Link } from 'react-router-dom';

export default function Leads() {
  const dispatch = useDispatch();
  const leads = useSelector((s) => s.leads.list);

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  return (
    <div>
      <h2>Leads</h2>
      <Link to="/leads/new">Create Lead</Link>
      <ul>
        {leads.map((l) => (
          <li key={l.id}>
            <Link to={`/leads/${l.id}`}>{l.name} — {l.status}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
