import React from 'react';
import { X, Sword, Sparkles, Shield, Compass, Key } from 'lucide-react';

interface ControlsGuideProps {
  onClose: () => void;
}

export const ControlsGuide: React.FC<ControlsGuideProps> = ({ onClose }) => {
  return (
    <div
      id="controls-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md select-none"
    >
      <div className="bg-[#1c1917] border-2 border-[#78350f] rounded-xl max-w-xl w-full p-4 sm:p-5 text-[#fef08a] shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          id="btn-close-guide"
          onClick={onClose}
          className="absolute top-3 right-3 text-[#d6d3d1] hover:text-[#fbbf24] p-1 border border-[#78350f] rounded-full hover:border-[#fbbf24] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 border-b border-[#78350f] pb-2 mb-3">
          <span className="text-2xl">🪓</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#fbbf24] font-serif uppercase tracking-wider">
              PRÍRUČKA HRDINU: ZÁCHRANA DIEVČAT
            </h2>
            <p className="text-[10px] sm:text-xs text-[#d6d3d1]">
              Folklórne dobrodružstvo Jakuba, Šimiho a Filipa
            </p>
          </div>
        </div>

        {/* Story Summary */}
        <div className="bg-[#0c0a09] border border-[#78350f]/80 p-2.5 rounded-lg mb-3">
          <p className="text-[11px] text-[#e7e5e4] leading-relaxed">
            Po vystúpení na festivale <strong>Východná</strong> ste sa vďaka starej fujare ocitli v mýtickom slovenskom svete. Zlí zbojníci uniesli všetky dievčatá z vášho folklórneho súboru do <strong>Severného Hradu</strong>! Aby ste otvorili hradnú bránu, musíte získať <strong>3 festivalové kľúče</strong> z Detvy, Myjavy a Terchovej!
          </p>
        </div>

        {/* Abilities Grid */}
        <h3 className="text-xs font-bold text-[#fbbf24] font-serif uppercase tracking-wide mb-2 flex items-center gap-1">
          <Sword className="w-3.5 h-3.5 text-[#fbbf24]" /> Folklórne Schopnosti Družiny
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          {/* Jakub */}
          <div className="bg-[#0c0a09] border border-blue-800/80 p-2.5 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#fbbf24] text-xs font-serif">Jakub</span>
                <span className="text-[9px] bg-blue-900/80 text-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  Kláves [I]
                </span>
              </div>
              <div className="text-[10px] text-blue-300 font-bold mb-1">Sek Zbojníckou Valaškou</div>
              <p className="text-[10px] text-[#d6d3d1] leading-snug">
                Bojovník na blízko. Rýchly a ničivý sek valaškou s vysokou šancou na kritický úder.
              </p>
            </div>
          </div>

          {/* Šimi */}
          <div className="bg-[#0c0a09] border border-purple-800/80 p-2.5 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#c084fc] text-xs font-serif">Šimi</span>
                <span className="text-[9px] bg-purple-900/80 text-purple-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  Kláves [O]
                </span>
              </div>
              <div className="text-[10px] text-purple-300 font-bold mb-1">Tón z Heligónky</div>
              <p className="text-[10px] text-[#d6d3d1] leading-snug">
                Diaľkový folklórny mág. Vystrelí sonický hudobný akord ♫, ktorý nájde cieľ a vybuchne.
              </p>
            </div>
          </div>

          {/* Filip */}
          <div className="bg-[#0c0a09] border border-amber-800/80 p-2.5 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#fbbf24] text-xs font-serif">Filip</span>
                <span className="text-[9px] bg-amber-900/80 text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  Kláves [P]
                </span>
              </div>
              <div className="text-[10px] text-amber-300 font-bold mb-1">Zbojnícky Dupák</div>
              <p className="text-[10px] text-[#d6d3d1] leading-snug">
                Tanečný silák. Prirúti sa vpred a urobí masívny dupák, ktorý odhodí všetkých zbojníkov.
              </p>
            </div>
          </div>
        </div>

        {/* Controls Summary */}
        <div className="bg-[#0c0a09] border border-[#78350f] p-2.5 rounded-lg text-[10px] text-[#d6d3d1] space-y-1 mb-4">
          <div className="flex justify-between">
            <span className="text-[#fbbf24] font-bold">Pohyb:</span>
            <span>Klávesy [W, A, S, D] / Šípky alebo Virtuálny Joystick vľavo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#fbbf24] font-bold">Útoky & Zručnosti:</span>
            <span>Jakub = [I], Šimi = [O], Filip = [P]</span>
          </div>
          <div className="flex justify-between text-amber-300">
            <span className="font-bold text-amber-400">💥 Trojhlasný Vír (Superschopnosť):</span>
            <span>Kláves [U] (60s cooldown - obrovský vír & odhod)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#fbbf24] font-bold">Družina:</span>
            <span>Šimi a Filip automaticky nasledujú Jakuba v taktickej formácii.</span>
          </div>
        </div>

        <button
          id="btn-understand-guide"
          onClick={onClose}
          className="w-full py-2 bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-black font-bold uppercase tracking-wider rounded font-serif text-xs transition-colors shadow-lg"
        >
          Rozumiem, Poďme Zachrániť Dievčatá!
        </button>
      </div>
    </div>
  );
};
