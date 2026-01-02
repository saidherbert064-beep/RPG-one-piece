
import React, { useState } from 'react';

interface PlayerInputProps {
  onSend: (action: string) => void;
  isLoading: boolean;
  choices: string[];
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2 text-amber-200/80">
        <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
        <span>As marés estão virando...</span>
    </div>
);

const PlayerInput: React.FC<PlayerInputProps> = ({ onSend, isLoading, choices }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSend(inputValue);
      setInputValue('');
    }
  };

  const handleChoiceClick = (choice: string) => {
    if (!isLoading) {
      onSend(choice);
    }
  };

  return (
    <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-lg">
        {isLoading && <div className="mb-3 px-2 h-6"><LoadingIndicator/></div>}
        {!isLoading && choices.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 h-auto">
                {choices.map((choice, index) => (
                    <button
                        key={index}
                        onClick={() => handleChoiceClick(choice)}
                        className="flex-grow px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-amber-100 rounded-md text-sm transition-colors duration-200"
                    >
                        {choice}
                    </button>
                ))}
            </div>
        )}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isLoading ? "Aguardando resposta..." : "O que você faz?"}
          disabled={isLoading}
          className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-6 py-2 bg-amber-600 font-bold text-slate-900 rounded-md hover:bg-amber-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default PlayerInput;
