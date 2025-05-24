import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import TournamentPage from './pages/TournamentPage';
import CreateTournamentPage from './pages/CreateTournamentPage';
import ParticipantsPage from './pages/ParticipantsPage';
import NotFoundPage from './pages/NotFoundPage';
import './styles/main.css';

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <Header />
        <main className="app__content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tournament/create" element={<CreateTournamentPage />} />
            <Route path="/tournament/:id" element={<TournamentPage />} />
            <Route path="/tournament/:id/participants" element={<ParticipantsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;