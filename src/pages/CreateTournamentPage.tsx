import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy } from 'lucide-react';
import apiService from '../services/ApiService';
import { TournamentType } from '../models/Tournament';

const CreateTournamentPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TournamentType>('single-elimination');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Tournament name is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tournament = await apiService.createTournament(
        name,
        description,
        type,
        new Date(startDate),
        endDate ? new Date(endDate) : undefined
      );
      
      navigate(`/tournament/${tournament.id}/participants`);
    } catch (error) {
      console.error('Error creating tournament:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-tournament">
      <div className="create-tournament__header">
        <h1 className="create-tournament__title">Create Tournament</h1>
      </div>
      
      <form className="create-tournament__form" onSubmit={handleSubmit}>
        <div className="create-tournament__form-group">
          <label className="create-tournament__label" htmlFor="name">
            Tournament Name
          </label>
          <input
            id="name"
            type="text"
            className={`create-tournament__input ${errors.name ? 'create-tournament__input--error' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter tournament name"
          />
          {errors.name && (
            <span className="create-tournament__error">{errors.name}</span>
          )}
        </div>
        
        <div className="create-tournament__form-group">
          <label className="create-tournament__label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className={`create-tournament__textarea ${errors.description ? 'create-tournament__textarea--error' : ''}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter tournament description"
            rows={4}
          />
          {errors.description && (
            <span className="create-tournament__error">{errors.description}</span>
          )}
        </div>
        
        <div className="create-tournament__form-group">
          <label className="create-tournament__label">Tournament Type</label>
          <div className="create-tournament__type-options">
            <label className={`create-tournament__type-option ${type === 'single-elimination' ? 'create-tournament__type-option--active' : ''}`}>
              <input
                type="radio"
                name="type"
                value="single-elimination"
                checked={type === 'single-elimination'}
                onChange={() => setType('single-elimination')}
                className="create-tournament__type-input"
              />
              <Trophy size={20} />
              <span>Single Elimination</span>
            </label>
            
            <label className={`create-tournament__type-option ${type === 'double-elimination' ? 'create-tournament__type-option--active' : ''}`}>
              <input
                type="radio"
                name="type"
                value="double-elimination"
                checked={type === 'double-elimination'}
                onChange={() => setType('double-elimination')}
                className="create-tournament__type-input"
              />
              <Trophy size={20} />
              <span>Double Elimination</span>
            </label>
          </div>
        </div>
        
        <div className="create-tournament__form-row">
          <div className="create-tournament__form-group">
            <label className="create-tournament__label" htmlFor="startDate">
              Start Date
            </label>
            <div className="create-tournament__date-input">
              <Calendar size={18} className="create-tournament__date-icon" />
              <input
                id="startDate"
                type="date"
                className={`create-tournament__input ${errors.startDate ? 'create-tournament__input--error' : ''}`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {errors.startDate && (
              <span className="create-tournament__error">{errors.startDate}</span>
            )}
          </div>
          
          <div className="create-tournament__form-group">
            <label className="create-tournament__label" htmlFor="endDate">
              End Date (Optional)
            </label>
            <div className="create-tournament__date-input">
              <Calendar size={18} className="create-tournament__date-icon" />
              <input
                id="endDate"
                type="date"
                className={`create-tournament__input ${errors.endDate ? 'create-tournament__input--error' : ''}`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {errors.endDate && (
              <span className="create-tournament__error">{errors.endDate}</span>
            )}
          </div>
        </div>
        
        <div className="create-tournament__actions">
          <button
            type="submit"
            className="create-tournament__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournamentPage;