import { v4 as uuidv4 } from 'uuid';

export type MatchStatus = 'pending' | 'in-progress' | 'completed';

export class Match {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  participant1Id: string | null;
  participant2Id: string | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  loserId: string | null;
  status: MatchStatus;
  startTime: Date | null;
  endTime: Date | null;
  isLosersBracket: boolean;
  isChampionship: boolean;

  constructor(
    tournamentId: string,
    round: number,
    matchNumber: number
  ) {
    this.id = uuidv4();
    this.tournamentId = tournamentId;
    this.round = round;
    this.matchNumber = matchNumber;
    this.participant1Id = null;
    this.participant2Id = null;
    this.score1 = null;
    this.score2 = null;
    this.winnerId = null;
    this.loserId = null;
    this.status = 'pending';
    this.startTime = null;
    this.endTime = null;
    this.isLosersBracket = false;
    this.isChampionship = false;
  }

  start(): void {
    if (this.status !== 'pending') {
      throw new Error('Match already started');
    }
    
    if (!this.participant1Id || !this.participant2Id) {
      throw new Error('Match must have two participants to start');
    }
    
    this.status = 'in-progress';
    this.startTime = new Date();
  }

  updateResult(score1: number, score2: number): void {
    if (score1 < 0 || score2 < 0) {
      throw new Error('Scores cannot be negative');
    }
    if (score1 === 0 && score2 === 0) {
      this.resetResult();
      return;
    }

    if (score1 === score2) {
      throw new Error('Scores cannot be equal (except 0-0 to reset)');
    }

    this.score1 = score1;
    this.score2 = score2;
    this.winnerId = score1 > score2 ? this.participant1Id : this.participant2Id;
    this.status = 'completed';
  }
  resetResult(): void {
    this.score1 = 0;
    this.score2 = 0;
    this.winnerId = null;
    this.status = 'pending';
  }

  toJSON() {
    return {
      id: this.id,
      tournamentId: this.tournamentId,
      round: this.round,
      matchNumber: this.matchNumber,
      participant1Id: this.participant1Id,
      participant2Id: this.participant2Id,
      score1: this.score1,
      score2: this.score2,
      winnerId: this.winnerId,
      loserId: this.loserId,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      isLosersBracket: this.isLosersBracket,
      isChampionship: this.isChampionship
    };
  }

  static fromJSON(data: any): Match {
    const match = new Match(
      data.tournamentId,
      data.round,
      data.matchNumber
    );
    
    match.id = data.id;
    match.participant1Id = data.participant1Id;
    match.participant2Id = data.participant2Id;
    match.score1 = data.score1;
    match.score2 = data.score2;
    match.winnerId = data.winnerId;
    match.loserId = data.loserId;
    match.status = data.status;
    match.startTime = data.startTime ? new Date(data.startTime) : null;
    match.endTime = data.endTime ? new Date(data.endTime) : null;
    match.isLosersBracket = data.isLosersBracket || false;
    match.isChampionship = data.isChampionship || false;
    
    return match;
  }
}