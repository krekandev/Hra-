import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Trophy, Sparkles, SkipForward, Play } from 'lucide-react';
import { sound } from '../game/sound';

interface VictoryModalProps {
  score: number;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ score, onRestart }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [phase, setPhase] = useState<'video' | 'summary'>('video');
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

  useEffect(() => {
    // Stop ambient game music during cutscene
    sound.stopMusic();

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleEndVideo = () => {
    setPhase('summary');
  };

  return (
    <div
      id="victory-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none"
    >
      {/* 1. Finálna Cutscéna - Dievčatá na pódiu sa klaňajú */}
      {phase === 'video' && (
        <div className="w-full h-full flex items-center justify-center bg-black relative">
          <video
            ref={videoRef}
            src={`${baseUrl}/Girls_on_stage_bowing_202608280718.mp4`}
            className="w-full h-full object-contain cursor-pointer"
            autoPlay
            playsInline
            onEnded={handleEndVideo}
            onClick={() => {
              if (videoRef.current) {
                if (videoRef.current.paused) videoRef.current.play();
                else videoRef.current.pause();
              }
            }}
          />

          <button
            onClick={handleEndVideo}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-black/70 hover:bg-black/90 border border-amber-400 text-amber-300 text-xs sm:text-sm font-serif uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer z-20 shadow-lg"
          >
            <span>Pokračovať na Úvod</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Záverečné zhrnutie a návrat na úvodnú stránku */}
      {phase === 'summary' && (
        <div className="bg-[#1c1917] border-2 border-[#fbbf24] rounded-3xl max-w-md w-full p-6 text-center text-[#fef08a] shadow-[0_0_60px_rgba(251,191,36,0.4)] relative max-h-[92vh] overflow-y-auto m-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-950/90 border-2 border-[#fbbf24] flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(251,191,36,0.6)]">
            🎉
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs uppercase font-mono font-bold tracking-widest text-[#fbbf24] bg-amber-950/80 px-3 py-1 rounded-full border border-[#fbbf24] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
            VEĽKOLEPÉ VÍŤAZSTVO
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#fbbf24] font-serif uppercase tracking-wider mb-2">
            DIEVČATÁ SÚ ZACHRÁNENÉ!
          </h2>

          <p className="text-xs text-stone-300 mb-4 leading-relaxed font-sans">
            Sláva Jakubovi, Šimimu a Filipovi! Všetky festivaly sú oslobodené, zbojníci porazení a folklórny súbor opäť tancuje a spieva na plných amfiteátroch!
          </p>

          <div className="bg-[#0c0a09] border border-[#78350f] p-3.5 rounded-2xl mb-5 shadow-inner">
            <span className="text-[11px] uppercase text-stone-400 block font-mono">Konečné Folklórne Skóre</span>
            <span className="text-3xl font-black text-[#fbbf24] font-mono">{score}</span>
          </div>

          <button
            id="btn-victory-restart"
            onClick={onRestart}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black uppercase tracking-wider rounded-2xl font-serif text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(245,158,11,0.6)] cursor-pointer hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            NÁVRAT NA ÚVODNÚ STRÁNKU
          </button>
        </div>
      )}
    </div>
  );
};
