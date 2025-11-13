import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createLead } from '../store/slices/leadsSlice';
import { useNavigate } from 'react-router-dom';

export default function CreateLead() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createLead({ name, email })).unwrap();
      navigate('/leads');
    } catch (err) {
      alert('Create failed');
    }
  };

  return (
    <form onSubmit={handle}>
      <h2>Create Lead</h2>
      <div><input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /></div>
      <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <button type="submit">Create</button>
    </form>
  );
}
