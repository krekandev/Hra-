import React, { useState, useEffect } from 'react';
import { DialogueLine } from '../types';
import { sound } from '../game/sound';
import { MessageSquare, ChevronRight } from 'lucide-react';

interface DialogueBoxProps {
  lines: DialogueLine[];
  onComplete: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ lines, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentLine = lines[currentIndex];

  useEffect(() => {
    if (!currentLine) return;

    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    const fullText = currentLine.text;

    const timer = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        if (charIndex % 3 === 0) {
          sound.playTypewriter();
        }
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 18);

    return () => clearInterval(timer);
  }, [currentIndex, currentLine]);

  const handleAdvance = () => {
    if (isTyping && currentLine) {
      // Skip typewriter to full text
      setDisplayedText(currentLine.text);
      setIsTyping(false);
      return;
    }

    if (currentIndex < lines.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'q' || e.key === 'i') {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentLine) return null;

  // Speaker icons & colors
  let speakerColor = '#fbbf24';
  let speakerIcon = '📜';
  let badgeClass = 'bg-amber-950/90 border-[#fbbf24] text-[#fbbf24]';

  if (currentLine.speaker === 'Jakub') {
    speakerColor = '#60a5fa';
    speakerIcon = '🪓';
    badgeClass = 'bg-blue-950/90 border-blue-500 text-blue-300';
  } else if (currentLine.speaker === 'Šimi') {
    speakerColor = '#c084fc';
    speakerIcon = '🪗';
    badgeClass = 'bg-purple-950/90 border-purple-500 text-purple-300';
  } else if (currentLine.speaker === 'Filip') {
    speakerColor = '#f59e0b';
    speakerIcon = '💥';
    badgeClass = 'bg-amber-950/90 border-amber-500 text-amber-300';
  } else if (currentLine.speaker === 'Samko Szabó') {
    speakerColor = '#4ade80';
    speakerIcon = '👨‍🌾';
    badgeClass = 'bg-emerald-950/90 border-emerald-500 text-emerald-300';
  } else if (currentLine.speaker === 'Dievčatá zo súboru') {
    speakerColor = '#f43f5e';
    speakerIcon = '🌸';
    badgeClass = 'bg-rose-950/90 border-rose-500 text-rose-300';
  }

  return (
    <div
      id="dialogue-box-overlay"
      onClick={handleAdvance}
      className="fixed bottom-20 sm:bottom-24 left-2 right-2 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-2xl z-40 cursor-pointer select-none"
    >
      <div className="bg-[#1c1917]/98 backdrop-blur-md border-2 border-[#78350f] p-3 sm:p-4 rounded-xl shadow-2xl text-[#fef08a] relative">
        {/* Speaker Name Tag */}
        <div className="flex items-center justify-between mb-1.5 border-b border-[#78350f]/80 pb-1">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] sm:text-xs font-serif font-bold tracking-wider uppercase ${badgeClass}`}>
            <span>{speakerIcon}</span>
            <span>{currentLine.speaker}</span>
          </div>

          <span className="text-[8px] sm:text-[9px] font-mono text-[#a8a29e] flex items-center gap-0.5">
            Klikni pre pokračovanie <ChevronRight className="w-3 h-3 text-[#fbbf24] inline animate-pulse" />
          </span>
        </div>

        {/* Dialogue Text */}
        <p className="text-xs sm:text-sm text-[#f5f5f4] leading-relaxed min-h-[44px] font-sans">
          {displayedText}
          {isTyping && <span className="inline-block w-1.5 h-3 bg-[#fbbf24] ml-0.5 animate-pulse" />}
        </p>
      </div>
    </div>
  );
};
