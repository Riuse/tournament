import ApiService from './ApiService';
import { Tournament } from '../models/Tournament';
import { Participant } from '../models/Participant';

describe('ApiService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Tournament operations', () => {
    it('should create and retrieve tournaments', async () => {
      const tournament = await ApiService.createTournament(
        'Test Tournament',
        'Test Description',
        'single-elimination',
        new Date()
      );
      
      const tournaments = await ApiService.getTournaments();
      expect(tournaments).toHaveLength(1);
      expect(tournaments[0].name).toBe('Test Tournament');
    });

    it('should update a tournament', async () => {
      const tournament = await ApiService.createTournament(
        'Test Tournament',
        'Test Description',
        'single-elimination',
        new Date()
      );
      
      tournament.name = 'Updated Name';
      const updatedTournament = await ApiService.updateTournament(tournament);
      
      expect(updatedTournament.name).toBe('Updated Name');
    });

    it('should delete a tournament', async () => {
      const tournament = await ApiService.createTournament(
        'Test Tournament',
        'Test Description',
        'single-elimination',
        new Date()
      );
      
      const result = await ApiService.deleteTournament(tournament.id);
      expect(result).toBe(true);
      
      const tournaments = await ApiService.getTournaments();
      expect(tournaments).toHaveLength(0);
    });
  });

  describe('Participant operations', () => {
    it('should add and remove participants', async () => {
      const tournament = await ApiService.createTournament(
        'Test Tournament',
        'Test Description',
        'single-elimination',
        new Date()
      );
      
      const participant = new Participant('Player 1');
      const updatedTournament = await ApiService.addParticipant(tournament.id, participant);
      
      expect(updatedTournament.participants).toHaveLength(1);
      expect(updatedTournament.participants[0].name).toBe('Player 1');
      
      const afterRemoval = await ApiService.removeParticipant(
        tournament.id, 
        updatedTournament.participants[0].id
      );
      
      expect(afterRemoval.participants).toHaveLength(0);
    });
  });

  describe('Match operations', () => {
    it('should generate bracket and update matches', async () => {
      const tournament = await ApiService.createTournament(
        'Test Tournament',
        'Test Description',
        'single-elimination',
        new Date()
      );
      
      await ApiService.addParticipant(tournament.id, new Participant('Player 1'));
      await ApiService.addParticipant(tournament.id, new Participant('Player 2'));
      await ApiService.addParticipant(tournament.id, new Participant('Player 3'));
      await ApiService.addParticipant(tournament.id, new Participant('Player 4'));
      
      const withBracket = await ApiService.generateBracket(tournament.id);
      expect(withBracket.matches.length).toBeGreaterThan(0);
      
      const firstMatch = withBracket.matches[0];
      const updated = await ApiService.updateMatchResult(
        tournament.id,
        firstMatch.id,
        2,
        1
      );
      
      const updatedMatch = updated.matches.find(m => m.id === firstMatch.id);
      expect(updatedMatch?.score1).toBe(2);
      expect(updatedMatch?.score2).toBe(1);
    });
  });
describe('ApiService error handling', () => {
  it('should handle storage errors', async () => {
    // Simulate storage failure
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage failed');
    });

    try {
      await expect(ApiService.createTournament(
        'Test',
        'Desc',
        'single-elimination',
        new Date()
      )).rejects.toThrow('Storage failed');
    } finally {
      spy.mockRestore();
    }
  });

  it('should propagate participant errors', async () => {
    const tournament = await ApiService.createTournament(
      'Test',
      'Desc',
      'single-elimination',
      new Date()
    );
    
    await ApiService.addParticipant(tournament.id, new Participant('Player 1'));
    await expect(ApiService.addParticipant(tournament.id, new Participant('Player 1')))
      .rejects.toThrow('A participant with this name already exists');
  });
});
});