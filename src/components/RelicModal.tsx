import React from 'react';
import { RelicItem } from '../types';
import { Sparkles } from 'lucide-react';

interface RelicModalProps {
  relics: RelicItem[];
  onSelect: (relic: RelicItem) => void;
}

export const RelicModal: React.FC<RelicModalProps> = ({ relics, onSelect }) => {
  return (
    <div
      id="relic-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none"
    >
      <div className="bg-[#1c1917] border-2 border-[#78350f] rounded-xl max-w-lg w-full p-4 text-[#fef08a] shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-3 border-b border-[#78350f] pb-2">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/80 border border-[#fbbf24] text-[10px] text-[#fbbf24] font-serif font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-[#fbbf24]" />
            FESTIVAL DOBYTÝ & KĽÚČ ZÍSKANÝ!
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#fbbf24] font-serif uppercase tracking-wide">
            Vyber si Folklórny Poklad
          </h2>
          <p className="text-[10px] sm:text-xs text-[#d6d3d1]">
            Vyber jeden vzácny dar na posilnenie svojej družiny:
          </p>
        </div>

        {/* Relic Cards */}
        <div className="space-y-2.5 mb-3">
          {relics.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r)}
              className="w-full text-left p-3 rounded-lg bg-[#0c0a09] border-2 border-[#78350f] hover:border-[#fbbf24] hover:bg-[#292524] transition-all flex items-center gap-3 group shadow-md"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-amber-950/80 border border-[#fbbf24] flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                {r.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-[#fbbf24] font-serif truncate">
                    {r.name}
                  </h3>
                  <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-600/80 text-amber-200 shrink-0">
                    {r.rarity === 'legendary' ? 'Legendárny' : r.rarity === 'epic' ? 'Epický' : r.rarity === 'rare' ? 'Vzácny' : 'Obyčajný'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#e7e5e4] leading-snug">
                  {r.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
