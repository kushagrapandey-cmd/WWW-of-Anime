import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { lazy, Suspense } from 'react';
const CharacterGuide = lazy(() => import('./pages/CharacterGuide'));
const guideLoading = <section className="placeholder container"><p role="status">Loading character guide…</p></section>;
import Placeholder, { NotFound } from './pages/Placeholder';
export default function App() { return <Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="characters" element={<Suspense fallback={guideLoading}><CharacterGuide /></Suspense>} />{['battle', 'quizzes', 'games', 'profile', 'login'].map(section => <Route key={section} path={section} element={<Placeholder section={section} />} />)}<Route path="anime/:animeId" element={<Placeholder />} /><Route path="*" element={<NotFound />} /></Route></Routes>; }
