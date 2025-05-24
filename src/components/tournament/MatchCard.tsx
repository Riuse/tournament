import React, { useState } from 'react';
import { Match } from '../../models/Match';
import { Participant } from '../../models/Participant';
import { Edit, Check, X } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  participants: Participant[];
  onUpdateMatch: (matchId: string, score1: number, score2: number) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, participants, onUpdateMatch }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [score1, setScore1] = useState(match.score1 || 0);
  const [score2, setScore2] = useState(match.score2 || 0);
  
  const participant1 = participants.find(p => p.id === match.participant1Id);
  const participant2 = participants.find(p => p.id === match.participant2Id);
  
  const handleSave = () => {
    if (score1 < 0 || score2 < 0) return;
    onUpdateMatch(match.id, score1, score2);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setScore1(match.score1 || 0);
    setScore2(match.score2 || 0);
    setIsEditing(false);
  };
  
  return (
    <div className={`match-card match-card--${match.status}`}>
      <div className="match-card__header">
        <span className="match-card__round">Match {match.matchNumber}</span>
        
        {match.participant1Id && match.participant2Id && !isEditing && (
          <button 
            className="match-card__edit-btn"
            onClick={() => setIsEditing(true)}
            aria-label="Edit match results"
          >
            <Edit size={16} />
          </button>
        )}
        
        {isEditing && (
          <div className="match-card__actions">
            <button 
              className="match-card__action match-card__action--save"
              onClick={handleSave}
              aria-label="Save match results"
            >
              <Check size={16} />
            </button>
            <button 
              className="match-card__action match-card__action--cancel"
              onClick={handleCancel}
              aria-label="Cancel editing"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      
      <div className="match-card__body">
        <div className={`match-card__participant ${match.winnerId === match.participant1Id ? 'match-card__participant--winner' : ''}`}>
          <div className="match-card__participant-info">
            {participant1 ? (
              <>
                <span className="match-card__participant-name">
                  {participant1.name}
                </span>
                {participant1.seed && (
                  <span className="match-card__participant-seed">
                    ({participant1.seed})
                  </span>
                )}
              </>
            ) : (
              <span className="match-card__participant-placeholder">
                {match.status === 'pending' ? 'TBD' : 'Bye'}
              </span>
            )}
          </div>
          
          <div className="match-card__score">
            {isEditing ? (
              <input
                type="number"
                min="0"
                value={score1}
                onChange={(e) => setScore1(parseInt(e.target.value) || 0)}
                className="match-card__score-input"
              />
            ) : (
              <span className="match-card__score-value">
                {match.score1 !== null ? match.score1 : '-'}
              </span>
            )}
          </div>
        </div>
        
        <div className={`match-card__participant ${match.winnerId === match.participant2Id ? 'match-card__participant--winner' : ''}`}>
          <div className="match-card__participant-info">
            {participant2 ? (
              <>
                <span className="match-card__participant-name">
                  {participant2.name}
                </span>
                {participant2.seed && (
                  <span className="match-card__participant-seed">
                    ({participant2.seed})
                  </span>
                )}
              </>
            ) : (
              <span className="match-card__participant-placeholder">
                {match.status === 'pending' ? 'TBD' : 'Bye'}
              </span>
            )}
          </div>
          
          <div className="match-card__score">
            {isEditing ? (
              <input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(parseInt(e.target.value) || 0)}
                className="match-card__score-input"
              />
            ) : (
              <span className="match-card__score-value">
                {match.score2 !== null ? match.score2 : '-'}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {match.startTime && (
        <div className="match-card__footer">
          <span className="match-card__time">
            {new Date(match.startTime).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default MatchCard;