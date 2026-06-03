import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Pages
import HomePage from './pages/HomePage';
import StatusPage from './pages/StatusPage';
import TimelinePage from './pages/TimelinePage';
import EffortPage from './pages/EffortPage';
import AdvisorsPage from './pages/AdvisorsPage';
import ProfileDetailPage from './pages/ProfileDetailPage';

// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { AnalysisProvider } from './contexts/AnalysisContext';

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <AuthProvider>
      <AnalysisProvider>
        <HashRouter>
          <div className="min-h-screen bg-gradient-to-b from-[#f8fffd] via-[#effbf8] to-[#fbfefd]">
            <Navbar onAuthClick={() => { setAuthMode('login'); setShowAuth(true); }} />
            
            <main className="pb-24">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/status" element={<StatusPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/timeline/:stageId" element={<TimelinePage />} />
                <Route path="/effort" element={<EffortPage />} />
                <Route path="/effort/:type" element={<EffortPage />} />
                <Route path="/advisors" element={<AdvisorsPage />} />
                <Route path="/profile-detail" element={<ProfileDetailPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <BottomNav />
            
            {showAuth && (
              <AuthModal 
                mode={authMode} 
                onClose={() => setShowAuth(false)}
                onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              />
            )}
            
            <Toaster position="top-center" richColors />
          </div>
        </HashRouter>
      </AnalysisProvider>
    </AuthProvider>
  );
}

export default App;