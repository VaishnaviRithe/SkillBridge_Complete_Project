const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export async function api(path, options={}) {
  const token = localStorage.getItem('sb_token');
  const headers = { ...(options.body ? {'Content-Type':'application/json'} : {}), ...(token ? {Authorization:`Bearer ${token}`} : {}), ...options.headers };
  const response = await fetch(`${API}${path}`, {...options,headers});
  const data = await response.json().catch(()=>({message:'Unexpected server response.'}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}
export const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
