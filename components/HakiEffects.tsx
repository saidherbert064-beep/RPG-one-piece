
import React from 'react';
import type { HakiActivation } from '../types';

interface HakiEffectsProps {
  activeEffect: HakiActivation | null;
}

const HakiEffects: React.FC<HakiEffectsProps> = ({ activeEffect }) => {
  if (!activeEffect) {
    return null;
  }

  const { hakiType } = activeEffect;

  const getEffectElement = () => {
    switch (hakiType) {
      case 'Conquistador':
        return (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="absolute rounded-full border-[10px] border-red-500/80 animate-conquerors" style={{ width: '1px', height: '1px' }}></div>
          </div>
        );
      case 'Armamento':
        return (
          <div className="fixed inset-0 pointer-events-none z-10 animate-armament"></div>
        );
      case 'Observação':
        return (
          <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full animate-observation bg-gradient-to-b from-cyan-400/30 via-cyan-400/50 to-cyan-400/30"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return getEffectElement();
};

export default HakiEffects;
