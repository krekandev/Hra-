import React from 'react';
import { CollectibleItem } from '../types';
import { Trophy, ArrowLeft, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface HomeModalProps {
  collectibles: CollectibleItem[];
  dukaty: number;
  onClose: () => void;
}

export const HomeModal: React.FC<HomeModalProps> = ({
  collectibles,
  dukaty,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#1c1917] via-[#0c0a09] to-[#1c1917] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-800/40 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              🏡
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-400">
                Náš Rodný Dom & Sieň Trofejí
              </h2>
              <p className="text-xs text-stone-400">
                Trvalá úschovňa zozbieraných relikvií a folklórnych pokladov (uložené v pamäti)
              </p>
            </div>
          </div>

          {/* Dukáty mešec */}
          <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-500/40 px-3.5 py-1.5 rounded-full">
            <span className="text-base">🪙</span>
            <span className="font-mono font-bold text-amber-300 text-sm">{dukaty} Dukátov</span>
          </div>
        </div>

        {/* Collectibles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1 mb-4">
          {collectibles.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all relative flex gap-3 items-start ${
                item.unlocked
                  ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-stone-900/50 border-stone-800 opacity-60'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-stone-950 border border-stone-700 flex items-center justify-center text-2xl shrink-0">
                {item.unlocked ? item.icon : '🔒'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className={`text-sm font-serif font-bold truncate ${item.unlocked ? 'text-amber-300' : 'text-stone-400'}`}>
                    {item.name}
                  </h4>
                  {item.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-stone-500 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-stone-300 leading-tight mb-1.5">
                  {item.unlocked ? item.description : 'Zatiaľ nenájdené. Poraz bossov v regióne alebo splň výzvy!'}
                </p>

                {item.bonusText && item.unlocked && (
                  <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ⚡ {item.bonusText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-amber-800/40">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Späť do Sveta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
