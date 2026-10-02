import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { REQUIRE_LOGIN } from './config/auth';
import Home from './pages/Home';
import Placeholder, { NotFound } from './pages/Placeholder';
const CharacterGuide = lazy(() => import('./pages/CharacterGuide'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Games = lazy(() => import('./pages/Games'));
const Quizzes = lazy(() => import('./pages/Quizzes'));
const BattleEntry = lazy(() => import('./pages/BattleEntry'));
export default function App() {
  return <Routes><Route element={<Layout />}>
    <Route index element={<Home />} /><Route path="characters" element={<CharacterGuide />} />
    <Route path="login" element={<AuthPage />} /><Route path="signup" element={<AuthPage />} />
    <Route element={<ProtectedRoute />}><Route path="profile" element={<Profile />} /></Route>
    <Route element={<ProtectedRoute required={REQUIRE_LOGIN} />}><Route path="battle" element={<BattleEntry />} /></Route>
    <Route path="quizzes" element={<Quizzes />} /><Route path="games" element={<Games />} />
    <Route path="anime/:animeId" element={<Placeholder />} /><Route path="*" element={<NotFound />} />
  </Route></Routes>;
}
