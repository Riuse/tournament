import { Tournament } from './Tournament';
import { Participant } from './Participant';
import { Match } from './Match';

describe('Tournament', () => {
  let tournament: Tournament;

  beforeEach(() => {
    tournament = new Tournament(
      'Test',
      'Description',
      'single-elimination',
      new Date()
    );
  });

  describe('addParticipant()', () => {
    it('should add participant', () => {
      tournament.addParticipant(new Participant('Player 1'));
      expect(tournament.participants).toHaveLength(1);
    });

    it('should throw for duplicate names', () => {
      tournament.addParticipant(new Participant('Player 1'));
      expect(() => tournament.addParticipant(new Participant('Player 1')))
        .toThrow('A participant with this name already exists');
    });
  });

  describe('generateBracket()', () => {
    it('should throw for <2 participants', () => {
      expect(() => tournament.generateBracket()).toThrow('Tournament needs at least 2 participants');
    });

    it('should generate correct bracket structure', () => {
      // Add 8 participants
      for (let i = 1; i <= 8; i++) {
        tournament.addParticipant(new Participant(`Player ${i}`));
      }

      tournament.generateBracket();
      
      expect(tournament.rounds).toBe(3);
      expect(tournament.matches).toHaveLength(7); // 4 + 2 + 1
    });
  });

  describe('updateMatchResult()', () => {
    it('should update match and advance winner', () => {
      // Setup tournament with 2 participants
      const p1 = new Participant('Player 1');
      const p2 = new Participant('Player 2');
      tournament.addParticipant(p1);
      tournament.addParticipant(p2);
      tournament.generateBracket();

      const match = tournament.matches[0];
      tournament.updateMatchResult(match.id, 2, 1);
      expect(match.winnerId).toBe(p1.id);
    });
  });

  describe('getWinner()', () => {
    it('should return null if no winner', () => {
      expect(tournament.getWinner()).toBeNull();
    });

    it('should return final match winner', () => {
      const p1 = new Participant('Player 1');
      tournament.addParticipant(p1);
      tournament.addParticipant(new Participant('Player 2'));
      tournament.generateBracket();

      const finalMatch = tournament.matches.find(m => m.round === tournament.rounds)!;
      finalMatch.updateResult(2, 1);

      expect(tournament.getWinner()?.id).toBe(p1.id);
    });
  });
});