
import React, { useState } from 'react';
import type { CharacterStats } from '../types';

interface LoginScreenProps {
  onLogin: (role: 'gm' | 'player', playerId?: string) => void;
  players: CharacterStats[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, players }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');

    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <h1 className="text-6xl font-pirate text-amber-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">One Piece RPG</h1>
            <p className="text-2xl text-amber-100/80 mb-12">Aventura na Grand Line</p>

            <div className="w-full max-w-md bg-slate-900/70 border border-slate-700 rounded-lg p-8 shadow-2xl space-y-6">
                <div>
                    <h2 className="text-3xl font-pirate text-white mb-4">Escolha seu Papel</h2>
                    <button
                        onClick={() => onLogin('gm')}
                        className="w-full px-8 py-3 bg-amber-600 font-bold text-slate-900 rounded-md text-lg hover:bg-amber-500 transition-colors duration-200 transform hover:scale-105"
                    >
                        Entrar como Mestre do Jogo
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-slate-900/0 px-2 text-slate-400">ou</span>
                    </div>
                </div>

                <div>
                     <select 
                        value={selectedPlayerId}
                        onChange={(e) => setSelectedPlayerId(e.target.value)}
                        className="w-full mb-4 bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                     >
                        {players.map(player => (
                            <option key={player.id} value={player.id}>{player.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => onLogin('player', selectedPlayerId)}
                        disabled={!selectedPlayerId}
                        className="w-full px-8 py-3 bg-blue-700 font-bold text-white rounded-md text-lg hover:bg-blue-600 disabled:bg-slate-600 transition-colors duration-200 transform hover:scale-105"
                    >
                        Entrar como Jogador
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
