import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { Hero, SkillCooldown, DialogueLine, StoryChapter, RelicItem, FestivalChallenge } from './types';
import { ChampionBar } from './components/ChampionBar';
import { DialogueBox } from './components/DialogueBox';
import { Minimap } from './components/Minimap';
import { QuestBanner } from './components/QuestBanner';
import { RelicModal } from './components/RelicModal';
import { FestivalChallengeModal } from './components/FestivalChallengeModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { IntroCutsceneModal } from './components/IntroCutsceneModal';
import { ControlsGuide } from './components/ControlsGuide';
import { Joystick } from './components/Joystick';
import { ActionPad } from './components/ActionPad';
import { sound } from './game/sound';
import { STORY_CHAPTERS } from './game/story';

import { HomeModal } from './components/HomeModal';
import { TavernModal } from './components/TavernModal';
import { StorageManager } from './game/storage';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game UI State
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [cooldowns, setCooldowns] = useState<SkillCooldown>({
    q: { current: 0, max: 2.2, name: "Jakub's Cleave", desc: '' },
    w: { current: 0, max: 3.0, name: "Šimi's Arcane Bolt", desc: '' },
    e: { current: 0, max: 4.5, name: "Filip's Vanguard Slam", desc: '' },
    r: { current: 0, max: 60.0, name: "Trojhlasný Vír", desc: '' },
  });
  const [currentChapter, setCurrentChapter] = useState<StoryChapter>(STORY_CHAPTERS[0]);
  const [chapterKills, setChapterKills] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [totalKills, setTotalKills] = useState<number>(0);
  const [activeRelics, setActiveRelics] = useState<RelicItem[]>([]);

  // Collectibles & Dukaty
  const [collectibles, setCollectibles] = useState(StorageManager.getCollectibles());
  const [dukaty, setDukaty] = useState(StorageManager.getDukaty());

  // Modals & Dialogue
  const [activeDialogue, setActiveDialogue] = useState<DialogueLine[] | null>(null);
  const [dialogueCompleteCallback, setDialogueCompleteCallback] = useState<(() => void) | null>(null);
  const [offeredRelics, setOfferedRelics] = useState<RelicItem[] | null>(null);
  const [relicSelectCallback, setRelicSelectCallback] = useState<((relic: RelicItem) => void) | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<FestivalChallenge | null>(null);
  const [challengeShotCallback, setChallengeShotCallback] = useState<((shot: number) => void) | null>(null);
  const [challengeCompleteCallback, setChallengeCompleteCallback] = useState<(() => void) | null>(null);
  const [showHomeModal, setShowHomeModal] = useState<boolean>(false);
  const [showTavernModal, setShowTavernModal] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [showCutscene, setShowCutscene] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Preload all portrait images in background into browser cache immediately
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
    const imagesToPreload = [
      'dievcata.webp',
      'jakub.webp',
      'simi.webp',
      'filip.webp',
      'marek.webp',
      'samko.webp',
      'emi_sobi.webp',
      'zofi.webp',
      'mirnyx_sova.webp'
    ];
    imagesToPreload.forEach(name => {
      const img = new Image();
      img.src = `${baseUrl}/${name}`;
    });
  }, []);

  // Initialize Game Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const { clientWidth, clientHeight } = container;
      if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
        canvas.width = clientWidth;
        canvas.height = clientHeight;
      }
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(container);

    const engine = new GameEngine(canvas, {
      onDialogueStart: (lines, onComplete) => {
        setActiveDialogue(lines);
        setDialogueCompleteCallback(() => onComplete || null);
      },
      onChapterUpdate: (chapter, kills) => {
        setCurrentChapter({ ...chapter });
        setChapterKills(kills);
      },
      onHeroStatsUpdate: (updatedHeroes, updatedCooldowns) => {
        setHeroes([...updatedHeroes]);
        setCooldowns({
          q: { ...updatedCooldowns.q },
          w: { ...updatedCooldowns.w },
          e: { ...updatedCooldowns.e },
          r: { ...updatedCooldowns.r },
        });
        if (engineRef.current) {
          setScore(engineRef.current.score);
          setTotalKills(engineRef.current.totalKills);
          setCameraPos({ x: engineRef.current.cameraX, y: engineRef.current.cameraY });
        }
      },
      onRelicChoice: (relics, onSelect) => {
        setOfferedRelics(relics);
        setRelicSelectCallback(() => onSelect);
      },
      onFestivalChallenge: (challenge, onShot, onComplete) => {
        setActiveChallenge(challenge);
        setChallengeShotCallback(() => onShot);
        setChallengeCompleteCallback(() => onComplete);
      },
      onOpenHome: () => {
        setCollectibles(StorageManager.getCollectibles());
        setDukaty(StorageManager.getDukaty());
        setShowHomeModal(true);
      },
      onOpenTavern: () => {
        setShowTavernModal(true);
      },
      onGameOver: (finalScore) => {
        setScore(finalScore);
        setIsGameOver(true);
      },
      onVictory: (finalScore) => {
        setScore(finalScore);
        setIsVictory(true);
        // Odomknutie finálnej trofeje do pamäte
        StorageManager.unlockCollectible('stuhy_dievcat');
      },
    });

    engineRef.current = engine;
    // Hra je pozastavená, kým si hráč neprehrá prológ a nevyberie postavu
    engine.setPaused(true);
    engine.start();

    return () => {
      resizeObserver.disconnect();
      engine.destroy();
    };
  }, []);

  const handleDialogueComplete = useCallback(() => {
    setActiveDialogue(null);
    if (engineRef.current) {
      engineRef.current.setDialogueActive(false);
    }
    if (dialogueCompleteCallback) {
      dialogueCompleteCallback();
      setDialogueCompleteCallback(null);
    }
  }, [dialogueCompleteCallback]);

  const handleRelicSelected = (relic: RelicItem) => {
    setActiveRelics(prev => [...prev, relic]);
    setOfferedRelics(null);
    if (relicSelectCallback) {
      relicSelectCallback(relic);
      setRelicSelectCallback(null);
    }
  };

  const handleChallengeShot = (shotIndex: number) => {
    if (challengeShotCallback) {
      challengeShotCallback(shotIndex);
    }
  };

  const handleChallengeComplete = () => {
    setActiveChallenge(null);
    if (challengeCompleteCallback) {
      challengeCompleteCallback();
      setChallengeCompleteCallback(null);
    }
  };

  const handleRestart = () => {
    setIsGameOver(false);
    setIsVictory(false);
    setShowCutscene(true);
    setActiveDialogue(null);
    setOfferedRelics(null);
    setActiveChallenge(null);
    setChallengeShotCallback(null);
    setChallengeCompleteCallback(null);
    setShowHomeModal(false);
    setShowTavernModal(false);
    setActiveRelics([]);
    setCurrentChapter(STORY_CHAPTERS[0]);
    setChapterKills(0);
    setScore(0);
    setTotalKills(0);
    if (engineRef.current) {
      engineRef.current.restart();
      engineRef.current.setPaused(true);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  return (
    <div
      ref={containerRef}
      id="game-root-viewport"
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none font-sans touch-none"
    >
      {/* HTML5 Canvas Rendering Viewport */}
      <canvas
        ref={canvasRef}
        id="pixel-game-canvas"
        className="w-full h-full block pixelated touch-none"
      />

      {/* Quest Banner Top Left */}
      <QuestBanner
        chapter={currentChapter}
        currentKills={chapterKills}
        score={score}
        totalKills={totalKills}
      />

      {/* Minimap Top Right */}
      {engineRef.current && (
        <Minimap
          heroes={heroes}
          enemies={engineRef.current.enemies}
          waystones={engineRef.current.world.waystones}
          cameraX={cameraPos.x}
          cameraY={cameraPos.y}
          currentZone={engineRef.current.currentChapterIndex}
        />
      )}

      {/* Mobile Virtual Joystick (Left Hand) */}
      {!isGameOver && !isVictory && (
        <Joystick
          onMove={(vector) => {
            engineRef.current?.setJoystick(vector.x, vector.y);
          }}
        />
      )}

      {/* Mobile Action Pad (Right Hand) */}
      {!isGameOver && !isVictory && (
        <ActionPad
          cooldowns={cooldowns}
          onCastQ={() => engineRef.current?.castJakubSlash()}
          onCastW={() => engineRef.current?.castSimiMagic()}
          onCastE={() => engineRef.current?.castFilipSlam()}
          onCastR={() => engineRef.current?.castUltimateWhirlwind()}
        />
      )}

      {/* Champion HUD Bottom Center */}
      <ChampionBar
        heroes={heroes}
        relics={activeRelics}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onToggleHelp={() => setShowHelp(true)}
      />

      {/* Story Dialogue Box */}
      {activeDialogue && !showCutscene && (
        <DialogueBox
          lines={activeDialogue}
          onComplete={handleDialogueComplete}
        />
      )}

      {/* Intro Prologue Cutscene Video Modal & Hero Selection */}
      {showCutscene && (
        <IntroCutsceneModal
          onComplete={(selectedHero) => {
            setShowCutscene(false);
            sound.startDynamicMusic('explore');
            if (engineRef.current) {
              engineRef.current.setChosenHero(selectedHero);
              engineRef.current.setPaused(false);
              engineRef.current.triggerChapterDialogue(0);
            }
          }}
        />
      )}

      {/* Zbojnícka Krčma Minigames Modal */}
      {showTavernModal && (
        <TavernModal
          onArmWrestlingWin={(gainedDukaty, buffText) => {
            const total = StorageManager.addDukaty(gainedDukaty);
            setDukaty(total);
            if (engineRef.current) {
              engineRef.current.heroes.forEach(h => {
                h.stats.attackPower = Math.floor(h.stats.attackPower * 1.25);
              });
              engineRef.current.floatingTexts.push({
                id: Math.random().toString(),
                x: engineRef.current.jakub.x,
                y: engineRef.current.jakub.y - 45,
                text: `💥 VÝHRA V PÁKE! +${gainedDukaty} DUKÁTOV & ${buffText}`,
                color: '#fbbf24',
                alpha: 1,
                life: 2.2,
                isCrit: true,
              });
            }
          }}
          onDanceWin={(gainedDukaty, buffText) => {
            const total = StorageManager.addDukaty(gainedDukaty);
            setDukaty(total);
            if (engineRef.current) {
              engineRef.current.heroes.forEach(h => {
                h.speed = Math.floor(h.speed * 1.35);
              });
              engineRef.current.floatingTexts.push({
                id: Math.random().toString(),
                x: engineRef.current.jakub.x,
                y: engineRef.current.jakub.y - 45,
                text: `🔥 ZBOJNÍCKY ODZEMOK! +${gainedDukaty} DUKÁTOV & ${buffText}`,
                color: '#34d399',
                alpha: 1,
                life: 2.2,
                isCrit: true,
              });
            }
          }}
          onClose={() => setShowTavernModal(false)}
        />
      )}

      {/* Relic Selection Modal */}
      {offeredRelics && (
        <RelicModal
          relics={offeredRelics}
          onSelect={handleRelicSelected}
        />
      )}

      {/* Festival Ritual / Drinking Challenge Modal */}
      {activeChallenge && (
        <FestivalChallengeModal
          challenge={activeChallenge}
          onShotConsumed={handleChallengeShot}
          onChallengeComplete={handleChallengeComplete}
        />
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <GameOverModal
          score={score}
          onRestart={handleRestart}
        />
      )}

      {/* Victory Screen */}
      {isVictory && (
        <VictoryModal
          score={score}
          onRestart={handleRestart}
        />
      )}

      {/* Controls & Combat Manual */}
      {showHelp && (
        <ControlsGuide
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}
