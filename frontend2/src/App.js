// frontend/src/App.js
import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import { setAuth } from './store/slices/authSlice';
import io from 'socket.io-client';
import { addLeadRealtime } from './store/slices/leadsSlice';
import CreateLead from './pages/CreateLead';
import AdminUsers from './pages/AdminUsers';

const API_WS = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector(s => s.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    // load user from token if present
    const t = localStorage.getItem('token');
    if (t && !token) {
      // attempt to fetch /auth/me
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` }
      })
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) dispatch(setAuth({ user: data.user, token: t }));
        })
        .catch(() => {});
    }
  }, [dispatch, token]);

  useEffect(() => {
    const socket = io(API_WS, { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('presence:join', { ts: Date.now() });
    });

    socket.on('notification:new_lead', (msg) => {
      if (msg && msg.lead) {
        // dispatch to store
        dispatch(addLeadRealtime(msg.lead));
      }
    });

    socket.on('notification:lead_updated', (msg) => {
      // For brevity we don't handle updates deeply here
      console.log('lead updated', msg);
    });

    return () => socket.disconnect();
  }, [dispatch]);

  return (
    <div style={{ padding: 20 }}>
     

      {/* <nav style={{ marginBottom: 20 }}>
        <Link to="/">Home</Link> | <Link to="/dashboard">Dashboard</Link> | <Link to="/leads">Leads</Link> | <Link to="/login">Login</Link>
      </nav> */}
      <nav style={{ marginBottom: 20 }}>
  <Link to="/">Home</Link> | <Link to="/dashboard">Dashboard</Link> | <Link to="/leads">Leads</Link>
  {user && user.role === 'ADMIN' && <> | <Link to="/admin/users">Admin Users</Link></>}
  {!user ? <> | <Link to="/login">Login</Link></> : <> | <button onClick={() => { dispatch(logout()); navigate('/'); }}>Logout</button></>}
</nav>
      <Routes>
        <Route path="/" element={<div>Welcome to NextGen CRM</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
        <Route path="/leads/new" element={<CreateLead />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </div>
  );
}

export default App;
