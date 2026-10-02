import { Outlet, useLocation } from 'react-router-dom';
import { Suspense, useEffect, useRef } from 'react';
import RouteErrorBoundary from './RouteErrorBoundary';
import SoundToggle from './SoundToggle';
import Navbar from './Navbar';
export default function Layout() {
  const { pathname } = useLocation();
  const main = useRef(null), previous = useRef(pathname);
  useEffect(() => { window.scrollTo(0, 0); if (previous.current !== pathname) main.current?.focus(); previous.current = pathname; }, [pathname]);
  return <><a className="skip-link" href="#main">Skip to content</a><Navbar /><main id="main" ref={main} tabIndex={-1}><RouteErrorBoundary key={pathname}><Suspense fallback={<section className="placeholder container"><p role="status">Loading your next arc…</p></section>}><Outlet /></Suspense></RouteErrorBoundary></main><footer className="footer"><span className="footer-brand">WWW<span>-of-Anime</span></span><p>A playground for anime fans. Built for the rivalry.</p><SoundToggle /><span>UNOFFICIAL FAN PROTOTYPE</span></footer></>;
}
