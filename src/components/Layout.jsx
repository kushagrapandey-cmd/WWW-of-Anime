import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <><a className="skip-link" href="#main">Skip to content</a><Navbar /><main id="main" tabIndex={-1}><Outlet /></main><footer className="footer"><span className="footer-brand">WWW<span>-of-Anime</span></span><p>A playground for anime fans. Built for the rivalry.</p><span>UNOFFICIAL FAN PROTOTYPE</span></footer></>;
}
