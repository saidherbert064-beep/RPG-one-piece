
export interface CharacterStats {
  id: string; // Unique ID for each player
  name: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  bounty: number;
  devilFruit: string;
  haki: string[];
  location: string;
  inventory: string[];
}

export interface GameLogEntry {
  type: 'player' | 'gm' | 'error' | 'gm-directive';
  text: string;
  playerName?: string; // To show which player acted
}

export interface GameState {
  players: CharacterStats[];
  gameLog: GameLogEntry[];
  isLoading: boolean;
  gameOver: boolean;
  activePlayerId: string;
}

// The stats here are partial, as the AI might only update HP, for example.
export type PlayerUpdate = {
  playerId: string;
  stats: Partial<Omit<CharacterStats, 'id'>>;
}

export type HakiType = 'Armamento' | 'Observação' | 'Conquistador';

export interface HakiActivation {
    playerId: string;
    hakiType: HakiType;
}

export interface GeminiResponse {
  narrative: string;
  playerUpdates: PlayerUpdate[];
  choices: string[]; // Choices for the current active player
  gameOver: boolean;
  hakiActivation?: HakiActivation;
}
