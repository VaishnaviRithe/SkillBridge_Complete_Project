import {Link,NavLink,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
export default function Navbar(){
 const {user,logout}=useAuth(); const navigate=useNavigate();
 return <header className="nav"><Link className="brand" to="/">SkillBridge<span>.</span></Link>
 <nav><NavLink to="/jobs">Jobs</NavLink><NavLink to="/services">Services</NavLink>{user&&<><NavLink to="/dashboard">Dashboard</NavLink><NavLink to="/messages">Messages</NavLink></>}</nav>
 <div className="nav-actions">{user?<><span className="nav-user">{user.fullName?.split(' ')[0]}</span><button className="btn btn-outline small" onClick={()=>{logout();navigate('/');}}>Logout</button></>:<><Link to="/login">Login</Link><Link className="btn small" to="/register">Sign Up</Link></>}</div></header>;
}
