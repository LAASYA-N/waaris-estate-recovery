import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AgentPage } from './pages/AgentPage.js';
import { OverviewPage } from './pages/OverviewPage.js';
import { UploadPage } from './pages/UploadPage.js';
import { ChecklistPage } from './pages/ChecklistPage.js';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/agent" replace />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/agent" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
