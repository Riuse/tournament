import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Save } from 'lucide-react';
import apiService from '../services/ApiService';
import { Tournament } from '../models/Tournament';
import { Participant } from '../models/Participant';
import ParticipantList from '../components/tournament/ParticipantList';

const ParticipantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  
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
      } catch (error) {
        console.error('Failed to fetch tournament:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch tournament');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !tournament || !name.trim()) return;
    
    try {
      // If editing existing participant
      if (editingParticipant) {
        // Remove old participant
        await apiService.removeParticipant(id, editingParticipant.id);
        
        // Add updated participant
        const updatedParticipant = new Participant(name);
        const updatedTournament = await apiService.addParticipant(id, updatedParticipant);
        setTournament(updatedTournament);
      } else {
        // Add new participant
        const participant = new Participant(name);
        const updatedTournament = await apiService.addParticipant(id, participant);
        setTournament(updatedTournament);
      }
      
      // Reset form
      setName('');
      setEditingParticipant(null);
    } catch (error) {
      console.error('Failed to add participant:', error);
    }
  };

  const handleEditParticipant = (participant: Participant) => {
    setName(participant.name);
    setEditingParticipant(participant);
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!id || !tournament) return;
    
    try {
      const updatedTournament = await apiService.removeParticipant(id, participantId);
      setTournament(updatedTournament);
    } catch (error) {
      console.error('Failed to delete participant:', error);
    }
  };

  const handleContinue = () => {
    if (id) {
      navigate(`/tournament/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="participants-page participants-page--loading">
        <div className="participants-page__loading">
          Loading tournament...
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="participants-page participants-page--error">
        <div className="participants-page__error">
          <h2>Error</h2>
          <p>{error || 'Failed to load tournament'}</p>
          <button 
            className="participants-page__error-btn"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="participants-page">
      <header className="participants-page__header">
        <button
          className="participants-page__back-btn"
          onClick={() => navigate(`/tournament/${id}`)}
        >
          <ArrowLeft size={18} />
          <span>Back to Tournament</span>
        </button>
        <h1 className="participants-page__title">
          {tournament.name} - Participants
        </h1>
      </header>
      
      <div className="participants-page__content">
        <div className="participants-page__form-section">
          <h2 className="participants-page__form-title">
            {editingParticipant ? 'Edit Participant' : 'Add Participant'}
          </h2>
          
          <form className="participants-page__form" onSubmit={handleAddParticipant}>
            <div className="participants-page__form-group">
              <label className="participants-page__label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="participants-page__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter participant name"
                required
              />
            </div>
            
            <div className="participants-page__form-actions">
              <button
                type="submit"
                className="participants-page__form-btn"
                disabled={!name.trim()}
              >
                {editingParticipant ? (
                  <>
                    <Save size={18} />
                    <span>Update Participant</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Add Participant</span>
                  </>
                )}
              </button>
              
              {editingParticipant && (
                <button
                  type="button"
                  className="participants-page__cancel-btn"
                  onClick={() => {
                    setEditingParticipant(null);
                    setName('');
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        <div className="participants-page__list-section">
          <ParticipantList
            participants={tournament.participants}
            onEdit={handleEditParticipant}
            onDelete={handleDeleteParticipant}
          />
          
          {tournament.participants.length >= 2 && (
            <div className="participants-page__continue">
              <button
                className="participants-page__continue-btn"
                onClick={handleContinue}
              >
                Continue to Tournament
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPage;