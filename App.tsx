import React, { useState, useEffect } from 'react';
import type { GameState, CharacterStats } from './types';
import LoginScreen from './components/LoginScreen';
import GMView from './components/GMView';
import PlayerView from './components/PlayerView';
import GameOverScreen from './components/GameOverScreen';
import WorldMap from './components/WorldMap';

// Initial game data
const initialPlayers: CharacterStats[] = [
  {
    id: 'player1',
    name: 'Monkey D. "Chapéu de Palha" Luffy',
    hp: 100,
    maxHp: 100,
    energy: 80,
    maxEnergy: 80,
    bounty: 3000000000,
    devilFruit: "Gomu Gomu no Mi (Despertada)",
    haki: ["Observação", "Armamento", "Conquistador"],
    location: "Thousand Sunny",
    inventory: ["Chapéu de Palha"],
  },
  {
    id: 'player2',
    name: 'Roronoa "Caçador de Piratas" Zoro',
    hp: 120,
    maxHp: 120,
    energy: 70,
    maxEnergy: 70,
    bounty: 1111000000,
    devilFruit: "Nenhuma",
    haki: ["Armamento", "Conquistador", "Observação"],
    location: "Convés do Thousand Sunny",
    inventory: ["Wado Ichimonji", "Sandai Kitetsu", "Enma", "Bandana preta"],
  },
  {
    id: 'player3',
    name: '"Gata Ladra" Nami',
    hp: 80,
    maxHp: 80,
    energy: 60,
    maxEnergy: 60,
    bounty: 366000000,
    devilFruit: "Nenhuma",
    haki: [],
    location: "Sala de Cartografia",
    inventory: ["Clima-Tact", "Mapas", "Bússola"],
  },
];

const initialGameState: GameState = {
  players: initialPlayers,
  gameLog: [{ type: 'gm', text: 'A brisa salgada do Novo Mundo enche as velas do Thousand Sunny. A tripulação do Chapéu de Palha está reunida, pronta para a próxima aventura. O que vocês fazem?' }],
  isLoading: false,
  gameOver: false,
  activePlayerId: initialPlayers[0].id,
};


const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(() => {
        const savedState = localStorage.getItem('one-piece-rpg-state');
        return savedState ? JSON.parse(savedState) : initialGameState;
    });
    const [user, setUser] = useState<{ role: 'gm' | 'player'; playerId?: string } | null>(null);
    const [isMapOpen, setMapOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('one-piece-rpg-state', JSON.stringify(gameState));
    }, [gameState]);

    const handleLogin = (role: 'gm' | 'player', playerId?: string) => {
        setUser({ role, playerId });
    };

    const handleLogout = () => {
        setUser(null);
    };

    const handleRestart = () => {
        setGameState(initialGameState);
    };

    const renderContent = () => {
        if (!user) {
            return <LoginScreen onLogin={handleLogin} players={gameState.players} />;
        }

        if (gameState.gameOver) {
            const finalBounty = gameState.players.reduce((sum, p) => sum + p.bounty, 0);
            return <GameOverScreen bounty={finalBounty} onRestart={handleRestart} />;
        }
        
        if (user.role === 'gm') {
            return <GMView gameState={gameState} setGameState={setGameState} onLogout={handleLogout} />;
        }

        if (user.role === 'player' && user.playerId) {
            const currentPlayer = gameState.players.find(p => p.id === user.playerId);
            if (currentPlayer) {
                return <PlayerView player={currentPlayer} gameState={gameState} setGameState={setGameState} onLogout={handleLogout} />;
            }
        }
        
        // Fallback to login if something is wrong
        return <LoginScreen onLogin={handleLogin} players={gameState.players} />;
    };

    return (
        <main className="bg-slate-800 text-white min-h-screen bg-cover bg-center bg-fixed" style={{backgroundImage: "url('https://wallpapercave.com/wp/wp10219159.jpg')"}}>
            <div className="bg-black/50 min-h-screen">
                {renderContent()}
                {user && !gameState.gameOver && (
                    <button
                        onClick={() => setMapOpen(true)}
                        className="fixed bottom-4 right-4 bg-amber-700/80 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-full shadow-lg border border-amber-500 backdrop-blur-sm transition-all"
                    >
                        Ver Mapa
                    </button>
                )}
                <WorldMap isOpen={isMapOpen} onClose={() => setMapOpen(false)} />
            </div>
        </main>
    );
};

export default App;
