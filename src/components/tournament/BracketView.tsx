import React from 'react';
import { Tournament } from '../../models/Tournament';
import { Match } from '../../models/Match';
import MatchCard from './MatchCard';

interface BracketViewProps {
  tournament: Tournament;
  onUpdateMatch: (matchId: string, score1: number, score2: number) => void;
}

const BracketView: React.FC<BracketViewProps> = ({ tournament, onUpdateMatch }) => {
  const rounds = Array.from({ length: tournament.rounds }, (_, i) => i + 1);
  const getMatchCountForRound = (round: number) => {
    return Math.pow(2, tournament.rounds - round);
  };

  return (
    <div className="bracket">
      {rounds.map(round => {
        const matchesInRound = tournament.getMatchesByRound(round);
        const matchCount = getMatchCountForRound(round);
        const gapMultiplier = Math.pow(2, round - 1);
        
        return (
          <div 
            key={round} 
            className="bracket__round"
            style={{ 
              '--match-count': matchCount,
              '--gap-multiplier': gapMultiplier
            } as React.CSSProperties}
          >
            <div className="bracket__round-header">
              <h3 className="bracket__round-title">
                {round === tournament.rounds 
                  ? 'Final' 
                  : round === tournament.rounds - 1 
                    ? 'Semifinals' 
                    : round === tournament.rounds - 2 
                      ? 'Quarterfinals'
                      : `Round ${round}`}
              </h3>
            </div>
            
            <div className="bracket__matches">
              {matchesInRound.map(match => (
                <div 
                  key={match.id} 
                  className="bracket__match-wrapper"
                >
                  <MatchCard 
                    match={match} 
                    participants={tournament.participants}
                    onUpdateMatch={onUpdateMatch}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BracketView;