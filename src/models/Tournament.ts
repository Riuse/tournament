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
    // Check if participant with same name already exists
    if (this.participants.some(p => p.name.toLowerCase() === participant.name.toLowerCase())) {
      throw new Error('A participant with this name already exists');
    }
    this.participants.push(participant);
    this.updatedAt = new Date();
  }

  removeParticipant(participantId: string): void {
    this.participants = this.participants.filter(
      (participant) => participant.id !== participantId
    );
    this.updatedAt = new Date();
  }

  generateBracket(): void {
  this.matches = [];
  
  if (this.participants.length < 2) {
    throw new Error('Need at least 2 participants to generate a bracket');
  }

  // Shuffle participants randomly
  const shuffledParticipants = [...this.participants]
    .sort(() => Math.random() - 0.5);

  // Calculate number of rounds needed
  this.rounds = Math.ceil(Math.log2(shuffledParticipants.length));
  const perfectBracketSize = Math.pow(2, this.rounds);
  
  // Calculate how many participants get byes (pass to next round automatically)
  const byesCount = perfectBracketSize - shuffledParticipants.length;
  
  // Split participants into those who play in first round and those who get byes
  const firstRoundParticipants = shuffledParticipants.slice(byesCount);
  const byeParticipants = shuffledParticipants.slice(0, byesCount);
  
  // Create first round matches
  const firstRoundMatches = Math.floor(firstRoundParticipants.length / 2);
  let participantIndex = 0;
  
  for (let i = 0; i < firstRoundMatches; i++) {
    const match = new Match(this.id, 1, i + 1);
    match.participant1Id = firstRoundParticipants[participantIndex++].id;
    match.participant2Id = firstRoundParticipants[participantIndex++].id;
    this.matches.push(match);
  }
  
  // Create subsequent rounds and assign bye participants
  for (let round = 2; round <= this.rounds; round++) {
    const matchesInRound = Math.pow(2, this.rounds - round);
    
    for (let i = 0; i < matchesInRound; i++) {
      const match = new Match(this.id, round, i + 1);
      
      // Check if this match position should get a bye participant
      const byeIndex = i - (matchesInRound - byeParticipants.length);
      if (byeIndex >= 0 && byeIndex < byeParticipants.length) {
        match.participant1Id = byeParticipants[byeIndex].id;
      }
      
      this.matches.push(match);
    }
  }
  
  // Sort matches by round and match number
  this.matches.sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.matchNumber - b.matchNumber;
  });
}

  getMatchesByRound(round: number): Match[] {
    return this.matches.filter(match => match.round === round);
  }
  private cleanupPreviousAdvancement(match: Match, previousWinnerId: string): void {
    const nextRound = match.round + 1;
    if (nextRound > this.rounds) return;

    const nextMatchNumber = Math.ceil(match.matchNumber / 2);
    const nextMatch = this.matches.find(
      m => m.round === nextRound && m.matchNumber === nextMatchNumber
    );

    if (!nextMatch) return;

    // Remove previous winner from next match
    if (nextMatch.participant1Id === previousWinnerId) {
      nextMatch.participant1Id = null;
      // Move bye participant to first slot if exists in second slot
      if (nextMatch.participant2Id && !nextMatch.participant1Id) {
        nextMatch.participant1Id = nextMatch.participant2Id;
        nextMatch.participant2Id = null;
      }
    } else if (nextMatch.participant2Id === previousWinnerId) {
      nextMatch.participant2Id = null;
    }

    // Reset match result if participants changed
    if (nextMatch.status === 'completed') {
      nextMatch.resetResult();
    if (nextMatch.winnerId) {
      this.cleanupPreviousAdvancement(nextMatch, nextMatch.winnerId);
    }
    }
  }
 updateMatchResult(matchId: string, score1: number, score2: number): void {
  const match = this.matches.find(m => m.id === matchId);
  
  if (!match) {
    throw new Error('Match not found');
  }

  // Handle reset case
  if (score1 === 0 && score2 === 0) {
    this.resetMatchResult(match);
    return;
  }

  if (score1 < 0 || score2 < 0) {
    throw new Error('Scores cannot be negative');
  }

  if (score1 === score2) {
    throw new Error('Scores cannot be equal (except 0-0 to reset)');
  }

  const previousWinnerId = match.winnerId;
  
  // Update current match
  match.score1 = score1;
  match.score2 = score2;
  match.winnerId = score1 > score2 ? match.participant1Id : match.participant2Id;
  match.status = 'completed';
  this.updatedAt = new Date();

  // Clean up previous advancement if winner changed
  if (previousWinnerId && previousWinnerId !== match.winnerId) {
    this.cleanupPreviousAdvancement(match, previousWinnerId);
  }

  // Advance new winner
  this.advanceWinner(match);
}

private resetMatchResult(match: Match): void {
  const previousWinnerId = match.winnerId;
  
  // Reset current match
  match.score1 = 0;
  match.score2 = 0;
  match.winnerId = null;
  match.status = 'pending';

  // Clean up previous advancement
  if (previousWinnerId) {
    this.cleanupPreviousAdvancement(match, previousWinnerId);
  }
}

  private advanceWinner(match: Match): void {
  if (!match.winnerId) return;
  
  const nextRound = match.round + 1;
  if (nextRound > this.rounds) return;
  
  const nextMatchNumber = Math.ceil(match.matchNumber / 2);
  const nextMatch = this.matches.find(
    m => m.round === nextRound && m.matchNumber === nextMatchNumber
  );
  
  if (!nextMatch) return;
  if (match.winnerId === null) return;
  // Determine which slot this winner should go to based on match position
  const isFirstSlot = match.matchNumber % 2 === 1;
  
  // Clear previous assignment if this winner was already advanced
  if (nextMatch.participant1Id === match.winnerId) {
    nextMatch.participant1Id = null;
  }
  if (nextMatch.participant2Id === match.winnerId) {
    nextMatch.participant2Id = null;
  }
  
  // Assign to correct slot
  if (isFirstSlot) {
    // If first slot is occupied by a bye, move it to second slot
    if (nextMatch.participant1Id && !nextMatch.participant2Id) {
      nextMatch.participant2Id = nextMatch.participant1Id;
      nextMatch.participant1Id = match.winnerId;
    } else {
      nextMatch.participant1Id = match.winnerId;
    }
  } else {
    nextMatch.participant2Id = match.winnerId;
  }
  
  // Reset match result if participants changed
  if (nextMatch.status === 'completed') {
    nextMatch.resetResult();
  }
}

  getWinner(): Participant | null {
    const finalMatch = this.matches.find(
      match => match.round === this.rounds && match.status === 'completed'
    );
    
    if (!finalMatch || !finalMatch.winnerId) {
      return null;
    }
    
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