// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// export const fetchLeads = createAsyncThunk('leads/fetchLeads', async (_, { getState }) => {
//   const token = getState().auth.token;
//   const res = await axios.get(`${API}/leads`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
//   return res.data.leads;
// });

// export const createLead = createAsyncThunk('leads/createLead', async (payload, { getState }) => {
//   const token = getState().auth.token;
//   const res = await axios.post(`${API}/leads`, payload, { headers: { Authorization: `Bearer ${token}` } });
//   return res.data.lead;
// });

// const slice = createSlice({
//   name: 'leads',
//   initialState: { list: [], status: 'idle', error: null },
//   reducers: {
//     addLeadRealtime(state, action) {
//       state.list.unshift(action.payload);
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchLeads.pending, (s) => { s.status = 'loading'; })
//       .addCase(fetchLeads.fulfilled, (s, a) => { s.status = 'succeeded'; s.list = a.payload; })
//       .addCase(fetchLeads.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; })
//       .addCase(createLead.fulfilled, (s, a) => { s.list.unshift(a.payload); });
//   }
// });

// export const { addLeadRealtime } = slice.actions;
// export default slice.reducer;
// frontend/src/store/slices/leadsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export const fetchLeads = createAsyncThunk('leads/fetchLeads', async (_, { getState }) => {
  const token = getState().auth.token;
  const res = await axios.get(`${API}/leads`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return res.data.leads;
});

export const createLead = createAsyncThunk('leads/createLead', async (payload, { getState }) => {
  const token = getState().auth.token;
  const res = await axios.post(`${API}/leads`, payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.lead;
});

export const updateLead = createAsyncThunk('leads/updateLead', async ({ id, data }, { getState }) => {
  const token = getState().auth.token;
  const res = await axios.put(`${API}/leads/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.lead;
});

export const deleteLead = createAsyncThunk('leads/deleteLead', async (id, { getState }) => {
  const token = getState().auth.token;
  await axios.delete(`${API}/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return id;
});

const slice = createSlice({
  name: 'leads',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {
    addLeadRealtime(state, action) {
      state.list.unshift(action.payload);
    },
    replaceLead(state, action) {
      const lead = action.payload;
      const idx = state.list.findIndex(l => l.id === lead.id);
      if (idx >= 0) state.list[idx] = lead;
      else state.list.unshift(lead);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchLeads.fulfilled, (s, a) => { s.status = 'succeeded'; s.list = a.payload; })
      .addCase(fetchLeads.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; })

      .addCase(createLead.fulfilled, (s, a) => { s.list.unshift(a.payload); })

      .addCase(updateLead.fulfilled, (s, a) => {
        const updated = a.payload;
        const idx = s.list.findIndex(l => l.id === updated.id);
        if (idx >= 0) s.list[idx] = updated;
      })

      .addCase(deleteLead.fulfilled, (s, a) => {
        const id = a.payload;
        s.list = s.list.filter(l => l.id !== id);
      });
  }
});

export const { addLeadRealtime, replaceLead } = slice.actions;
export default slice.reducer;
