// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { login } from '../store/slices/authSlice';
// import { useNavigate } from 'react-router-dom';

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handle = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await dispatch(login({ email, password })).unwrap();
//       navigate('/dashboard');
//     } catch (err) {
//       alert('Login failed');
//     }
//   };

//   return (
//     <form onSubmit={handle}>
//       <h2>Login</h2>
//       <div>
//         <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
//       </div>
//       <div>
//         <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
//       </div>
//       <button type="submit">Login</button>
//     </form>
//   );
// }
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow bg-blue-600">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={handle} className="space-y-4 ">
        <input className="w-full border p-2 rounded" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Login</button>
      </form>
    </div>
  );
}
