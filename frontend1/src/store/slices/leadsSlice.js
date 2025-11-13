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

const slice = createSlice({
  name: 'leads',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {
    addLeadRealtime(state, action) {
      state.list.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchLeads.fulfilled, (s, a) => { s.status = 'succeeded'; s.list = a.payload; })
      .addCase(fetchLeads.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; })
      .addCase(createLead.fulfilled, (s, a) => { s.list.unshift(a.payload); });
  }
});

export const { addLeadRealtime } = slice.actions;
export default slice.reducer;
