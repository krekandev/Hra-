import React, { useRef, useState } from 'react';
import { Play, SkipForward, Shield, Sparkles, Axe } from 'lucide-react';
import { HeroId } from '../types';

import { sound } from '../game/sound';

interface IntroCutsceneModalProps {
  onComplete: (selectedLeadHero: HeroId) => void;
}

export const IntroCutsceneModal: React.FC<IntroCutsceneModalProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<'start' | 'video' | 'select_hero'>('start');
  const [selectedHero, setSelectedHero] = useState<HeroId | null>(null);

  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

  const handleStart = () => {
    setPhase('video');
    // Aktivácia fullscreenu
    const el = containerRef.current || videoRef.current;
    if (el) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    }

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 50);
  };

  const handleEndOrSkipVideo = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setPhase('select_hero');
    // Hudba začína hrať hneď pri výbere postavy
    sound.startDynamicMusic('explore');
  };

  const handleConfirmHero = () => {
    if (selectedHero) {
      onComplete(selectedHero);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ zIndex: 99999, backgroundColor: '#090705' }}
      className="fixed inset-0 flex items-center justify-center select-none"
    >
      {/* 1. Úvodná obrazovka pred videom - iba HRAT HRU s dievcata.webp pozadím */}
      {phase === 'start' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Pozadie dievcata.webp */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${baseUrl}/dievcata.webp)`,
            }}
          />
          {/* Tmavý gradientový preliv pre skvelú čitateľnosť */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/80 backdrop-blur-[2px]" />

          <div className="relative flex flex-col items-center justify-center gap-6 p-6 text-center z-20 max-w-2xl">
            <div className="w-20 h-20 rounded-full bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse">
              🪈
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-serif font-black uppercase tracking-widest text-[#fbbf24] drop-shadow-[0_0_35px_rgba(251,191,36,0.8)]">
              Cesta za Dievčatami
            </h1>

            <p className="text-stone-200 text-sm sm:text-base font-medium max-w-lg drop-shadow-md">
              Osloboď všetky tri festivaly v Detve, Terchovej a Myjave, získaj kľúče a zachráň dievčatá zo Severného Hradu!
            </p>

            <button
              onClick={handleStart}
              className="group relative flex items-center gap-4 px-12 py-5 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-serif font-black text-2xl sm:text-3xl uppercase tracking-widest hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(245,158,11,0.9)] transition-all cursor-pointer border-2 border-amber-300 mt-2"
            >
              <Play className="w-8 h-8 fill-current" />
              <span>HRAŤ HRU</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Fullscreen Video */}
      {phase === 'video' && (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={`${baseUrl}/intro_cutscene.mp4`}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
            onEnded={handleEndOrSkipVideo}
            onClick={() => {
              if (videoRef.current) {
                if (videoRef.current.paused) videoRef.current.play();
                else videoRef.current.pause();
              }
            }}
          />

          <button
            onClick={handleEndOrSkipVideo}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/90 border border-white/20 hover:border-amber-400 text-white/80 hover:text-amber-300 text-xs sm:text-sm font-serif uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer z-20"
          >
            <span>Preskočiť</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Výber Hlavného Hrdinu (Jakub, Šimi, Filip) s vylepšenou schopnosťou - Plne responzívne pre mobil */}
      {phase === 'select_hero' && (
        <div className="flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl w-full h-full max-h-screen overflow-y-auto z-10 py-4">
          <div className="text-center mb-2 sm:mb-4">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-400 font-mono font-bold bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-800">
              VOĽBA VODCU DRUŽINY
            </span>
            <h2 className="text-xl sm:text-3xl font-serif font-black text-amber-300 mt-1">
              Vyber si svojho Hrdinu
            </h2>
            <p className="text-stone-300 text-[11px] sm:text-xs max-w-md mx-auto">
              Zvolený hrdina získa špeciálnu vylepšenú schopnosť a zvýšenú silu!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 w-full mb-3 sm:mb-6 max-w-3xl">
            {/* 1. JAKUB */}
            <div
              onClick={() => setSelectedHero('jakub')}
              className={`flex sm:flex-col items-center gap-3 sm:gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left sm:text-center relative overflow-hidden ${
                selectedHero === 'jakub'
                  ? 'bg-blue-950/90 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)] scale-[1.02] sm:scale-105'
                  : 'bg-stone-900/80 border-stone-800 hover:border-blue-500/60 opacity-85'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 border-blue-400 bg-stone-950">
                <img src={`${baseUrl}/jakub.webp`} alt="Jakub" loading="eager" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 w-full">
                <div className="flex sm:flex-col items-baseline sm:items-center justify-between sm:justify-center gap-1 mb-1">
                  <h3 className="text-base sm:text-lg font-serif font-black text-blue-300">JAKUB</h3>
                  <span className="text-[9px] sm:text-[10px] text-amber-300 uppercase tracking-wider font-bold">Sekáč</span>
                </div>
                <div className="bg-stone-950/80 p-1.5 sm:p-2 rounded-lg border border-blue-800/40 text-left w-full">
                  <div className="flex items-center gap-1 text-amber-300 font-bold text-[10px] sm:text-xs mb-0.5">
                    <Axe className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>Valaška [I]</span>
                  </div>
                  <p className="text-[10px] text-stone-300 leading-tight">
                    +50% dosah seku, +40% DMG, -25% cooldown.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. ŠIMI */}
            <div
              onClick={() => setSelectedHero('simi')}
              className={`flex sm:flex-col items-center gap-3 sm:gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left sm:text-center relative overflow-hidden ${
                selectedHero === 'simi'
                  ? 'bg-purple-950/90 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)] scale-[1.02] sm:scale-105'
                  : 'bg-stone-900/80 border-stone-800 hover:border-purple-500/60 opacity-85'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 border-purple-400 bg-stone-950">
                <img src={`${baseUrl}/simi.webp`} alt="Šimi" loading="eager" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 w-full">
                <div className="flex sm:flex-col items-baseline sm:items-center justify-between sm:justify-center gap-1 mb-1">
                  <h3 className="text-base sm:text-lg font-serif font-black text-purple-300">ŠIMI</h3>
                  <span className="text-[9px] sm:text-[10px] text-amber-300 uppercase tracking-wider font-bold">Heligonkár</span>
                </div>
                <div className="bg-stone-950/80 p-1.5 sm:p-2 rounded-lg border border-purple-800/40 text-left w-full">
                  <div className="flex items-center gap-1 text-amber-300 font-bold text-[10px] sm:text-xs mb-0.5">
                    <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                    <span>Akord [O]</span>
                  </div>
                  <p className="text-[10px] text-stone-300 leading-tight">
                    Vystreľuje až 3 magické noty s plošným výbuchom!
                  </p>
                </div>
              </div>
            </div>

            {/* 3. FILIP */}
            <div
              onClick={() => setSelectedHero('filip')}
              className={`flex sm:flex-col items-center gap-3 sm:gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left sm:text-center relative overflow-hidden ${
                selectedHero === 'filip'
                  ? 'bg-amber-950/90 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)] scale-[1.02] sm:scale-105'
                  : 'bg-stone-900/80 border-stone-800 hover:border-amber-500/60 opacity-85'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 border-amber-400 bg-stone-950">
                <img src={`${baseUrl}/filip.webp`} alt="Filip" loading="eager" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 w-full">
                <div className="flex sm:flex-col items-baseline sm:items-center justify-between sm:justify-center gap-1 mb-1">
                  <h3 className="text-base sm:text-lg font-serif font-black text-amber-300">FILIP</h3>
                  <span className="text-[9px] sm:text-[10px] text-amber-300 uppercase tracking-wider font-bold">Titan</span>
                </div>
                <div className="bg-stone-950/80 p-1.5 sm:p-2 rounded-lg border border-amber-800/40 text-left w-full">
                  <div className="flex items-center gap-1 text-amber-300 font-bold text-[10px] sm:text-xs mb-0.5">
                    <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Dupák [P]</span>
                  </div>
                  <p className="text-[10px] text-stone-300 leading-tight">
                    Veľký polomer omráčenia a +150 bonusové Max HP.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmHero}
            disabled={!selectedHero}
            className={`w-full max-w-md flex items-center justify-center gap-2 py-3 sm:py-4 px-6 rounded-2xl font-serif font-black text-base sm:text-lg uppercase tracking-widest transition-all border shrink-0 ${
              selectedHero
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.6)] cursor-pointer border-amber-300'
                : 'bg-stone-800 text-stone-500 border-stone-700 cursor-not-allowed opacity-60'
            }`}
          >
            <span>{selectedHero ? `VSTÚPIŤ DO HRY (${selectedHero.toUpperCase()})` : 'VYBER SI HRDINU'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
