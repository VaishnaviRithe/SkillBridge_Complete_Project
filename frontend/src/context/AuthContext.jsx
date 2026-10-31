import {createContext,useContext,useEffect,useState} from 'react';
import {api} from '../api';
const AuthContext=createContext(null);
export function AuthProvider({children}) {
  const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
  useEffect(()=>{ if(localStorage.getItem('sb_token')) api('/auth/me').then(d=>setUser(d.user)).catch(()=>localStorage.removeItem('sb_token')).finally(()=>setLoading(false)); else setLoading(false); },[]);
  const signIn=async(path,form)=>{const d=await api(`/auth/${path}`,{method:'POST',body:JSON.stringify(form)});localStorage.setItem('sb_token',d.token);setUser(d.user);return d.user;};
  const logout=()=>{localStorage.removeItem('sb_token');setUser(null);};
  return <AuthContext.Provider value={{user,loading,signIn,logout,setUser}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
