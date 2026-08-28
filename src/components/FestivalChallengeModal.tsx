import React, { useState, useEffect, useRef } from 'react';
import { FestivalChallenge } from '../types';
import { sound } from '../game/sound';

interface FestivalChallengeModalProps {
  challenge: FestivalChallenge;
  onShotConsumed: (goalIndex: number) => void;
  onChallengeComplete: () => void;
}

export const FestivalChallengeModal: React.FC<FestivalChallengeModalProps> = ({
  challenge,
  onShotConsumed,
  onChallengeComplete,
}) => {
  const [completedGoals, setCompletedGoals] = useState<number>(0);
  const [clickCount, setClickCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);

  // --- CIRCULAR WHIP CANVAS STATE (Terchová) ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef<number>(0); // in radians [0, 2*PI)
  const targetSectorRef = useRef<{ startRad: number; sweepRad: number }>({
    startRad: 1.0,
    sweepRad: 1.2,
  });
  const speedRef = useRef<number>(3.8);
  const animRef = useRef<number | null>(null);

  // --- ŠIRÁKOVÝ DUEL STATE (Myjava - Mirnyx Sova) ---
  // 'idle' | 'waiting' | 'snatched' | 'success' | 'failed'
  const [duelState, setDuelState] = useState<'idle' | 'waiting' | 'snatched' | 'success' | 'failed'>('idle');
  const [duelTimeLeft, setDuelTimeLeft] = useState<number>(100); // percentage 100 -> 0
  const duelTimerRef = useRef<any>(null);
  const duelCountdownRef = useRef<any>(null);
  const maxDuelTimeRef = useRef<number>(1400); // ms allowed to react

  const totalGoals = challenge.totalGoals;
  const clicksPerGoal = challenge.clicksPerGoal || 10;

  // --- WHIP TIMING LOGIC ---
  const randomizeWhipSector = () => {
    const sweepRad = 0.75 + Math.random() * 0.55;
    const startRad = Math.random() * Math.PI * 2;
    targetSectorRef.current = { startRad, sweepRad };
    speedRef.current = 3.4 + Math.random() * 1.6;
  };

  useEffect(() => {
    if (challenge.type !== 'whip_timing' || isCompleted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      angleRef.current = (angleRef.current + speedRef.current * delta) % (Math.PI * 2);

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const r = 74;

      ctx.clearRect(0, 0, width, height);

      // Dark outer ring
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#292524';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Danger arc
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'rgba(127, 29, 29, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Target green sector
      const { startRad, sweepRad } = targetSectorRef.current;
      ctx.lineWidth = 16;
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r, startRad, startRad + sweepRad, false);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Center hub
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#b45309';
      ctx.stroke();

      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪢', cx, cy - 4);

      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`PLESK!`, cx, cy + 18);

      // Rotating whip needle
      const curAngle = angleRef.current;
      const tipX = cx + Math.cos(curAngle) * (r + 14);
      const tipY = cy + Math.sin(curAngle) * (r + 14);

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fef08a';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animRef.current = requestAnimationFrame(renderLoop);
    };

    animRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [challenge.type, isCompleted]);

  // --- ŠIRÁKOVÝ DUEL LOGIC (MYJAVA) ---
  const startDuelRound = () => {
    if (isCompleted) return;
    setDuelState('waiting');
    setDuelTimeLeft(100);
    setFeedback({ text: 'Sleduj Mirnyxa... čakaj na jeho pohyb!', color: '#fbbf24' });

    // Reaction time shrinks with each round (from 1500ms down to 750ms)
    maxDuelTimeRef.current = Math.max(750, 1500 - completedGoals * 80);

    // Random wait before Mirnyx snatches your hat (1.1s to 2.6s)
    const delay = 1100 + Math.random() * 1500;
    duelTimerRef.current = setTimeout(() => {
      sound.playSlash();
      setDuelState('snatched');
      setFeedback({ text: '⚡ MIRNYX TI ZOBRAL KLOBÚK! RÝCHLO KLIKNI NA JEHO KLOBÚK!', color: '#ef4444' });

      // Start countdown
      const startTime = performance.now();
      const totalTime = maxDuelTimeRef.current;

      duelCountdownRef.current = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const remainingPercent = Math.max(0, 100 - (elapsed / totalTime) * 100);
        setDuelTimeLeft(remainingPercent);

        if (elapsed >= totalTime) {
          // Time expired! Mirnyx escaped with your hat
          clearInterval(duelCountdownRef.current);
          sound.playHeroHurt();
          setDuelState('failed');
          setFeedback({ text: '💨 Neskoro! Mirnyx bol rýchlejší. Skús to znova!', color: '#f87171' });

          // Restart round after 1.2s
          setTimeout(() => {
            startDuelRound();
          }, 1200);
        }
      }, 16);
    }, delay);
  };

  useEffect(() => {
    if (challenge.type === 'hat_duel' && !isCompleted) {
      startDuelRound();
    }
    return () => {
      if (duelTimerRef.current) clearTimeout(duelTimerRef.current);
      if (duelCountdownRef.current) clearInterval(duelCountdownRef.current);
    };
  }, [challenge.type]);

  const handleHatClick = () => {
    if (isCompleted) return;

    if (duelState === 'waiting') {
      // False start! Clicked too early
      sound.playHeroHurt();
      setFeedback({ text: '⚠️ Priskoro! Počkaj, kým ti Mirnyx najprv siahne na klobúk!', color: '#f87171' });
      return;
    }

    if (duelState === 'snatched') {
      // SUCCESSFUL HAT STEAL!
      if (duelCountdownRef.current) clearInterval(duelCountdownRef.current);
      if (duelTimerRef.current) clearTimeout(duelTimerRef.current);

      sound.playPickup();
      sound.playLevelUp();
      setDuelState('success');
      const nextGoal = completedGoals + 1;
      setCompletedGoals(nextGoal);
      onShotConsumed(nextGoal);
      setFeedback({ text: `🤠 UCHMATOL SI MIRNYXOV ŠIRÁK! (#${nextGoal}) +${challenge.healPerGoal} HP`, color: '#34d399' });

      if (nextGoal >= totalGoals) {
        setIsCompleted(true);
      } else {
        // Start next round after short celebration
        setTimeout(() => {
          startDuelRound();
        }, 1100);
      }
    }
  };

  // --- HANDLER: DETVA DRINKING ---
  const handleDrink = () => {
    if (isCompleted) return;

    sound.playDrinkClick();
    const next = clickCount + 1;
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 90);

    if (next >= clicksPerGoal) {
      sound.playShotEx();
      const nextGoal = completedGoals + 1;
      setCompletedGoals(nextGoal);
      setClickCount(0);
      onShotConsumed(nextGoal);
      setFeedback({ text: `✓ Shot #${nextGoal} vypitý! (+${challenge.healPerGoal} HP)`, color: '#34d399' });

      if (nextGoal >= totalGoals) {
        setIsCompleted(true);
        sound.playLevelUp();
      }
    } else {
      setClickCount(next);
    }
  };

  // --- HANDLER: TERCHOVÁ WHIP CRACK ---
  const handleWhip = () => {
    if (isCompleted) return;

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 120);

    const cur = angleRef.current;
    const { startRad, sweepRad } = targetSectorRef.current;
    const endRad = startRad + sweepRad;

    let hit = false;
    if (endRad <= Math.PI * 2) {
      hit = cur >= startRad && cur <= endRad;
    } else {
      hit = cur >= startRad || cur <= (endRad % (Math.PI * 2));
    }

    if (hit) {
      sound.playSlash();
      const nextGoal = completedGoals + 1;
      setCompletedGoals(nextGoal);
      onShotConsumed(nextGoal);
      setFeedback({ text: `💥 PLESK #${nextGoal}! Presný zásah!`, color: '#34d399' });

      if (nextGoal >= totalGoals) {
        setIsCompleted(true);
        sound.playLevelUp();
      } else {
        randomizeWhipSector();
      }
    } else {
      sound.playHeroHurt();
      setFeedback({ text: '💨 Vedľa! Mier na zelené pole!', color: '#f87171' });
    }
  };

  // Spacebar trigger support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (challenge.type === 'drinking_shots') handleDrink();
        else if (challenge.type === 'whip_timing') handleWhip();
        else if (challenge.type === 'hat_duel') handleHatClick();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-[#1c1917] border-2 border-[#b45309] rounded-3xl shadow-2xl shadow-amber-950/90 overflow-hidden text-stone-100 flex flex-col items-center p-5 text-center">
        {/* Top folklore ornament */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />

        {/* ===================================================================== */}
        {/* 1. DETVA: EMI SOBI (Ryšavá, veľká fotka, čisté ikony bez zbytočných textov) */}
        {/* ===================================================================== */}
        {challenge.type === 'drinking_shots' && (
          <div className="flex flex-col items-center w-full">
            {/* Big Character Portrait */}
            <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.4)] my-1 bg-stone-900">
              <img
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/${(challenge.portraitUrl || 'emi_sobi.jpg').replace(/^\//, '')}`}
                alt="Emi Sobi"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Character Quote */}
            <div className="bg-amber-950/80 border border-amber-800/60 rounded-2xl p-2.5 my-2 w-full">
              <div className="text-amber-300 font-serif font-bold text-sm mb-0.5">
                Emi Sobi
              </div>
              <p className="text-xs text-stone-200 italic leading-snug">
                „Páni bratia! Pred bačom vypite týchto 10 shotov mojej domácej pálenky od Emi Sobi!“
              </p>
            </div>

            {/* 10 Clean Shot Glasses (Zelená fajka ✓ / Čistý pohárik 🥃) */}
            <div className="grid grid-cols-5 gap-2 w-full max-w-xs my-2">
              {Array.from({ length: totalGoals }).map((_, i) => {
                const isDone = i < completedGoals;
                const isCurrent = i === completedGoals && !isCompleted;
                const shotPercent = Math.round((clickCount / clicksPerGoal) * 100);
                return (
                  <div
                    key={i}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-150 ${
                      isDone
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                        : isCurrent
                        ? 'bg-amber-900/70 border-amber-400 text-amber-200 scale-105 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                        : 'bg-stone-900/80 border-stone-800 text-stone-600 opacity-60'
                    }`}
                  >
                    {isDone ? (
                      <span className="text-emerald-400 text-base font-black leading-none">✓</span>
                    ) : (
                      <span className="text-sm leading-none">🥃</span>
                    )}
                    <span className="text-[8px] font-mono mt-0.5 opacity-80">#{i + 1}</span>

                    {isCurrent && (
                      <div className="w-full bg-stone-950 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full transition-all duration-75"
                          style={{ width: `${shotPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Drink Button */}
            {!isCompleted ? (
              <div className="w-full max-w-xs mt-2">
                <button
                  onClick={handleDrink}
                  className={`w-full py-3.5 px-4 rounded-2xl font-serif font-black text-base uppercase tracking-wider text-stone-950 transition-all duration-75 cursor-pointer shadow-xl ${
                    isPressed
                      ? 'bg-amber-400 scale-95 shadow-inner'
                      : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-95 shadow-amber-500/40'
                  }`}
                >
                  EXNI SHOT #{completedGoals + 1}! ({clickCount}/{clicksPerGoal})
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* ===================================================================== */}
        {/* 2. TERCHOVÁ: ŽOFI (Hnedovlasý chlapec, veľká fotka, funkčný kruhový bič) */}
        {/* ===================================================================== */}
        {challenge.type === 'whip_timing' && (
          <div className="flex flex-col items-center w-full">
            {/* Big Žofi Portrait */}
            <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.4)] my-1 bg-stone-900">
              <img
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/${(challenge.portraitUrl || 'zofi.jpg').replace(/^\//, '')}`}
                alt="Žofi"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Character Quote */}
            <div className="bg-amber-950/80 border border-amber-800/60 rounded-2xl p-2.5 my-1.5 w-full">
              <div className="text-amber-300 font-serif font-bold text-sm mb-0.5">
                Žofi
              </div>
              <p className="text-xs text-stone-200 italic leading-snug">
                „Roztoč bič v kruhu a pleskni presne v zelenom! Desať ráz a Jánošíkov Tieň je náš!“
              </p>
            </div>

            {/* 10 Hits Indicator Pills */}
            <div className="flex justify-center gap-1.5 w-full max-w-xs my-1">
              {Array.from({ length: totalGoals }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full border transition-all duration-150 ${
                    i < completedGoals
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                      : 'bg-stone-900 border-stone-700'
                  }`}
                />
              ))}
            </div>

            {/* Functional HTML5 Canvas Circular Whip Gauge */}
            {!isCompleted && (
              <div className="relative my-1 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={200}
                  height={200}
                  className="w-44 h-44 block"
                />
              </div>
            )}

            {/* Action Whip Button */}
            {!isCompleted && (
              <div className="w-full max-w-xs mt-1">
                <button
                  onClick={handleWhip}
                  className={`w-full py-3.5 px-4 rounded-2xl font-serif font-black text-base uppercase tracking-wider text-stone-950 transition-all duration-75 cursor-pointer shadow-xl ${
                    isPressed
                      ? 'bg-amber-400 scale-95 shadow-inner'
                      : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-95 shadow-amber-500/40'
                  }`}
                >
                  PLESKNI BIČOM! ({completedGoals}/{totalGoals})
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* 3. MYJAVA: MIRNYX SOVA (Širákový Duel - Zober Klobúk) */}
        {/* ===================================================================== */}
        {challenge.type === 'hat_duel' && (
          <div className="flex flex-col items-center w-full">
            {/* Big Mirnyx Sova Portrait */}
            <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.4)] my-1 bg-stone-900">
              <img
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/${(challenge.portraitUrl || 'mirnyx_sova.jpg').replace(/^\//, '')}`}
                alt="Mirnyx Sova"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Character Quote */}
            <div className="bg-amber-950/80 border border-amber-800/60 rounded-2xl p-2.5 my-1.5 w-full">
              <div className="text-amber-300 font-serif font-bold text-sm mb-0.5">
                Mirnyx Sova
              </div>
              <p className="text-xs text-stone-200 italic leading-snug">
                „Pozor na širák, junák! Keď sa pohnem a zoberiem ti klobúk, rýchlo klikni na môj a uchmatni ho skôr, než vyprší čas!“
              </p>
            </div>

            {/* 10 Hits Indicator Pills */}
            <div className="flex justify-center gap-1.5 w-full max-w-xs my-1">
              {Array.from({ length: totalGoals }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full border transition-all duration-150 ${
                    i < completedGoals
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                      : 'bg-stone-900 border-stone-700'
                  }`}
                />
              ))}
            </div>

            {/* ŠIRÁKOVÝ DUEL ARENA (Dvaja tanečníci / klobúky) */}
            {!isCompleted && (
              <div className="w-full max-w-sm bg-stone-950/90 border-2 border-[#78350f] rounded-2xl p-3 my-2 shadow-2xl flex flex-col items-center">
                {/* Reaction Timer Bar (Visible when snatched) */}
                <div className="w-full h-2.5 bg-stone-900 border border-stone-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all duration-75 rounded-full ${
                      duelTimeLeft > 50
                        ? 'bg-emerald-500'
                        : duelTimeLeft > 25
                        ? 'bg-amber-500'
                        : 'bg-red-500 animate-pulse'
                    }`}
                    style={{ width: `${duelState === 'snatched' ? duelTimeLeft : 100}%` }}
                  />
                </div>

                {/* Two Dancers Facing each other */}
                <div className="flex items-center justify-around w-full px-2 py-1">
                  {/* Left: Player (Jakub) */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 rounded-2xl bg-blue-950/70 border border-blue-500 flex items-center justify-center text-3xl shadow-lg">
                      {duelState === 'snatched' || duelState === 'failed' ? (
                        <span className="opacity-40 grayscale">🧑</span>
                      ) : (
                        <span>🤠</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-blue-300 mt-1">Ty (Jakub)</span>
                    <span className="text-[9px] text-stone-400 font-mono">
                      {duelState === 'snatched' ? 'Bez klobúka!' : 'Má klobúk'}
                    </span>
                  </div>

                  {/* VS Indicator */}
                  <div className="text-sm font-serif font-black text-amber-500">
                    ⚔️
                  </div>

                  {/* Right: Opponent (Mirnyx Sova) */}
                  <div
                    onClick={handleHatClick}
                    className={`flex flex-col items-center cursor-pointer transition-all duration-100 ${
                      duelState === 'snatched'
                        ? 'scale-110 animate-bounce'
                        : 'hover:scale-105'
                    }`}
                  >
                    <div
                      className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-all duration-150 ${
                        duelState === 'snatched'
                          ? 'bg-emerald-950 border-2 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.9)] ring-4 ring-emerald-500/50'
                          : 'bg-amber-950/70 border border-amber-500'
                      }`}
                    >
                      <span>🤠</span>
                      {duelState === 'snatched' && (
                        <span className="absolute -top-3 -right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-ping">
                          BER!
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 mt-1">Mirnyx Sova</span>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">
                      {duelState === 'snatched' ? '👉 KLIKNI SEM!' : 'Číha...'}
                    </span>
                  </div>
                </div>

                {/* Action Big Button for Hat Steal */}
                <button
                  onClick={handleHatClick}
                  className={`w-full py-3 px-4 mt-3 rounded-xl font-serif font-black text-sm uppercase tracking-wider text-stone-950 transition-all duration-75 cursor-pointer shadow-lg ${
                    duelState === 'snatched'
                      ? 'bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 hover:brightness-110 active:scale-95 shadow-emerald-500/50 animate-pulse'
                      : 'bg-amber-400 hover:brightness-110 active:scale-95'
                  }`}
                >
                  {duelState === 'snatched'
                    ? '⚡ UCHMATNI MIRNYXOV KLOBÚK!'
                    : `Čakaj na pohyb... (${completedGoals}/${totalGoals})`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback Text */}
        {feedback && !isCompleted && (
          <div
            className="text-xs font-serif font-bold mt-1"
            style={{ color: feedback.color }}
          >
            {feedback.text}
          </div>
        )}

        {/* Completion Screen */}
        {isCompleted && (
          <div className="flex flex-col items-center w-full max-w-xs mt-2 animate-in zoom-in-95 duration-150">
            <div className="bg-emerald-950/80 border border-emerald-500 rounded-2xl p-3.5 mb-3 text-center w-full">
              <div className="text-2xl mb-0.5">⚔️</div>
              <h3 className="text-base font-serif font-bold text-emerald-300">
                VÝZVA SPLNENÁ!
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Bos <strong>{challenge.bossName}</strong> prichádza!
              </p>
            </div>
            <button
              onClick={onChallengeComplete}
              className="w-full py-3.5 px-4 rounded-2xl font-serif font-black text-base uppercase tracking-wider bg-gradient-to-r from-red-600 to-amber-600 text-white hover:brightness-110 active:scale-95 shadow-xl cursor-pointer"
            >
              DO BOJA! ⚔️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
