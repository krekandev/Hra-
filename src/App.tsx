import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { Hero, SkillCooldown, DialogueLine, StoryChapter, RelicItem } from './types';
import { ChampionBar } from './components/ChampionBar';
import { DialogueBox } from './components/DialogueBox';
import { Minimap } from './components/Minimap';
import { QuestBanner } from './components/QuestBanner';
import { RelicModal } from './components/RelicModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { ControlsGuide } from './components/ControlsGuide';
import { Joystick } from './components/Joystick';
import { ActionPad } from './components/ActionPad';
import { sound } from './game/sound';
import { STORY_CHAPTERS } from './game/story';

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
  });
  const [currentChapter, setCurrentChapter] = useState<StoryChapter>(STORY_CHAPTERS[0]);
  const [chapterKills, setChapterKills] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [totalKills, setTotalKills] = useState<number>(0);
  const [activeRelics, setActiveRelics] = useState<RelicItem[]>([]);

  // Modals & Dialogue
  const [activeDialogue, setActiveDialogue] = useState<DialogueLine[] | null>(null);
  const [dialogueCompleteCallback, setDialogueCompleteCallback] = useState<(() => void) | null>(null);
  const [offeredRelics, setOfferedRelics] = useState<RelicItem[] | null>(null);
  const [relicSelectCallback, setRelicSelectCallback] = useState<((relic: RelicItem) => void) | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Radar coordinates
  const [cameraPos, setCameraPos] = useState<{ x: number; y: number }>({ x: 480, y: 450 });

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
      onGameOver: (finalScore) => {
        setScore(finalScore);
        setIsGameOver(true);
      },
      onVictory: (finalScore) => {
        setScore(finalScore);
        setIsVictory(true);
      },
    });

    engineRef.current = engine;
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

  const handleRestart = () => {
    setIsGameOver(false);
    setIsVictory(false);
    setActiveDialogue(null);
    setOfferedRelics(null);
    setActiveRelics([]);
    setCurrentChapter(STORY_CHAPTERS[0]);
    setChapterKills(0);
    setScore(0);
    setTotalKills(0);
    if (engineRef.current) {
      engineRef.current.restart();
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
      {activeDialogue && (
        <DialogueBox
          lines={activeDialogue}
          onComplete={handleDialogueComplete}
        />
      )}

      {/* Relic Selection Modal */}
      {offeredRelics && (
        <RelicModal
          relics={offeredRelics}
          onSelect={handleRelicSelected}
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
