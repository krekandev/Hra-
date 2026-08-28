import React from 'react';
import { Hero, RelicItem } from '../types';
import { Volume2, VolumeX, HelpCircle, Heart } from 'lucide-react';

interface ChampionBarProps {
  heroes: Hero[];
  relics: RelicItem[];
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleHelp: () => void;
}

export const ChampionBar: React.FC<ChampionBarProps> = ({
  heroes,
  relics,
  isMuted,
  onToggleMute,
  onToggleHelp
}) => {
  const jakub = heroes.find(h => h.id === 'jakub');
  const simi = heroes.find(h => h.id === 'simi');
  const filip = heroes.find(h => h.id === 'filip');

  return (
    <div id="champion-hud-bar" className="fixed bottom-2 left-0 right-0 z-30 flex flex-col items-center pointer-events-none px-2 sm:px-3 select-none">
      {/* Active Folklore Relics strip */}
      {relics.length > 0 && (
        <div id="relics-strip" className="mb-1.5 flex items-center gap-2 bg-[#1c1917]/95 backdrop-blur-md px-3 py-0.5 rounded border-2 border-[#78350f] shadow-2xl pointer-events-auto">
          <span className="text-[8px] uppercase tracking-widest font-bold text-[#fbbf24] mr-1">POKLADY:</span>
          {relics.map(r => (
            <div
              key={r.id}
              title={`${r.name}: ${r.description}`}
              className="flex items-center gap-1.5 bg-[#0c0a09] border border-[#d97706]/60 rounded px-1.5 py-0.5 text-xs text-[#fef08a] hover:border-[#fbbf24] transition-colors cursor-help"
            >
              <span>{r.icon}</span>
              <span className="text-[9px] font-bold text-[#fef08a] font-serif">{r.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Champion Deck */}
      <div id="hud-main-deck" className="bg-[#1c1917]/95 backdrop-blur-md border-2 border-[#78350f] p-1.5 sm:p-2 shadow-2xl shadow-black flex items-center gap-2 sm:gap-3 pointer-events-auto text-[#fef08a] max-w-full overflow-x-auto rounded-lg">
        {/* Jakub */}
        {jakub && (
          <div id="hero-card-jakub" className="flex items-center gap-2 bg-[#0c0a09] border border-[#78350f] p-1 sm:p-1.5 min-w-[125px] sm:min-w-[155px] shadow-md rounded-lg">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-[#fbbf24] bg-blue-950 shrink-0">
              <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/jakub.webp`} alt="Jakub" className="w-full h-full object-cover pixelated" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#fbbf24] font-bold font-serif">Jakub</span>
                <span className="text-[7px] sm:text-[8px] text-blue-400 font-mono uppercase bg-blue-950/80 px-1 border border-blue-800/60 rounded">VODCA [I]</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-black mt-1 border border-[#444] relative overflow-hidden rounded-sm">
                <div
                  className="h-full bg-red-600 shadow-[0_0_8px_red] transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, (jakub.hp / jakub.maxHp) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[7px] sm:text-[8px] text-[#d6d3d1] mt-0.5 font-mono">
                <span className="flex items-center gap-0.5"><Heart className="w-2 h-2 text-red-500" />{Math.round(jakub.hp)}</span>
                <span>{jakub.maxHp} HP</span>
              </div>
            </div>
          </div>
        )}

        {/* Šimi */}
        {simi && (
          <div id="hero-card-simi" className="flex items-center gap-2 bg-[#0c0a09] border border-[#78350f]/80 p-1 sm:p-1.5 min-w-[115px] sm:min-w-[140px] shadow-sm rounded-lg">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-[#c084fc] bg-purple-950 shrink-0">
              <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/simi.webp`} alt="Šimi" className="w-full h-full object-cover pixelated" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-[#c084fc] font-bold font-serif">Šimi</span>
                <span className="text-[7px] sm:text-[8px] text-purple-300 font-mono uppercase bg-purple-950/80 px-1 border border-purple-800/60 rounded">HELIGÓNKA [O]</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-black mt-1 border border-[#444] relative overflow-hidden rounded-sm">
                <div
                  className="h-full bg-red-600 shadow-[0_0_5px_red] transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, (simi.hp / simi.maxHp) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[7px] sm:text-[8px] text-[#d6d3d1] mt-0.5 font-mono">
                <span className="flex items-center gap-0.5"><Heart className="w-2 h-2 text-red-500" />{Math.round(simi.hp)}</span>
                <span>{simi.maxHp} HP</span>
              </div>
            </div>
          </div>
        )}

        {/* Filip */}
        {filip && (
          <div id="hero-card-filip" className="flex items-center gap-2 bg-[#0c0a09] border border-[#78350f]/80 p-1 sm:p-1.5 min-w-[115px] sm:min-w-[140px] shadow-sm rounded-lg">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-[#fbbf24] bg-amber-950 shrink-0">
              <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/filip.webp`} alt="Filip" className="w-full h-full object-cover pixelated" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-[#fbbf24] font-bold font-serif">Filip</span>
                <span className="text-[7px] sm:text-[8px] text-amber-300 font-mono uppercase bg-amber-950/80 px-1 border border-amber-800/60 rounded">DUPÁK [P]</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-black mt-1 border border-[#444] relative overflow-hidden rounded-sm">
                <div
                  className="h-full bg-red-600 shadow-[0_0_5px_red] transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, (filip.hp / filip.maxHp) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[7px] sm:text-[8px] text-[#d6d3d1] mt-0.5 font-mono">
                <span className="flex items-center gap-0.5"><Heart className="w-2 h-2 text-red-500" />{Math.round(filip.hp)}</span>
                <span>{filip.maxHp} HP</span>
              </div>
            </div>
          </div>
        )}

        {/* Sound & Guide buttons */}
        <div className="flex flex-col gap-1 pl-1 border-l border-[#78350f]/60">
          <button
            id="btn-toggle-mute"
            onClick={onToggleMute}
            className="w-6 h-6 sm:w-7 sm:h-7 bg-[#292524] border border-[#78350f] hover:border-[#fbbf24] flex items-center justify-center text-[#fef08a] hover:text-white transition-colors shadow rounded"
            title={isMuted ? 'Zapnúť zvuk' : 'Stlmiť zvuk'}
          >
            {isMuted ? <VolumeX className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-400" /> : <Volume2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#fbbf24]" />}
          </button>
          <button
            id="btn-toggle-help"
            onClick={onToggleHelp}
            className="w-6 h-6 sm:w-7 sm:h-7 bg-[#292524] border border-[#78350f] hover:border-[#fbbf24] flex items-center justify-center text-[#fef08a] hover:text-white transition-colors shadow rounded"
            title="Ovládanie a Príručka"
          >
            <HelpCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#fbbf24]" />
          </button>
        </div>
      </div>
    </div>
  );
};
