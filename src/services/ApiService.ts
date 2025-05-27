import { Tournament, TournamentType } from '../models/Tournament';
import { Participant } from '../models/Participant';
import { Match } from '../models/Match';

class ApiService {
  private storage: Storage;
  private tournamentKey = 'tournaments';

  constructor() {
    this.storage = localStorage;
  }

  async getTournaments(): Promise<Tournament[]> {
    try {
      const data = this.storage.getItem(this.tournamentKey);
      if (!data) return [];
      
      const tournamentData = JSON.parse(data);
      return tournamentData.map((t: any) => Tournament.fromJSON(t));
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      return [];
    }
  }

  async getTournament(id: string): Promise<Tournament | null> {
    try {
      const tournaments = await this.getTournaments();
      const tournament = tournaments.find(t => t.id === id);
      return tournament ? Tournament.fromJSON(tournament.toJSON()) : null;
    } catch (error) {
      console.error(`Error fetching tournament ${id}:`, error);
      return null;
    }
  }

  async createTournament(
    name: string,
    description: string,
    type: TournamentType,
    startDate: Date,
    endDate?: Date
  ): Promise<Tournament> {
    try {
      const tournament = new Tournament(name, description, type, startDate, endDate || null);
      const tournaments = await this.getTournaments();
      
      tournaments.push(tournament);
      this.storage.setItem(this.tournamentKey, JSON.stringify(tournaments.map(t => t.toJSON())));
      
      return tournament;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }

  async updateTournament(tournament: Tournament): Promise<Tournament> {
    try {
      const tournaments = await this.getTournaments();
      const index = tournaments.findIndex(t => t.id === tournament.id);
      
      if (index === -1) {
        throw new Error(`Tournament with id ${tournament.id} not found`);
      }
      
      tournament.updatedAt = new Date();
      tournaments[index] = tournament;
      
      this.storage.setItem(this.tournamentKey, JSON.stringify(tournaments.map(t => t.toJSON())));
      
      return Tournament.fromJSON(tournament.toJSON());
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
    }
  }

  async deleteTournament(id: string): Promise<boolean> {
    try {
      const tournaments = await this.getTournaments();
      const filteredTournaments = tournaments.filter(t => t.id !== id);
      
      this.storage.setItem(this.tournamentKey, JSON.stringify(filteredTournaments.map(t => t.toJSON())));
      
      return true;
    } catch (error) {
      console.error(`Error deleting tournament ${id}:`, error);
      return false;
    }
  }

  async addParticipant(tournamentId: string, participant: Participant): Promise<Tournament> {
    try {
      const tournament = await this.getTournament(tournamentId);
      
      if (!tournament) {
        throw new Error(`Tournament with id ${tournamentId} not found`);
      }
      
      tournament.addParticipant(participant);
      
      if (tournament.matches.length > 0) {
        tournament.generateBracket();
      }
      
      return await this.updateTournament(tournament);
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  async removeParticipant(tournamentId: string, participantId: string): Promise<Tournament> {
    try {
      const tournament = await this.getTournament(tournamentId);
      
      if (!tournament) {
        throw new Error(`Tournament with id ${tournamentId} not found`);
      }
      
      tournament.removeParticipant(participantId);
      
      if (tournament.matches.length > 0) {
        tournament.generateBracket();
      }
      
      return await this.updateTournament(tournament);
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  async updateMatchResult(
    tournamentId: string,
    matchId: string,
    score1: number,
    score2: number
  ): Promise<Tournament> {
    try {
      const tournament = await this.getTournament(tournamentId);
      
      if (!tournament) {
        throw new Error(`Tournament with id ${tournamentId} not found`);
      }
      
      tournament.updateMatchResult(matchId, score1, score2);
      return await this.updateTournament(tournament);
    } catch (error) {
      console.error('Error updating match result:', error);
      throw error;
    }
  }

  async generateBracket(tournamentId: string): Promise<Tournament> {
    try {
      const tournament = await this.getTournament(tournamentId);
      
      if (!tournament) {
        throw new Error(`Tournament with id ${tournamentId} not found`);
      }
      
      tournament.generateBracket();
      return await this.updateTournament(tournament);
    } catch (error) {
      console.error('Error generating bracket:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;