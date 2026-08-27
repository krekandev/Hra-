import React from 'react';
import { StoryChapter } from '../types';
import { Award, Compass } from 'lucide-react';

interface QuestBannerProps {
  chapter: StoryChapter;
  currentKills: number;
  score: number;
  totalKills: number;
  keysCollected?: number;
}

export const QuestBanner: React.FC<QuestBannerProps> = ({
  chapter,
  currentKills,
  score,
  totalKills,
  keysCollected = 0
}) => {
  const reqKills = chapter.requiredKills || 8;
  const progressPercent = Math.min(100, (currentKills / reqKills) * 100);

  return (
    <div
      id="quest-banner-hud"
      className="fixed top-2 left-2 z-30 pointer-events-none max-w-[calc(100vw-110px)] sm:max-w-md select-none"
    >
      <div className="bg-[#1c1917]/95 backdrop-blur-md border-2 border-[#78350f] p-2 sm:p-3 shadow-2xl shadow-black rounded-lg text-[#fef08a] pointer-events-auto">
        {/* Header with Festival Name */}
        <div className="flex items-center justify-between gap-2 border-b border-[#78350f]/80 pb-1 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fbbf24] shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#fbbf24] font-serif truncate">
              {chapter.title}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Keys Count */}
            <div className="flex items-center gap-1 bg-[#292524] px-1.5 py-0.5 rounded border border-[#d97706]/60 text-[8px] sm:text-[9px] font-mono text-[#fbbf24]">
              <span>🗝️</span>
              <span className="font-bold">{chapter.id > 3 ? 3 : Math.max(0, chapter.id - 1)}/3</span>
            </div>
            {/* Score */}
            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono text-[#ca8a04]">
              <Award className="w-3 h-3 text-[#fbbf24]" />
              <span>{score}</span>
            </div>
          </div>
        </div>

        {/* Objective Description */}
        <p className="text-[9px] sm:text-[10px] text-[#e7e5e4] leading-tight mb-1.5 font-sans">
          {chapter.objective}
        </p>

        {/* Progress Bar */}
        {chapter.id <= 3 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 sm:h-2 bg-black border border-[#57534e] rounded-sm overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 shadow-[0_0_8px_gold] transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-[#fbbf24] whitespace-nowrap">
              {currentKills} / {reqKills} Zbojníkov
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
