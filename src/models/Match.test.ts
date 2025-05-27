import { Match } from './Match';

describe('Match', () => {
  let match: Match;

  beforeEach(() => {
    match = new Match('tournament-1', 1, 1);
  });

  it('should initialize with default values', () => {
    expect(match.status).toBe('pending');
    expect(match.score1).toBeNull();
    expect(match.score2).toBeNull();
  });

  describe('start()', () => {
    it('should start match with two participants', () => {
      match.participant1Id = 'p1';
      match.participant2Id = 'p2';
      match.start();
      expect(match.status).toBe('in-progress');
      expect(match.startTime).toBeInstanceOf(Date);
    });

    it('should throw error if already started', () => {
      match.status = 'in-progress';
      expect(() => match.start()).toThrow('Match already started');
    });

    it('should throw error if not enough participants', () => {
      expect(() => match.start()).toThrow('Match must have two participants');
    });
  });

  describe('updateResult()', () => {
    beforeEach(() => {
      match.participant1Id = 'p1';
      match.participant2Id = 'p2';
    });

    it('should update result correctly', () => {
      match.updateResult(2, 1);
      expect(match.score1).toBe(2);
      expect(match.score2).toBe(1);
      expect(match.winnerId).toBe('p1');
      expect(match.status).toBe('completed');
    });

    it('should throw for negative scores', () => {
      expect(() => match.updateResult(-1, 0)).toThrow('Scores cannot be negative');
    });

    it('should throw for equal scores', () => {
      expect(() => match.updateResult(1, 1)).toThrow('Scores cannot be equal');
    });

    it('should reset for 0-0 score', () => {
      match.updateResult(0, 0);
      expect(match.score1).toBe(0);
      expect(match.score2).toBe(0);
      expect(match.winnerId).toBeNull();
      expect(match.status).toBe('pending');
    });
  });

  describe('toJSON()', () => {
    it('should serialize correctly', () => {
      const json = match.toJSON();
      expect(json).toHaveProperty('id');
      expect(json.tournamentId).toBe('tournament-1');
    });
  });

  describe('fromJSON()', () => {
    it('should deserialize correctly', () => {
      const json = {
        id: 'match-1',
        tournamentId: 'tournament-1',
        round: 1,
        matchNumber: 1,
        participant1Id: 'p1',
        participant2Id: 'p2',
        score1: 2,
        score2: 1,
        winnerId: 'p1',
        status: 'completed',
        startTime: '2023-01-01T00:00:00.000Z'
      };
      
      const deserialized = Match.fromJSON(json);
      expect(deserialized.id).toBe('match-1');
      expect(deserialized.winnerId).toBe('p1');
    });
  });
});