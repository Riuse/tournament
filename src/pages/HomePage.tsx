import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Plus, Calendar, Users } from 'lucide-react';
import apiService from '../services/ApiService';
import { Tournament } from '../models/Tournament';

const HomePage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await apiService.getTournaments();
        setTournaments(data);
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">Create and Manage Tournament Brackets with Ease</h1>
          <p className="hero__subtitle">
            Organize tournaments, track matches, and visualize brackets for any competition
          </p>
          <Link to="/tournament/create" className="hero__cta">
            <Plus size={20} />
            Create Tournament
          </Link>
        </div>
      </section>

      <section className="tournaments">
        <div className="tournaments__header">
          <h2 className="tournaments__title">Your Tournaments</h2>
          <Link to="/tournament/create" className="tournaments__create-btn">
            <Plus size={16} />
            New Tournament
          </Link>
        </div>

        {isLoading ? (
          <div className="tournaments__loading">Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <div className="tournaments__empty">
            <Trophy size={48} className="tournaments__empty-icon" />
            <h3 className="tournaments__empty-title">No tournaments yet</h3>
            <p className="tournaments__empty-message">
              Create your first tournament to get started.
            </p>
            <Link to="/tournament/create" className="tournaments__empty-cta">
              Create Tournament
            </Link>
          </div>
        ) : (
          <div className="tournaments__grid">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                to={`/tournament/${tournament.id}`}
                className="tournament-card"
              >
                <div className="tournament-card__header">
                  <h3 className="tournament-card__title">{tournament.name}</h3>
                  <span className={`tournament-card__type tournament-card__type--${tournament.type}`}>
                    {tournament.type.replace('-', ' ')}
                  </span>
                </div>
                <div className="tournament-card__body">
                  <p className="tournament-card__description">
                    {tournament.description}
                  </p>
                  <div className="tournament-card__meta">
                    <div className="tournament-card__meta-item">
                      <Calendar size={16} className="tournament-card__meta-icon" />
                      <span>{formatDate(tournament.startDate)}</span>
                    </div>
                    <div className="tournament-card__meta-item">
                      <Users size={16} className="tournament-card__meta-icon" />
                      <span>{tournament.participants.length} participants</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="features">
        <h2 className="features__title">Powerful Tournament Management</h2>
        <div className="features__grid">
          <div className="feature-card">
            <div className="feature-card__icon">
              <Trophy />
            </div>
            <h3 className="feature-card__title">Multiple Bracket Types</h3>
            <p className="feature-card__description">
              Support for single elimination, double elimination, and round-robin tournaments
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">
              <Users />
            </div>
            <h3 className="feature-card__title">Participant Management</h3>
            <p className="feature-card__description">
              Easy participant registration, seeding, and management
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">
              <Calendar />
            </div>
            <h3 className="feature-card__title">Match Scheduling</h3>
            <p className="feature-card__description">
              Schedule matches and track results in real-time
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;