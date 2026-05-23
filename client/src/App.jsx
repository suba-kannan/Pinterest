import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PinDetail from './pages/PinDetail';
import CreatePin from './pages/CreatePin';
import Profile from './pages/Profile';
import BoardDetail from './pages/BoardDetail';
import AuthModals from './components/AuthModals';
import LandingPage from './components/LandingPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white text-gray-800 font-sans antialiased flex flex-col">
          <Navbar />
          <AuthModals />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/feed" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pin/:id" element={<PinDetail />} />
              <Route path="/create" element={<CreatePin />} />
              <Route path="/profile/:userId?" element={<Profile />} />
              <Route path="/board/:id" element={<BoardDetail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
