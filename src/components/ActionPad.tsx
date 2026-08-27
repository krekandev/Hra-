import React from 'react';
import { SkillCooldown } from '../types';
import { Sparkles, Shield } from 'lucide-react';

interface ActionPadProps {
  cooldowns: SkillCooldown;
  onCastQ: () => void;
  onCastW: () => void;
  onCastE: () => void;
}

export const ActionPad: React.FC<ActionPadProps> = ({
  cooldowns,
  onCastQ,
  onCastW,
  onCastE
}) => {
  const triggerAttack = (e: React.PointerEvent | React.TouchEvent, action: () => void, cooldown: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (cooldown <= 0) {
      action();
    }
  };

  return (
    <div
      id="mobile-action-pad-wrapper"
      className="fixed bottom-24 right-4 sm:bottom-28 sm:right-8 z-40 select-none touch-none pointer-events-auto"
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <div
        id="virtual-action-pad"
        className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center touch-none"
        style={{ touchAction: 'none' }}
      >
        {/* Decorative wooden ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#78350f]/60 bg-[#1c1917]/40 backdrop-blur-xs pointer-events-none" />

        {/* --- Button O: Šimi Heligónka (Top-Left) --- */}
        <div className="absolute top-0 left-0">
          <div
            id="mobile-btn-o"
            role="button"
            tabIndex={-1}
            onPointerDown={(e) => triggerAttack(e, onCastW, cooldowns.w.current)}
            onTouchStart={(e) => triggerAttack(e, onCastW, cooldowns.w.current)}
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1c1917]/95 border-2 border-[#a855f7] hover:border-purple-300 active:scale-90 flex flex-col items-center justify-center shadow-lg relative transition-transform overflow-hidden cursor-pointer touch-none ${
              cooldowns.w.current > 0 ? 'opacity-60 cursor-not-allowed' : 'active:bg-purple-950/80'
            }`}
            title="O / W: Šimi Heligónka"
          >
            <span className="text-[9px] font-mono text-[#c084fc] font-bold absolute top-1 left-2">O</span>
            <span className="text-base pointer-events-none mt-1">🪗</span>
            <span className="text-[6.5px] font-serif uppercase tracking-wider text-[#fef08a] pointer-events-none font-bold">TÓN</span>

            {/* Cooldown */}
            {cooldowns.w.current > 0 && (
              <div className="absolute inset-0 bg-black/85 flex items-center justify-center pointer-events-none">
                <span className="font-mono text-xs text-purple-300 font-bold">
                  {cooldowns.w.current.toFixed(1)}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --- Button P: Filip Zbojnícky Dupák (Top-Right) --- */}
        <div className="absolute top-0 right-0">
          <div
            id="mobile-btn-p"
            role="button"
            tabIndex={-1}
            onPointerDown={(e) => triggerAttack(e, onCastE, cooldowns.e.current)}
            onTouchStart={(e) => triggerAttack(e, onCastE, cooldowns.e.current)}
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1c1917]/95 border-2 border-[#d97706] hover:border-amber-300 active:scale-90 flex flex-col items-center justify-center shadow-lg relative transition-transform overflow-hidden cursor-pointer touch-none ${
              cooldowns.e.current > 0 ? 'opacity-60 cursor-not-allowed' : 'active:bg-amber-950/80'
            }`}
            title="P / E: Filip Zbojnícky Dupák"
          >
            <span className="text-[9px] font-mono text-[#fbbf24] font-bold absolute top-1 right-2">P</span>
            <span className="text-base pointer-events-none mt-1">💥</span>
            <span className="text-[6.5px] font-serif uppercase tracking-wider text-[#fef08a] pointer-events-none font-bold">DUPÁK</span>

            {/* Cooldown */}
            {cooldowns.e.current > 0 && (
              <div className="absolute inset-0 bg-black/85 flex items-center justify-center pointer-events-none">
                <span className="font-mono text-xs text-amber-300 font-bold">
                  {cooldowns.e.current.toFixed(1)}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --- Button I: Jakub Zbojnícka Valaška (Bottom-Center Primary) --- */}
        <div className="absolute bottom-0 right-1.5 sm:right-2">
          <div
            id="mobile-btn-i"
            role="button"
            tabIndex={-1}
            onPointerDown={(e) => triggerAttack(e, onCastQ, cooldowns.q.current)}
            onTouchStart={(e) => triggerAttack(e, onCastQ, cooldowns.q.current)}
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#1c1917]/95 border-2 border-[#fbbf24] hover:border-amber-200 active:scale-90 flex flex-col items-center justify-center shadow-2xl relative transition-transform overflow-hidden cursor-pointer touch-none shadow-[0_0_15px_rgba(251,191,36,0.3)] ${
              cooldowns.q.current > 0 ? 'opacity-60 cursor-not-allowed' : 'active:bg-amber-950/80'
            }`}
            title="I / Q: Jakub Sek Valaškou"
          >
            <span className="text-[10px] font-mono text-[#fbbf24] font-bold absolute top-1 left-3">I</span>
            <span className="text-xl pointer-events-none mt-1">🪓</span>
            <span className="text-[8px] font-serif font-bold uppercase tracking-wider text-[#fbbf24] pointer-events-none">VALAŠKA</span>

            {/* Cooldown */}
            {cooldowns.q.current > 0 && (
              <div className="absolute inset-0 bg-black/85 flex items-center justify-center pointer-events-none">
                <span className="font-mono text-xs text-amber-300 font-bold">
                  {cooldowns.q.current.toFixed(1)}s
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
