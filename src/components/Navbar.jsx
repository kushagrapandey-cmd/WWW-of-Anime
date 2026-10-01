import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, UserRound } from 'lucide-react';
const links = [['/', 'Home'], ['/battle', 'Battle'], ['/quizzes', 'Quizzes'], ['/games', 'Games']];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  return <header className="site-header"><div className="nav-wrap"><Link className="brand" to="/" aria-label="WWW-of-Anime home"><span className="brand-icon"><Zap fill="currentColor" size={22} /></span>WWW<span>-of-Anime</span><small>BETA</small></Link><button className="icon-button mobile-menu" aria-expanded={open} aria-controls="navigation" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button><nav id="navigation" className={open ? 'navigation open' : 'navigation'} aria-label="Main navigation">{links.map(([path, label]) => <NavLink end={path === '/'} key={path} to={path}>{label}</NavLink>)}<NavLink className="profile-link" to="/login"><UserRound size={17} /> Profile / Login</NavLink></nav></div></header>;
}
