import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import EmailDetail from './components/EmailDetail/EmailDetail';
import EmailList from './components/EmailList/EmailList';
import Analytics from './components/Analytics/Analytics';
import Settings from './components/Settings/Settings';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/emails" element={<EmailList />} />
              <Route path="/email/:id" element={<EmailDetail />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;