import React, { useState, useEffect } from 'react';
import { DialogueLine } from '../types';
import { sound } from '../game/sound';
import { ChevronRight } from 'lucide-react';

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

    // Play character spoken voice line if defined
    if (currentLine.voiceAudio) {
      sound.playCustomAudio(currentLine.voiceAudio, 1.0);
    }

    let charIndex = 0;
    const fullText = currentLine.text;

    const timer = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        if (charIndex % 3 === 0 && !currentLine.voiceAudio) {
          sound.playTypewriter();
        }
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [currentIndex, currentLine]);

  const handleAdvance = () => {
    if (isTyping && currentLine) {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
      return;
    }

    // Stop current voice audio before advancing
    sound.stopCustomAudio();

    if (currentIndex < lines.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    return () => {
      sound.stopCustomAudio();
    };
  }, []);

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

  // Speaker icons & photo mappings
  let speakerIcon = '📜';
  let speakerPhoto = '';
  let badgeClass = 'bg-amber-950/90 border-[#fbbf24] text-[#fbbf24]';
  let speakerRole = 'Postava';

  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

  if (currentLine.speaker === 'Marek' || currentLine.speaker === 'Rozprávač' || currentLine.speaker === 'Rozprávač Marek') {
    speakerIcon = '🎭';
    speakerPhoto = `${baseUrl}/marek.webp`;
    badgeClass = 'bg-red-950/90 border-red-500 text-red-200';
    speakerRole = 'Rozprávač';
  } else if (currentLine.speaker === 'Jakub') {
    speakerIcon = '🪓';
    speakerPhoto = `${baseUrl}/jakub.webp`;
    badgeClass = 'bg-blue-950/90 border-blue-500 text-blue-300';
    speakerRole = 'Vodca družiny';
  } else if (currentLine.speaker === 'Šimi') {
    speakerIcon = '🪗';
    speakerPhoto = `${baseUrl}/simi.webp`;
    badgeClass = 'bg-purple-950/90 border-purple-500 text-purple-300';
    speakerRole = 'Heligonkár';
  } else if (currentLine.speaker === 'Filip') {
    speakerIcon = '💥';
    speakerPhoto = `${baseUrl}/filip.webp`;
    badgeClass = 'bg-amber-950/90 border-amber-500 text-amber-300';
    speakerRole = 'Zbojník';
  } else if (currentLine.speaker === 'Samko Szabó' || currentLine.speaker === 'Samko') {
    speakerIcon = '👨‍🌾';
    speakerPhoto = `${baseUrl}/samko.webp`;
    badgeClass = 'bg-emerald-950/90 border-emerald-500 text-emerald-300';
    speakerRole = 'Detviansky sprievodca';
  } else if (currentLine.speaker === 'Emi Sobi') {
    speakerIcon = '🥃';
    speakerPhoto = `${baseUrl}/emi_sobi.webp`;
    badgeClass = 'bg-orange-950/90 border-orange-500 text-orange-300';
    speakerRole = 'Hostiteľka z Detvy';
  } else if (currentLine.speaker === 'Žofi') {
    speakerIcon = '🪢';
    speakerPhoto = `${baseUrl}/zofi.webp`;
    badgeClass = 'bg-amber-950/90 border-amber-500 text-amber-300';
    speakerRole = 'Majster biča z Terchovej';
  } else if (currentLine.speaker === 'Mirnyx Sova') {
    speakerIcon = '🤠';
    speakerPhoto = `${baseUrl}/mirnyx_sova.webp`;
    badgeClass = 'bg-yellow-950/90 border-yellow-500 text-yellow-300';
    speakerRole = 'Majster širákov z Myjavy';
  } else if (currentLine.speaker === 'Dievčatá zo súboru' || currentLine.speaker === 'Dievčatá' || currentLine.speakerHeroId === 'girls') {
    speakerIcon = '🌸';
    speakerPhoto = `${baseUrl}/dievcata.webp`;
    badgeClass = 'bg-rose-950/90 border-rose-500 text-rose-300';
    speakerRole = 'Folklórny súbor';
  }

  return (
    <div
      id="dialogue-box-overlay"
      onClick={handleAdvance}
      className="fixed bottom-16 sm:bottom-20 left-2 right-2 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-2xl z-40 cursor-pointer select-none"
    >
      <div className="bg-[#1c1917]/98 backdrop-blur-md border-2 border-[#b45309] p-3.5 sm:p-4 rounded-3xl shadow-2xl text-[#fef08a] relative flex items-center gap-3.5 sm:gap-4.5">
        {/* Large Character Portrait Photo */}
        {speakerPhoto ? (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0 bg-stone-900">
            <img
              src={speakerPhoto}
              alt={currentLine.speaker}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-amber-400 bg-amber-950/90 flex items-center justify-center text-3xl shadow-lg shrink-0">
            {speakerIcon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Speaker Header Tag */}
          <div className="flex items-center justify-between mb-1.5 border-b border-[#78350f]/80 pb-1">
            <div className="flex items-center gap-1.5">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs sm:text-sm font-serif font-bold tracking-wider uppercase ${badgeClass}`}>
                <span>{speakerIcon}</span>
                <span>{currentLine.speaker}</span>
              </div>
              <span className="hidden sm:inline-block text-[10px] text-stone-400 font-serif italic">
                ({speakerRole})
              </span>
            </div>

            <span className="text-[9px] sm:text-[10px] font-mono text-[#a8a29e] flex items-center gap-0.5">
              Ďalej <ChevronRight className="w-3.5 h-3.5 text-[#fbbf24] inline animate-pulse" />
            </span>
          </div>

          {/* Dialogue Text */}
          <p className="text-xs sm:text-sm text-[#f5f5f4] leading-relaxed min-h-[44px] font-sans font-medium">
            {displayedText}
            {isTyping && <span className="inline-block w-1.5 h-3 bg-[#fbbf24] ml-0.5 animate-pulse" />}
          </p>
        </div>
      </div>
    </div>
  );
};
