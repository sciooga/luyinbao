import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { DeviceProvider } from './contexts/DeviceContext';
import { AuthPage } from './pages/Auth';
import { DevicePage } from './pages/Device';
import { RecordingsPage } from './pages/Recordings';
import { ProfilePage } from './pages/Profile';
import { BottomNav } from './components/BottomNav';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl overflow-hidden relative flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/device" element={<DevicePage />} />
          <Route path="/recordings" element={<RecordingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isAuthPage && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <DeviceProvider>
        <Router>
          <AppContent />
        </Router>
      </DeviceProvider>
    </LanguageProvider>
  );
};

export default App;