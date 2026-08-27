import React from 'react';
import { RotateCcw, Skull } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ score, onRestart }) => {
  return (
    <div
      id="game-over-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md select-none"
    >
      <div className="bg-[#1c1917] border-2 border-red-800 rounded-xl max-w-sm w-full p-5 text-center text-[#fef08a] shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-950/80 border border-red-600 flex items-center justify-center text-red-500 shadow-lg">
          <Skull className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-red-500 font-serif uppercase tracking-widest mb-1">
          DRUŽINA PADLA
        </h2>

        <p className="text-xs text-[#d6d3d1] mb-3 leading-relaxed">
          Zbojnícka presila bola prisilná a Jakub s chlapcami stratili vedomie. Dievčatá zo súboru vás však stále potrebujú!
        </p>

        <div className="bg-[#0c0a09] border border-[#78350f] p-2 rounded-lg mb-4">
          <span className="text-[10px] uppercase text-[#a8a29e] block font-mono">Získané Folklórne Skóre</span>
          <span className="text-xl font-bold text-[#fbbf24] font-mono">{score}</span>
        </div>

        <button
          id="btn-restart-game"
          onClick={onRestart}
          className="w-full py-2.5 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-[#fef08a] font-bold uppercase tracking-wider rounded-lg font-serif text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Zatancovať Odznova
        </button>
      </div>
    </div>
  );
};
