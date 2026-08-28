import React, { useState, useEffect } from 'react';
import { Flame, Music, Swords, ArrowLeft, Trophy, Sparkles } from 'lucide-react';

interface TavernModalProps {
  onArmWrestlingWin: (dukaty: number, buffText: string) => void;
  onDanceWin: (dukaty: number, buffText: string) => void;
  onClose: () => void;
}

export const TavernModal: React.FC<TavernModalProps> = ({
  onArmWrestlingWin,
  onDanceWin,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'hub' | 'arm_wrestling' | 'dance'>('hub');

  // Minihra 1: Páka (Adaptive Rubber-band AI)
  const [armProgress, setArmProgress] = useState(50); // 0 = prehra, 100 = výhra
  const [armStatus, setArmStatus] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready');
  const [armTimer, setArmTimer] = useState(12);
  const [clickCount, setClickCount] = useState(0);

  // Minihra 2: Rytmický tanec (10-krokový tanec s okamžitou výhrou pri 10 úspešných krokoch)
  const [danceScore, setDanceScore] = useState(0);
  const TARGET_DANCE_GOAL = 8;
  const [danceTargetKey, setDanceTargetKey] = useState<'A' | 'W' | 'S' | 'D' | 'I' | 'O' | 'P'>('W');
  const [danceTimeLeft, setDanceTimeLeft] = useState(15);
  const [danceStatus, setDanceStatus] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready');

  // Arm Wrestling Loop: Adaptívna sila zbojníka
  useEffect(() => {
    let interval: any;
    if (armStatus === 'playing') {
      interval = setInterval(() => {
        setArmProgress(prev => {
          // Zbojník ťahá silnejšie, čím bližšie si k výhre (rubber-banding)
          const resistance = prev > 70 ? 5.5 : (prev > 50 ? 4.0 : 3.0);
          const next = prev - resistance;
          if (next <= 0) {
            setArmStatus('lost');
            return 0;
          }
          return next;
        });

        setArmTimer(t => {
          if (t <= 1) {
            setArmProgress(p => {
              if (p >= 55) {
                setArmStatus('won');
                onArmWrestlingWin(40, '+25% Útok Valašky & Dupáku!');
              } else {
                setArmStatus('lost');
              }
              return p;
            });
            return 0;
          }
          return t - 1;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [armStatus]);

  const handleArmClick = () => {
    if (armStatus === 'playing') {
      setClickCount(c => c + 1);
      setArmProgress(prev => {
        const gain = 6.5;
        const next = prev + gain;
        if (next >= 100) {
          setArmStatus('won');
          onArmWrestlingWin(40, '+25% Útok Valašky & Dupáku!');
          return 100;
        }
        return next;
      });
    }
  };

  // Dance Rhythm Loop
  const KEYS: ('A' | 'W' | 'S' | 'D' | 'I' | 'O' | 'P')[] = ['A', 'W', 'S', 'D', 'I', 'O', 'P'];
  
  useEffect(() => {
    let timer: any;
    if (danceStatus === 'playing') {
      timer = setInterval(() => {
        setDanceTimeLeft(t => {
          if (t <= 1) {
            setDanceStatus('lost');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [danceStatus]);

  const handleDanceKeyPress = (key: string) => {
    if (danceStatus === 'playing') {
      if (key.toUpperCase() === danceTargetKey) {
        const newScore = danceScore + 1;
        setDanceScore(newScore);

        // Hneď pri dosiahnutí cieľa 8 bodov okamžite vyhráš
        if (newScore >= TARGET_DANCE_GOAL) {
          setDanceStatus('won');
          onDanceWin(50, '+35% Rýchlosť behu & -20% Cooldowny!');
          return;
        }

        // Ďalšia náhodná klávesa
        const filtered = KEYS.filter(k => k !== danceTargetKey);
        const nextKey = filtered[Math.floor(Math.random() * filtered.length)];
        setDanceTargetKey(nextKey);
      } else {
        // Zlé stlačenie
        setDanceScore(s => Math.max(0, s - 1));
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === 'dance' && danceStatus === 'playing') {
        handleDanceKeyPress(e.key);
      } else if (activeTab === 'arm_wrestling' && armStatus === 'playing' && (e.key === ' ' || e.key === 'Enter')) {
        handleArmClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, danceStatus, armStatus, danceTargetKey, danceScore]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#291e13] via-[#15110d] to-[#291e13] border-2 border-amber-500/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.4)] text-stone-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-800/40 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-900/60 border border-amber-500 flex items-center justify-center text-2xl">
              🍻
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-400">
                Zbojnícka Krčma „U Starého Baču“
              </h2>
              <p className="text-xs text-stone-400">
                Miesto pre silákov, folkloristov a súťaže o zlaté dukáty a silné bojové buffy!
              </p>
            </div>
          </div>
        </div>

        {/* Tab 1: Tavern Hub */}
        {activeTab === 'hub' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {/* Páka */}
            <div
              onClick={() => {
                setActiveTab('arm_wrestling');
                setArmStatus('ready');
                setArmProgress(50);
                setArmTimer(10);
              }}
              className="p-5 rounded-2xl bg-amber-950/40 hover:bg-amber-950/70 border-2 border-amber-800/60 hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl group-hover:scale-110 transition-transform">💪</span>
                  <h3 className="font-serif font-bold text-lg text-amber-300">Súboj v Páke</h3>
                </div>
                <p className="text-xs text-stone-300 mb-3">
                  Vyzvi najsilnejšieho zbojníka pri stole! Rýchlym klikaním alebo medzerníkom pretlač jeho ruku na stôl.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-400 font-mono font-bold bg-amber-900/30 p-2 rounded-xl border border-amber-700/40">
                <span>Odmena: +40 Dukátov</span>
                <span>Buff: +25% DMG</span>
              </div>
            </div>

            {/* Folklórny Tanec */}
            <div
              onClick={() => {
                setActiveTab('dance');
                setDanceStatus('ready');
                setDanceScore(0);
                setDanceTimeLeft(12);
                setDanceTargetKey('W');
              }}
              className="p-5 rounded-2xl bg-amber-950/40 hover:bg-amber-950/70 border-2 border-amber-800/60 hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🔥</span>
                  <h3 className="font-serif font-bold text-lg text-amber-300">Tanec pri Vatre</h3>
                </div>
                <p className="text-xs text-stone-300 mb-3">
                  Zatancuj rýchly zbojnícky odzemok! Stláčaj zobrazené klávesy do rytmu a získaj tanečný zápal.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-400 font-mono font-bold bg-amber-900/30 p-2 rounded-xl border border-amber-700/40">
                <span>Odmena: +50 Dukátov</span>
                <span>Buff: Rýchlosť & Cooldown</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Arm Wrestling Minigame */}
        {activeTab === 'arm_wrestling' && (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-4">
            <h3 className="font-serif font-bold text-xl text-amber-300">Súboj v Páke: Pretlač Zbojníka!</h3>
            <p className="text-xs text-stone-400">
              {armStatus === 'ready' && 'Klikni na tlačidlo ŠTART a potom rýchlo klikaj alebo stláčaj MEDZERNÍK!'}
              {armStatus === 'playing' && `Čas do konca kola: ${armTimer}s`}
            </p>

            {/* Arm Bar */}
            <div className="w-full max-w-md h-8 bg-stone-950 rounded-full border-2 border-amber-500 overflow-hidden relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-75"
                style={{ width: `${armProgress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-mono font-bold text-white drop-shadow">
                <span>Zbojník 😠</span>
                <span>{armProgress.toFixed(0)}%</span>
                <span>TY 🤠</span>
              </div>
            </div>

            {armStatus === 'ready' && (
              <button
                onClick={() => setArmStatus('playing')}
                className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-bold text-base uppercase cursor-pointer"
              >
                Začať Súboj!
              </button>
            )}

            {armStatus === 'playing' && (
              <button
                onClick={handleArmClick}
                className="w-48 h-20 rounded-3xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-serif font-black text-2xl uppercase tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.6)] cursor-pointer"
              >
                ŤAHAJ! 💥
              </button>
            )}

            {armStatus === 'won' && (
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-serif font-bold text-base shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <span>🎉 VÝBORNÉ! Zbojník padol pod stôl!</span>
                <span className="text-amber-300 font-mono text-sm">💰 +40 Dukátov pridaných | ⚡ +25% Trvalé poškodenie</span>
                <button
                  onClick={() => { setArmStatus('ready'); setArmProgress(50); setArmTimer(12); }}
                  className="mt-2 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase cursor-pointer"
                >
                  Hrať znova
                </button>
              </div>
            )}
            {armStatus === 'lost' && (
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-300 font-serif font-bold text-base">
                <span>❌ Zbojník ťa pretlačil!</span>
                <span className="text-stone-300 text-xs">Vypi za pohárik a skús to znova!</span>
                <button
                  onClick={() => { setArmStatus('ready'); setArmProgress(50); setArmTimer(12); }}
                  className="mt-2 px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase cursor-pointer"
                >
                  Skúsiť znova
                </button>
              </div>
            )}

            <button
              onClick={() => setActiveTab('hub')}
              className="mt-2 text-xs text-stone-400 hover:text-amber-300 underline cursor-pointer"
            >
              Späť do výberu hier
            </button>
          </div>
        )}

        {/* Tab 3: Dance Minigame */}
        {activeTab === 'dance' && (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-4">
            <h3 className="font-serif font-bold text-xl text-amber-300">Rytmický Odzemok pri Vatre</h3>
            <p className="text-xs text-stone-400">
              {danceStatus === 'ready' && 'Stlač ŠTART a rýchlo stláčaj zobrazené klávesy (alebo na ne klikaj na mobile)!'}
              {danceStatus === 'playing' && `Čas: ${danceTimeLeft}s | Tvoje skóre: ${danceScore} / 8`}
            </p>

            {danceStatus === 'playing' && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-3xl bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center text-4xl font-mono font-black text-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-bounce">
                  {danceTargetKey}
                </div>

                {/* Mobile clickable buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {KEYS.map(k => (
                    <button
                      key={k}
                      onClick={() => handleDanceKeyPress(k)}
                      className={`w-12 h-12 rounded-xl font-mono font-bold text-lg border-2 ${
                        k === danceTargetKey
                          ? 'bg-amber-500 text-stone-950 border-amber-300 scale-105'
                          : 'bg-stone-900 text-stone-300 border-stone-700'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {danceStatus === 'ready' && (
              <button
                onClick={() => {
                  setDanceStatus('playing');
                  setDanceScore(0);
                  setDanceTimeLeft(12);
                }}
                className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-bold text-base uppercase cursor-pointer"
              >
                Roztočiť Tanec!
              </button>
            )}

            {danceStatus === 'won' && (
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-serif font-bold text-base shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <span>🔥 PARÁDA! Tancoval si ako sám Jánošík!</span>
                <span className="text-amber-300 font-mono text-sm">💰 +50 Dukátov pridaných | ⚡ +35% Rýchlosť & -20% Cooldown</span>
                <button
                  onClick={() => { setDanceStatus('ready'); setDanceScore(0); setDanceTimeLeft(15); }}
                  className="mt-2 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase cursor-pointer"
                >
                  Tancovať znova
                </button>
              </div>
            )}
            {danceStatus === 'lost' && (
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-300 font-serif font-bold text-base">
                <span>❌ Vypršal čas alebo si stratil rytmus!</span>
                <button
                  onClick={() => { setDanceStatus('ready'); setDanceScore(0); setDanceTimeLeft(15); }}
                  className="mt-2 px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase cursor-pointer"
                >
                  Skúsiť znova
                </button>
              </div>
            )}

            <button
              onClick={() => setActiveTab('hub')}
              className="mt-2 text-xs text-stone-400 hover:text-amber-300 underline cursor-pointer"
            >
              Späť do výberu hier
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-amber-800/40">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Vyjsť z Krčmy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
