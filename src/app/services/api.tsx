import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchStats = () => api.get('/dashboard/stats');
export const fetchOverview = () => api.get('/dashboard/overview');
export const fetchVehicles = () => api.get('/vehicles');
export const fetchOrders = () => api.get('/orders');