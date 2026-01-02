
import React from 'react';

interface GameOverScreenProps {
  bounty: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ bounty, onRestart }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
      <h2 className="text-5xl font-pirate text-red-500 mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
        O Fim de uma Lenda
      </h2>
      <p className="text-xl text-amber-100/80 mb-6">
        Sua jornada pelos mares chegou ao fim... mas sua história será contada por eras.
      </p>
      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg mb-8">
        <p className="text-lg text-amber-200/70">Recompensa Final</p>
        <p className="text-4xl font-bold font-pirate tracking-wider text-amber-300">
          {bounty.toLocaleString()} Berries
        </p>
      </div>
      <button
        onClick={onRestart}
        className="px-8 py-3 bg-amber-600 font-bold text-slate-900 rounded-md text-lg hover:bg-amber-500 transition-colors duration-200 transform hover:scale-105"
      >
        Navegar Mais Uma Vez
      </button>
    </div>
  );
};

export default GameOverScreen;
