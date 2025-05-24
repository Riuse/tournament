import { v4 as uuidv4 } from 'uuid';
import { Match } from './Match';
import { Participant } from './Participant';

export type TournamentType = 'single-elimination' | 'double-elimination';

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
    
    if (this.type === 'single-elimination') {
      this.generateSingleEliminationBracket(shuffledParticipants);
    } else if (this.type === 'double-elimination') {
      this.generateDoubleEliminationBracket(shuffledParticipants);
    }
    
    this.updatedAt = new Date();
  }

  private generateSingleEliminationBracket(shuffledParticipants: Participant[]): void {
    const totalParticipants = shuffledParticipants.length;
    const firstRoundMatches = Math.pow(2, this.rounds - 1);
    
    let matchIndex = 0;
    let participantIndex = 0;
    
    // Create first round matches
    for (let i = 0; i < firstRoundMatches; i++) {
      const match = new Match(this.id, 1, i + 1);
      
      if (participantIndex < totalParticipants) {
        match.participant1Id = shuffledParticipants[participantIndex++].id;
      }
      
      if (participantIndex < totalParticipants) {
        match.participant2Id = shuffledParticipants[participantIndex++].id;
      } else if (match.participant1Id) {
        // If there's no second participant, the first one advances automatically
        match.winnerId = match.participant1Id;
        match.status = 'completed';
      }
      
      this.matches.push(match);
      matchIndex++;
    }
    
    // Create subsequent round matches
    for (let round = 2; round <= this.rounds; round++) {
      const roundMatches = Math.pow(2, this.rounds - round);
      
      for (let i = 0; i < roundMatches; i++) {
        const match = new Match(this.id, round, i + 1);
        this.matches.push(match);
        matchIndex++;
      }
    }
  }

  private generateDoubleEliminationBracket(shuffledParticipants: Participant[]): void {
    // Generate winners bracket first
    this.generateSingleEliminationBracket(shuffledParticipants);
    const winnersMatches = [...this.matches];
    
    // Generate losers bracket
    const losersBracketRounds = this.rounds * 2 - 1;
    let loserMatchNumber = 1;
    
    for (let round = 1; round <= losersBracketRounds; round++) {
      const isEvenRound = round % 2 === 0;
      const matchesInRound = Math.pow(2, Math.floor((losersBracketRounds - round) / 2));
      
      for (let i = 0; i < matchesInRound; i++) {
        const match = new Match(this.id, round + this.rounds, loserMatchNumber++);
        match.isLosersBracket = true;
        this.matches.push(match);
      }
    }
    
    // Add final championship match
    const finalMatch = new Match(this.id, this.rounds * 2, loserMatchNumber);
    finalMatch.isChampionship = true;
    this.matches.push(finalMatch);
  }

  getMatchesByRound(round: number): Match[] {
    return this.matches.filter(match => match.round === round);
  }

  updateMatchResult(matchId: string, score1: number, score2: number): void {
    const match = this.matches.find(m => m.id === matchId);
    
    if (!match) {
      throw new Error('Match not found');
    }
    
    match.updateResult(score1, score2);
    this.updatedAt = new Date();
    
    if (this.type === 'single-elimination') {
      this.advanceWinnerSingleElimination(match);
    } else {
      this.advanceWinnerDoubleElimination(match);
    }
  }

  private advanceWinnerSingleElimination(match: Match): void {
    if (!match.winnerId) return;
    
    const nextRound = match.round + 1;
    if (nextRound > this.rounds) return;
    
    const matchPosition = Math.ceil(match.matchNumber / 2);
    const nextMatch = this.matches.find(
      m => m.round === nextRound && m.matchNumber === matchPosition
    );
    
    if (!nextMatch) return;
    
    if (match.matchNumber % 2 === 1) {
      nextMatch.participant1Id = match.winnerId;
    } else {
      nextMatch.participant2Id = match.winnerId;
    }
  }

  private advanceWinnerDoubleElimination(match: Match): void {
    if (!match.winnerId || !match.loserId) return;
    
    if (match.isLosersBracket) {
      this.advanceLosersBracketWinner(match);
    } else if (match.isChampionship) {
      // Tournament is complete
      return;
    } else {
      // Winners bracket match
      this.advanceWinnerSingleElimination(match);
      this.moveLoserToLosersBracket(match);
    }
  }

  private advanceLosersBracketWinner(match: Match): void {
    if (!match.winnerId) return;
    
    const nextRound = match.round + 1;
    const matchPosition = Math.ceil(match.matchNumber / 2);
    
    const nextMatch = this.matches.find(
      m => m.round === nextRound && 
          m.matchNumber === matchPosition && 
          m.isLosersBracket
    );
    
    if (!nextMatch) {
      // Winner goes to championship match
      const championshipMatch = this.matches.find(m => m.isChampionship);
      if (championshipMatch) {
        championshipMatch.participant2Id = match.winnerId;
      }
      return;
    }
    
    if (match.matchNumber % 2 === 1) {
      nextMatch.participant1Id = match.winnerId;
    } else {
      nextMatch.participant2Id = match.winnerId;
    }
  }

  private moveLoserToLosersBracket(match: Match): void {
    if (!match.loserId) return;
    
    const losersBracketRound = match.round + this.rounds;
    const matchPosition = Math.ceil(match.matchNumber / 2);
    
    const loserMatch = this.matches.find(
      m => m.round === losersBracketRound && 
          m.matchNumber === matchPosition && 
          m.isLosersBracket
    );
    
    if (!loserMatch) return;
    
    if (match.matchNumber % 2 === 1) {
      loserMatch.participant1Id = match.loserId;
    } else {
      loserMatch.participant2Id = match.loserId;
    }
  }

  getWinner(): Participant | null {
    const finalMatch = this.type === 'single-elimination' 
      ? this.matches.find(match => match.round === this.rounds && match.status === 'completed')
      : this.matches.find(match => match.isChampionship && match.status === 'completed');
    
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