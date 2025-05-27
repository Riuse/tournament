import { v4 as uuidv4 } from 'uuid';
import { Match } from './Match';
import { Participant } from './Participant';

export type TournamentType = 'single-elimination';

export class Tournament {
  id: string;
  name: string;
  description: string;
  type: TournamentType;
  startDate: Date;
  endDate: Date | null;
  participants: Participant[];
  matches: Match[];
  rounds: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    name: string,
    description: string,
    type: TournamentType,
    startDate: Date,
    endDate: Date | null = null
  ) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.type = type;
    this.startDate = startDate;
    this.endDate = endDate;
    this.participants = [];
    this.matches = [];
    this.rounds = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addParticipant(participant: Participant): void {
    if (this.participants.some(p => p.name.toLowerCase() === participant.name.toLowerCase())) {
      throw new Error('A participant with this name already exists');
    }
    this.participants.push(participant);
    this.updatedAt = new Date();
  }

  removeParticipant(participantId: string): void {
    this.participants = this.participants.filter(p => p.id !== participantId);
    this.updatedAt = new Date();
  }

  generateBracket(): void {
    if (this.participants.length < 2) {
      throw new Error('Tournament needs at least 2 participants');
    }

    // Reset matches
    this.matches = [];
    
    // Calculate rounds needed (ceiling of log2 of participant count)
    this.rounds = Math.ceil(Math.log2(this.participants.length));
    
    // Calculate byes needed
    const totalSlots = Math.pow(2, this.rounds);
    const byeCount = totalSlots - this.participants.length;
    
    // Shuffle participants
    const shuffledParticipants = [...this.participants]
      .sort(() => Math.random() - 0.5);
    
    // Generate first round matches
    let matchNumber = 1;
    for (let i = 0; i < totalSlots / 2; i++) {
      const match = new Match(this.id, 1, matchNumber++);
      
      // Handle bye matches
      if (i >= (totalSlots / 2) - byeCount) {
        const participant = shuffledParticipants[i];
        match.participant1Id = participant.id;
        match.participant2Id = null; // Bye
        match.status = 'completed';
        match.winnerId = participant.id;
      } else {
        const participant1 = shuffledParticipants[i];
        const participant2 = shuffledParticipants[shuffledParticipants.length - 1 - i];
        match.participant1Id = participant1.id;
        match.participant2Id = participant2.id;
      }
      
      this.matches.push(match);
    }

    // Generate subsequent round matches
    for (let round = 2; round <= this.rounds; round++) {
      const matchesInRound = Math.pow(2, this.rounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        const match = new Match(this.id, round, matchNumber++);
        this.matches.push(match);
      }
    }

    // Advance bye winners automatically
    const byeMatches = this.matches.filter(m => 
      m.round === 1 && m.participant2Id === null && m.winnerId
    );
    byeMatches.forEach(match => this.advanceWinner(match));
    
    this.updatedAt = new Date();
  }

  private advanceWinner(match: Match): void {
    if (!match.winnerId || match.round === this.rounds) return;

    const matchesInRound = Math.pow(2, this.rounds - match.round);
    const nextRoundFirstMatch = this.matches.findIndex(m => m.round === match.round + 1);
    const positionInRound = match.matchNumber - 
      this.matches.find(m => m.round === match.round)!.matchNumber;
    
    const nextMatchIndex = nextRoundFirstMatch + Math.floor(positionInRound / 2);
    const nextMatch = this.matches[nextMatchIndex];
    
    if (!nextMatch) return;

    const winner = this.participants.find(p => p.id === match.winnerId);
    if (!winner) return;

    if (positionInRound % 2 === 0) {
      nextMatch.participant1Id = winner.id;
    } else {
      nextMatch.participant2Id = winner.id;
    }

    if (nextMatch.participant1Id && nextMatch.participant2Id) {
      nextMatch.status = 'in-progress';
    }
  }

  updateMatchResult(matchId: string, score1: number, score2: number): void {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');

    const previousWinnerId = match.winnerId;
    match.updateResult(score1, score2);

    if (previousWinnerId !== match.winnerId) {
      this.cleanupAdvancement(match, previousWinnerId);
    }

    if (match.winnerId) {
      this.advanceWinner(match);
    }

    this.updatedAt = new Date();
  }

  private cleanupAdvancement(match: Match, previousWinnerId: string | null): void {
    if (!previousWinnerId || match.round === this.rounds) return;

    const nextMatch = this.matches.find(m => 
      m.round === match.round + 1 && 
      (m.participant1Id === previousWinnerId || m.participant2Id === previousWinnerId)
    );

    if (!nextMatch) return;

    if (nextMatch.participant1Id === previousWinnerId) {
      nextMatch.participant1Id = null;
    } else {
      nextMatch.participant2Id = null;
    }

    nextMatch.status = 'pending';
    
    if (nextMatch.winnerId) {
      this.cleanupAdvancement(nextMatch, nextMatch.winnerId);
      nextMatch.resetResult();
    }
  }

  getMatchesByRound(round: number): Match[] {
    return this.matches.filter(match => match.round === round);
  }

  getWinner(): Participant | null {
    const finalMatch = this.matches.find(
      match => match.round === this.rounds && match.status === 'completed'
    );
    
    if (!finalMatch?.winnerId) return null;
    return this.participants.find(p => p.id === finalMatch.winnerId) || null;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      startDate: this.startDate,
      endDate: this.endDate,
      participants: this.participants.map(p => p.toJSON()),
      matches: this.matches.map(m => m.toJSON()),
      rounds: this.rounds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data: any): Tournament {
    const tournament = new Tournament(
      data.name,
      data.description,
      data.type,
      new Date(data.startDate),
      data.endDate ? new Date(data.endDate) : null
    );
    
    tournament.id = data.id;
    tournament.rounds = data.rounds;
    tournament.createdAt = new Date(data.createdAt);
    tournament.updatedAt = new Date(data.updatedAt);
    
    tournament.participants = data.participants.map(Participant.fromJSON);
    tournament.matches = data.matches.map(Match.fromJSON);
    
    return tournament;
  }
}