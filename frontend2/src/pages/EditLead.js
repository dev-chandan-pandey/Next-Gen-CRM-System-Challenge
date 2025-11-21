// frontend/src/pages/EditLead.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateLead } from '../store/slices/leadsSlice';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function EditLead() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: '', source: '', value: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/leads/${id}`)
      .then(res => {
        setLead(res.data.lead);
        setForm({
          name: res.data.lead.name || '',
          email: res.data.lead.email || '',
          phone: res.data.lead.phone || '',
          status: res.data.lead.status || '',
          source: res.data.lead.source || '',
          value: res.data.lead.value || ''
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateLead({ id: Number(id), data: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        status: form.status,
        source: form.source,
        value: form.value ? Number(form.value) : undefined
      }})).unwrap();
      navigate(`/leads/${id}`);
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!lead) return <div className="p-4">Lead not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Edit Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="w-full border p-2 rounded" value={form.name} onChange={e=>handleChange('name', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="w-full border p-2 rounded" value={form.email} onChange={e=>handleChange('email', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input className="w-full border p-2 rounded" value={form.phone} onChange={e=>handleChange('phone', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Value (USD)</label>
            <input type="number" className="w-full border p-2 rounded" value={form.value} onChange={e=>handleChange('value', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select className="w-full border p-2 rounded" value={form.status} onChange={e=>handleChange('status', e.target.value)}>
              <option value="">-- select --</option>
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Source</label>
            <input className="w-full border p-2 rounded" value={form.source} onChange={e=>handleChange('source', e.target.value)} />
          </div>
        </div>

        <div className="flex space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          <button type="button" onClick={()=>navigate(-1)} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
