
import React, { useState } from 'react';
import type { CharacterStats } from '../types';

interface LoginScreenProps {
  onLogin: (role: 'gm' | 'player', playerId?: string) => void;
  players: CharacterStats[];
}

// Credentials Configuration
const GM_PASSWORD = '33526673';

const PLAYER_CREDENTIALS: Record<string, string> = {
    'player1': 'XJ92K', // Luffy
    'player2': 'B77LP', // Zoro
    'player3': 'M4P22', // Nami
    'player4': 'R00K1', // Slot 4
    'player5': 'S4NJ1', // Slot 5
    'player6': 'FR4NK', // Slot 6
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, players }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
    const [gmPassword, setGmPassword] = useState('');
    const [playerPassword, setPlayerPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleGmLogin = () => {
        if (gmPassword === GM_PASSWORD) {
            onLogin('gm');
        } else {
            setError('Senha do Mestre incorreta!');
            setGmPassword('');
        }
    };

    const handlePlayerLogin = () => {
        const correctPassword = PLAYER_CREDENTIALS[selectedPlayerId];
        if (playerPassword === correctPassword) {
            onLogin('player', selectedPlayerId);
        } else {
            setError('Senha de Pirata incorreta para esta conta!');
            setPlayerPassword('');
        }
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <h1 className="text-6xl font-pirate text-amber-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">One Piece RPG</h1>
            <p className="text-2xl text-amber-100/80 mb-12">Aventura na Grand Line</p>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* GM LOGIN */}
                <div className="bg-slate-900/70 border border-red-900/50 rounded-lg p-8 shadow-2xl flex flex-col">
                    <h2 className="text-3xl font-pirate text-amber-500 mb-6">Área do Mestre</h2>
                    <div className="space-y-4 flex-grow flex flex-col justify-center">
                        <input
                            type="password"
                            value={gmPassword}
                            onChange={(e) => {
                                setGmPassword(e.target.value);
                                setError(null);
                            }}
                            placeholder="Senha do Mestre"
                            className="w-full bg-slate-800 border border-slate-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-slate-500"
                        />
                        <button
                            onClick={handleGmLogin}
                            className="w-full px-8 py-3 bg-red-800 font-bold text-red-100 rounded-md text-lg hover:bg-red-700 transition-colors duration-200 shadow-lg border border-red-600"
                        >
                            Acessar Painel do Mestre
                        </button>
                    </div>
                </div>

                {/* PLAYER LOGIN */}
                <div className="bg-slate-900/70 border border-blue-900/50 rounded-lg p-8 shadow-2xl flex flex-col">
                    <h2 className="text-3xl font-pirate text-blue-400 mb-6">Área do Jogador</h2>
                     <div className="space-y-4 flex-grow flex flex-col justify-center">
                        <select 
                            value={selectedPlayerId}
                            onChange={(e) => {
                                setSelectedPlayerId(e.target.value);
                                setError(null);
                                setPlayerPassword('');
                            }}
                            className="w-full bg-slate-800 border border-slate-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            {players.map(player => (
                                <option key={player.id} value={player.id}>{player.name}</option>
                            ))}
                        </select>
                        
                        <input
                            type="password"
                            value={playerPassword}
                            onChange={(e) => {
                                setPlayerPassword(e.target.value);
                                setError(null);
                            }}
                            placeholder="Senha do Pirata"
                            className="w-full bg-slate-800 border border-slate-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-500"
                        />

                        <button
                            onClick={handlePlayerLogin}
                            disabled={!selectedPlayerId}
                            className="w-full px-8 py-3 bg-blue-700 font-bold text-white rounded-md text-lg hover:bg-blue-600 disabled:bg-slate-600 transition-colors duration-200 shadow-lg border border-blue-500"
                        >
                            Entrar na Aventura
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-8 p-4 bg-red-900/80 border border-red-500 text-red-100 rounded-lg animate-pulse font-bold text-lg max-w-md">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
};

export default LoginScreen;
