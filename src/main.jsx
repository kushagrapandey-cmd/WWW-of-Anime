import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { SoundProvider } from './context/SoundContext';
import { AuthProvider } from './context/AuthContext';
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><MotionConfig reducedMotion="user"><SoundProvider><AuthProvider><App /></AuthProvider></SoundProvider></MotionConfig></BrowserRouter></React.StrictMode>);
