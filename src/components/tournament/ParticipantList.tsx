import React from 'react';
import { Participant } from '../../models/Participant';
import { Trash2, Edit, User } from 'lucide-react';

interface ParticipantListProps {
  participants: Participant[];
  onEdit: (participant: Participant) => void;
  onDelete: (id: string) => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ 
  participants, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="participant-list">
      <h2 className="participant-list__title">Participants</h2>
      
      {participants.length === 0 ? (
        <p className="participant-list__empty">
          No participants added yet. Add participants to create your tournament.
        </p>
      ) : (
        <ul className="participant-list__items">
          {participants.map(participant => (
            <li key={participant.id} className="participant-list__item">
              <div className="participant-list__avatar">
                {participant.image ? (
                  <img 
                    src={participant.image} 
                    alt={participant.name} 
                    className="participant-list__avatar-img"
                  />
                ) : (
                  <div className="participant-list__avatar-placeholder">
                    <User size={20} />
                  </div>
                )}
              </div>
              
              <div className="participant-list__info">
                <span className="participant-list__name">{participant.name}</span>
              </div>
              
              <div className="participant-list__actions">
                <button 
                  className="participant-list__action participant-list__action--edit"
                  onClick={() => onEdit(participant)}
                  aria-label={`Edit ${participant.name}`}
                >
                  <Edit size={18} />
                </button>
                <button 
                  className="participant-list__action participant-list__action--delete"
                  onClick={() => onDelete(participant.id)}
                  aria-label={`Delete ${participant.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParticipantList;