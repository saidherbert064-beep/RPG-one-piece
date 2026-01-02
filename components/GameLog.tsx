
import React, { forwardRef } from 'react';
import type { GameLogEntry } from '../types';

interface GameLogProps {
  log: GameLogEntry[];
}

const GameLog = forwardRef<HTMLDivElement, GameLogProps>(({ log }, ref) => {
  const renderEntry = (entry: GameLogEntry, index: number) => {
    switch (entry.type) {
      case 'gm':
        return (
          <div key={index} className="mb-4 text-amber-100/90 leading-relaxed text-lg">
            {entry.text.split('\n').map((paragraph, i) => <p key={i} className="mb-2">{paragraph}</p>)}
          </div>
        );
      case 'gm-directive':
        return (
          <div key={index} className="my-4 text-center">
            <p className="bg-yellow-800/50 inline-block p-2 rounded-lg italic text-yellow-100 text-sm">
                <strong>Comando do Mestre:</strong> {entry.text}
            </p>
          </div>
        );
      case 'player':
        return (
          <div key={index} className="mb-4 text-right">
             <p className="text-sm text-blue-200/70 mr-2 mb-1">{entry.playerName || 'Jogador'}</p>
            <p className="bg-blue-800/50 inline-block p-2 rounded-lg rounded-br-none italic text-blue-100">
                {entry.text}
            </p>
          </div>
        );
      case 'error':
        return (
          <div key={index} className="mb-4 text-center">
            <p className="bg-red-800/60 p-2 rounded-lg text-red-100">{entry.text}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={ref} className="flex-grow p-4 md:p-6 overflow-y-auto">
      {log.map(renderEntry)}
    </div>
  );
});

GameLog.displayName = 'GameLog';
export default GameLog;
