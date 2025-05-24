import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Settings, Share2, X } from 'lucide-react';
import apiService from '../services/ApiService';
import { Tournament } from '../models/Tournament';
import BracketView from '../components/tournament/BracketView';

const TournamentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        if (!id) {
          throw new Error('Tournament ID is required');
        }
        
        const data = await apiService.getTournament(id);
        
        if (!data) {
          throw new Error('Tournament not found');
        }
        
        setTournament(data);
        setShareUrl(window.location.href);
      } catch (error) {
        console.error('Failed to fetch tournament:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch tournament');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleUpdateMatch = async (matchId: string, score1: number, score2: number) => {
    try {
      if (!id || !tournament) return;
      
      const updatedTournament = await apiService.updateMatchResult(id, matchId, score1, score2);
      setTournament(updatedTournament);
    } catch (error) {
      console.error('Failed to update match:', error);
    }
  };

  const handleGenerateBracket = async () => {
    try {
      if (!id || !tournament) return;
      
      const updatedTournament = await apiService.generateBracket(id);
      setTournament(updatedTournament);
    } catch (error) {
      console.error('Failed to generate bracket:', error);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Tournament link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDeleteTournament = async () => {
    if (!id || !tournament) return;
    
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await apiService.deleteTournament(id);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete tournament:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="tournament-page tournament-page--loading">
        <div className="tournament-page__loading">
          Loading tournament...
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="tournament-page tournament-page--error">
        <div className="tournament-page__error">
          <h2>Error</h2>
          <p>{error || 'Failed to load tournament'}</p>
          <Link to="/" className="tournament-page__error-link">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-page">
      <header className="tournament-page__header">
        <h1 className="tournament-page__title">{tournament.name}</h1>
        <div className="tournament-page__actions">
          <Link 
            to={`/tournament/${tournament.id}/participants`} 
            className="tournament-page__action"
          >
            <Users size={18} />
            <span>Participants</span>
          </Link>
          <button 
            className="tournament-page__action"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button 
            className="tournament-page__action"
            onClick={() => setShowShare(!showShare)}
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </header>
      
      {showSettings && (
        <div className="tournament-page__modal">
          <div className="tournament-page__modal-content">
            <div className="tournament-page__modal-header">
              <h2>Tournament Settings</h2>
              <button 
                className="tournament-page__modal-close"
                onClick={() => setShowSettings(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="tournament-page__modal-body">
              <button 
                className="tournament-page__delete-btn"
                onClick={handleDeleteTournament}
              >
                Delete Tournament
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showShare && (
        <div className="tournament-page__modal">
          <div className="tournament-page__modal-content">
            <div className="tournament-page__modal-header">
              <h2>Share Tournament</h2>
              <button 
                className="tournament-page__modal-close"
                onClick={() => setShowShare(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="tournament-page__modal-body">
              <div className="tournament-page__share-url">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="tournament-page__share-input"
                />
                <button 
                  className="tournament-page__share-copy"
                  onClick={handleCopyShareLink}
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="tournament-page__meta">
        <div className="tournament-page__meta-item">
          <span className="tournament-page__meta-label">Type:</span>
          <span className="tournament-page__meta-value">{tournament.type.replace('-', ' ')}</span>
        </div>
        <div className="tournament-page__meta-item">
          <span className="tournament-page__meta-label">Start Date:</span>
          <span className="tournament-page__meta-value">
            {new Date(tournament.startDate).toLocaleDateString()}
          </span>
        </div>
        <div className="tournament-page__meta-item">
          <span className="tournament-page__meta-label">Participants:</span>
          <span className="tournament-page__meta-value">{tournament.participants.length}</span>
        </div>
      </div>
      
      <div className="tournament-page__content">
        {tournament.matches.length === 0 ? (
          <div className="tournament-page__empty">
            <h2 className="tournament-page__empty-title">Bracket not generated</h2>
            <p className="tournament-page__empty-description">
              {tournament.participants.length < 2 
                ? 'Add at least 2 participants to generate the bracket.' 
                : 'You have participants ready. Generate the bracket to start the tournament.'}
            </p>
            
            {tournament.participants.length >= 2 && (
              <button 
                className="tournament-page__generate-btn"
                onClick={handleGenerateBracket}
              >
                Generate Bracket
              </button>
            )}
            
            <Link 
              to={`/tournament/${tournament.id}/participants`}
              className="tournament-page__participants-link"
            >
              Manage Participants
            </Link>
          </div>
        ) : (
          <BracketView 
            tournament={tournament} 
            onUpdateMatch={handleUpdateMatch} 
          />
        )}
      </div>
    </div>
  );
};

export default TournamentPage;