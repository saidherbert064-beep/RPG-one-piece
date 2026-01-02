
import React from 'react';
import type { CharacterStats } from '../types';

interface CharacterSheetProps {
  stats: CharacterStats;
}

const StatBar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="font-bold text-amber-100/90">{label}</span>
        <span className="text-white/80">{value} / {maxValue}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-4 border border-slate-600">
        <div
          className={`${color} h-4 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const CharacterSheet: React.FC<CharacterSheetProps> = ({ stats }) => {
  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 shadow-lg sticky top-8 animate-fade-in">
      <div className="text-center border-b-2 border-amber-400/50 pb-3 mb-4">
        <h2 className="text-3xl font-pirate text-amber-300">Diário de Bordo</h2>
      </div>
      <div className="space-y-4">
        <div>
            <p className="text-sm text-amber-200/70">Nome</p>
            <p className="text-xl font-bold font-pirate tracking-wider">{stats.name}</p>
        </div>
        <div>
            <p className="text-sm text-amber-200/70">Localização</p>
            <p className="text-lg font-bold text-amber-100">{stats.location}</p>
        </div>
        <div>
            <p className="text-sm text-amber-200/70">Recompensa</p>
            <p className="text-xl font-bold font-pirate tracking-wider">
                {stats.bounty.toLocaleString()} Berries
            </p>
        </div>
        <div>
            <p className="text-sm text-amber-200/70">Akuma no Mi</p>
            <p className="text-lg font-bold text-amber-100">{stats.devilFruit}</p>
        </div>
         {stats.haki.length > 0 && (
            <div>
                <p className="text-sm text-amber-200/70">Haki</p>
                <div className="flex flex-wrap gap-2 mt-1">
                    {stats.haki.map(h => (
                        <span key={h} className="px-2 py-1 bg-purple-800/50 text-purple-200 text-xs font-bold rounded-full">
                            {h}
                        </span>
                    ))}
                </div>
            </div>
        )}
        {stats.inventory.length > 0 && (
            <div>
                <p className="text-sm text-amber-200/70">Inventário</p>
                <div className="flex flex-col gap-1 mt-1">
                    {stats.inventory.map(item => (
                        <span key={item} className="text-amber-100 text-sm">- {item}</span>
                    ))}
                </div>
            </div>
        )}
        <div className="pt-2 space-y-3">
            <StatBar value={stats.hp} maxValue={stats.maxHp} color="bg-red-600" label="Vida" />
            <StatBar value={stats.energy} maxValue={stats.maxEnergy} color="bg-blue-500" label="Energia" />
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
