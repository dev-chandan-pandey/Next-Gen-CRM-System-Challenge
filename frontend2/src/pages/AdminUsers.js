import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUsers(r.data.users))
      .catch(err => { console.error(err); alert('Load users failed'); });
  }, []);

  const changeRole = async (id, role) => {
    try {
      const res = await axios.put(`${API}/users/${id}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.map(u => u.id === id ? res.data.user : u));
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div>
      <h2>Users (Admin)</h2>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <select defaultValue={u.role} onChange={(e)=>changeRole(u.id, e.target.value)}>
                  <option>ADMIN</option><option>MANAGER</option><option>SALES</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
