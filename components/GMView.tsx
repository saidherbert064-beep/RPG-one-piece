
import React, { useState, useRef, useEffect } from 'react';
import type { GameState, GameLogEntry, CharacterStats, HakiActivation } from '../types';
import { getNextTurn } from '../services/geminiService';
import CharacterSheet from './CharacterSheet';
import GameLog from './GameLog';

interface GMViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onLogout: () => void;
  onHakiActivate: (activation: HakiActivation) => void;
}

const GMView: React.FC<GMViewProps> = ({ gameState, setGameState, onLogout, onHakiActivate }) => {
  const [gmDirective, setGmDirective] = useState('');
  const gameLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameLogRef.current) {
      gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight;
    }
  }, [gameState.gameLog]);

  const handleProcessTurn = async () => {
    if (gameState.isLoading) return;
    setGameState(prev => ({ ...prev, isLoading: true }));

    const activePlayer = gameState.players.find(p => p.id === gameState.activePlayerId);
    if (!activePlayer) {
      console.error("Active player not found!");
      setGameState(prev => ({...prev, isLoading: false}));
      return;
    }

    let currentLog = gameState.gameLog;
    if(gmDirective.trim()){
      const directiveEntry: GameLogEntry = { type: 'gm-directive', text: gmDirective };
      currentLog = [...currentLog, directiveEntry];
      setGameState(prev => ({ ...prev, gameLog: currentLog}));
    }

    try {
      const response = await getNextTurn(gmDirective, gameState.players, activePlayer, currentLog);

      if (response.hakiActivation) {
        onHakiActivate(response.hakiActivation);
      }

      const newGmEntry: GameLogEntry = { type: 'gm', text: response.narrative };
      const updatedLog = [...currentLog, newGmEntry];
      
      const updatedPlayers = gameState.players.map(p => {
          const update = response.playerUpdates.find(up => up.playerId === p.id);
          if (update && update.stats) {
            // Merge stats carefully to avoid overwriting entire arrays
            const newStats = { ...p };
            Object.keys(update.stats).forEach(key => {
                const statKey = key as keyof typeof update.stats;
                if(update.stats![statKey] !== undefined){
                    (newStats as any)[statKey] = update.stats![statKey];
                }
            });
            return newStats;
          }
          return p;
      });

      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        gameLog: updatedLog,
        isLoading: false,
      }));
      setGmDirective('');

    } catch (error) {
      console.error('Error getting next turn:', error);
      const errorEntry: GameLogEntry = { type: 'error', text: 'A IA assistente está confusa. Verifique o console para erros.' };
      setGameState(prev => ({
        ...prev,
        gameLog: [...currentLog, errorEntry],
        isLoading: false,
      }));
    }
  };
  
  const setActivePlayer = (playerId: string) => {
    setGameState(prev => ({ ...prev, activePlayerId: playerId }));
  }

  const activePlayerName = gameState.players.find(p => p.id === gameState.activePlayerId)?.name || 'Nenhum';

  return (
    <div className="flex flex-col h-screen p-4 md:p-8">
      <header className="text-center mb-4 relative">
        <h1 className="text-4xl md:text-5xl font-pirate text-amber-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Painel do Mestre</h1>
        <p className="text-lg text-amber-100/80">Vez de: <span className="font-bold text-white">{activePlayerName}</span></p>
        <button onClick={onLogout} className="absolute top-0 right-0 mt-2 mr-2 md:mr-4 px-4 py-2 bg-red-800/80 border border-red-600 text-red-100 rounded-lg hover:bg-red-700 transition-colors">
          Sair
        </button>
      </header>
      
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        {gameState.players.map(player => (
           <button 
             key={player.id} 
             onClick={() => setActivePlayer(player.id)}
             className={`px-4 py-2 rounded-lg transition-colors ${gameState.activePlayerId === player.id ? 'bg-amber-600 text-slate-900 font-bold' : 'bg-slate-700 text-amber-100'}`}
           >
             {player.name}
           </button>
        ))}
      </div>

      <div className="flex-grow flex flex-col md:flex-row gap-6 w-full max-w-screen-2xl mx-auto min-h-0">
        <aside className="w-full md:w-1/3 lg:w-1/4 overflow-y-auto space-y-4 pr-2">
            {gameState.players.map(player => <CharacterSheet key={player.id} stats={player} />)}
        </aside>

        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col bg-slate-900/70 border border-slate-700 rounded-lg shadow-2xl min-h-0">
          <GameLog log={gameState.gameLog} ref={gameLogRef} />
          <div className="p-4 border-t border-slate-700 bg-slate-900/50">
            <textarea
              value={gmDirective}
              onChange={(e) => setGmDirective(e.target.value)}
              placeholder="Comando do Mestre: (Opcional) Dê uma diretriz para a IA antes de processar o turno do jogador."
              disabled={gameState.isLoading}
              className="w-full h-24 bg-slate-800 border border-slate-600 rounded-md p-2 mb-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={handleProcessTurn}
              disabled={gameState.isLoading}
              className="w-full px-6 py-3 bg-amber-600 font-bold text-slate-900 rounded-md hover:bg-amber-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 text-lg"
            >
              {gameState.isLoading ? 'Processando...' : `Processar Turno de ${activePlayerName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GMView;
