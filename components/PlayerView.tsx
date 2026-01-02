
import React, { useRef, useEffect } from 'react';
import type { GameState, CharacterStats, GameLogEntry } from '../types';
import CharacterSheet from './CharacterSheet';
import GameLog from './GameLog';
import PlayerInput from './PlayerInput';

interface PlayerViewProps {
  player: CharacterStats;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onLogout: () => void;
}

const PlayerView: React.FC<PlayerViewProps> = ({ player, gameState, setGameState, onLogout }) => {
  const gameLogRef = useRef<HTMLDivElement>(null);
  const isMyTurn = gameState.activePlayerId === player.id;

  useEffect(() => {
    if (gameLogRef.current) {
      gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight;
    }
  }, [gameState.gameLog]);
  
  const handlePlayerAction = (action: string) => {
    if (!action.trim() || !isMyTurn || gameState.isLoading) return;

    const newPlayerEntry: GameLogEntry = { type: 'player', text: action, playerName: player.name };
    // Player actions don't trigger a Gemini call from their side.
    // They just add to the log for the GM to process.
    setGameState(prev => ({
        ...prev,
        gameLog: [...prev.gameLog, newPlayerEntry],
    }));
  };

  return (
    <div className="flex flex-col h-screen p-4 md:p-8">
       <header className="text-center mb-4 relative">
            <h1 className="text-4xl md:text-5xl font-pirate text-amber-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{player.name}</h1>
            <p className={`text-lg transition-opacity ${isMyTurn ? 'text-green-400 animate-pulse' : 'text-red-400'}`}>
                {isMyTurn ? "É a sua vez de agir!" : "Aguarde seu turno."}
            </p>
            <button onClick={onLogout} className="absolute top-0 right-0 mt-2 mr-2 md:mr-4 px-4 py-2 bg-red-800/80 border border-red-600 text-red-100 rounded-lg hover:bg-red-700 transition-colors">
              Sair
            </button>
      </header>

      <div className="flex-grow flex flex-col md:flex-row gap-6 w-full max-w-7xl mx-auto min-h-0">
          <aside className="w-full md:w-1/3 lg:w-1/4">
              <CharacterSheet stats={player} />
          </aside>
          
          <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col bg-slate-900/70 border border-slate-700 rounded-lg shadow-2xl min-h-0">
              <GameLog log={gameState.gameLog} ref={gameLogRef} />
              <div className={!isMyTurn ? 'opacity-50 pointer-events-none' : ''}>
                <PlayerInput 
                    onSend={handlePlayerAction} 
                    isLoading={gameState.isLoading || !isMyTurn}
                    // For now, players don't get AI choices directly. The GM does.
                    choices={[]} 
                />
              </div>
          </div>
      </div>
    </div>
  );
};

export default PlayerView;
