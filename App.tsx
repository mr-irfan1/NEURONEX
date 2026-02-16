import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Notebook } from './pages/Notebook';
import { CodingGround } from './pages/CodingGround';
import { AvatarTutor } from './pages/AvatarTutor';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notebook" element={<Notebook />} />
          <Route path="/code" element={<CodingGround />} />
          <Route path="/tutor" element={<AvatarTutor />} />
          <Route path="/settings" element={<Settings />} />
          {/* Analytics placeholder */}
          <Route path="/analytics" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
