import React from 'react';
import { RotateCcw, Trophy, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  score: number;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ score, onRestart }) => {
  return (
    <div
      id="victory-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md select-none"
    >
      <div className="bg-[#1c1917] border-2 border-[#fbbf24] rounded-xl max-w-md w-full p-5 text-center text-[#fef08a] shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-950/90 border-2 border-[#fbbf24] flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(251,191,36,0.5)]">
          🎉
        </div>

        <div className="inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold tracking-widest text-[#fbbf24] bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-[#fbbf24] mb-2">
          <Sparkles className="w-3 h-3 text-[#fbbf24]" />
          VEĽKOLEPÉ VÍŤAZSTVO
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-[#fbbf24] font-serif uppercase tracking-wider mb-2">
          DIEVČATÁ ZO SÚBORU SÚ ZACHRÁNENÉ!
        </h2>

        <p className="text-xs text-[#e7e5e4] mb-4 leading-relaxed font-sans">
          Sláva Jakubovi, Šimimu a Filipovi! Všetky tri festivalové kľúče z Detvy, Myjavy a Terchovej odomkli bránu Severného Hradu. Zbojníci boli porazení a folklórny súbor môže opäť tancovať, spievať a vystupovať po celom Slovensku!
        </p>

        <div className="bg-[#0c0a09] border border-[#78350f] p-3 rounded-lg mb-4">
          <span className="text-[10px] uppercase text-[#a8a29e] block font-mono">Konečné Folklórne Skóre</span>
          <span className="text-2xl font-bold text-[#fbbf24] font-mono">{score}</span>
        </div>

        <button
          id="btn-victory-restart"
          onClick={onRestart}
          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold uppercase tracking-wider rounded-lg font-serif text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Zatancovať Oslavný Tanec Odznova
        </button>
      </div>
    </div>
  );
};
