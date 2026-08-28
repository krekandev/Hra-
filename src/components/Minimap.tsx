import React from 'react';
import { Hero, Enemy, Waystone } from '../types';
import { MAP_WIDTH, MAP_HEIGHT } from '../game/map';

interface MinimapProps {
  heroes: Hero[];
  enemies: Enemy[];
  waystones: Waystone[];
  cameraX: number;
  cameraY: number;
  currentZone: number;
}

export const Minimap: React.FC<MinimapProps> = ({
  heroes,
  enemies,
  waystones,
  cameraX,
  cameraY,
  currentZone,
}) => {
  const mapWidth = 110;
  const mapHeight = 80;

  const scaleX = mapWidth / MAP_WIDTH;
  const scaleY = mapHeight / MAP_HEIGHT;

  const jakub = heroes.find(h => h.id === 'jakub');

  return (
    <div
      id="minimap-container"
      className="fixed top-2 right-2 z-30 pointer-events-none select-none"
    >
      <div className="bg-[#1c1917]/95 backdrop-blur-md border-2 border-[#78350f] p-1 shadow-2xl shadow-black rounded-lg pointer-events-auto">
        <div className="flex items-center justify-between px-1 mb-0.5 border-b border-[#78350f]/60 text-[7px] font-serif font-bold text-[#fbbf24] uppercase">
          <span>MAPA KRAJA</span>
          <span className="text-[6px] font-mono text-stone-400">3.6x2.6km</span>
        </div>

        <div
          className="relative bg-[#14532d] border border-[#57534e] rounded overflow-hidden"
          style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
        >
          {/* Northern Castle Zone */}
          <div
            className="absolute bg-slate-700 border border-slate-500 rounded-xs flex items-center justify-center text-[7px]"
            style={{
              left: `${1350 * scaleX}px`,
              top: `${80 * scaleY}px`,
              width: `${1000 * scaleX}px`,
              height: `${280 * scaleY}px`,
            }}
            title="Severný Hrad"
          >
            🏰
          </div>

          {/* Start Chalúpka (Náš Domov) */}
          <div
            className="absolute bg-amber-950 flex items-center justify-center text-[7px]"
            style={{
              left: `${490 * scaleX - 4}px`,
              top: `${540 * scaleY - 4}px`,
              width: `8px`,
              height: `8px`,
            }}
            title="Náš Domov (Sieň Trofejí)"
          >
            🏡
          </div>

          {/* Zbojnícka Krčma */}
          <div
            className="absolute bg-amber-900 border border-amber-600 rounded flex items-center justify-center text-[7px]"
            style={{
              left: `${1240 * scaleX - 4}px`,
              top: `${1270 * scaleY - 4}px`,
              width: `8px`,
              height: `8px`,
            }}
            title="Zbojnícka Krčma (Páka & Tanec)"
          >
            🍻
          </div>

          {/* Detva Festival Arena */}
          <div
            className="absolute bg-amber-800/90 rounded-full flex items-center justify-center text-[7px]"
            style={{
              left: `${580 * scaleX - 4}px`,
              top: `${1950 * scaleY - 4}px`,
              width: `9px`,
              height: `9px`,
            }}
            title="Festival Detva"
          >
            🎪
          </div>

          {/* Terchová Festival Arena */}
          <div
            className="absolute bg-amber-800/90 rounded-full flex items-center justify-center text-[7px]"
            style={{
              left: `${2850 * scaleX - 4}px`,
              top: `${1950 * scaleY - 4}px`,
              width: `9px`,
              height: `9px`,
            }}
            title="Festival Terchová"
          >
            🎪
          </div>

          {/* Myjava Festival Arena */}
          <div
            className="absolute bg-amber-800/90 rounded-full flex items-center justify-center text-[7px]"
            style={{
              left: `${1950 * scaleX - 4}px`,
              top: `${850 * scaleY - 4}px`,
              width: `9px`,
              height: `9px`,
            }}
            title="Festival Myjava"
          >
            🎪
          </div>

          {/* Undiscovered Zone Fog of War Overlays */}
          {/* Terchová Fog */}
          {currentZone < 1 && (
            <div
              className="absolute bg-slate-950/95 backdrop-blur-[1px] flex items-center justify-center border-l border-amber-900/60"
              style={{
                left: `${1350 * scaleX}px`,
                top: `${1450 * scaleY}px`,
                width: `${(MAP_WIDTH - 1350) * scaleX}px`,
                height: `${(MAP_HEIGHT - 1450) * scaleY}px`,
              }}
              title="Terchová (Zamknutá oblasť)"
            >
              <span className="text-[6px] text-amber-500/70">🔒</span>
            </div>
          )}

          {/* Myjava Fog */}
          {currentZone < 2 && (
            <div
              className="absolute bg-slate-950/95 backdrop-blur-[1px] flex items-center justify-center border-l border-amber-900/60"
              style={{
                left: `${1350 * scaleX}px`,
                top: `${380 * scaleY}px`,
                width: `${(MAP_WIDTH - 1350) * scaleX}px`,
                height: `${(1450 - 380) * scaleY}px`,
              }}
              title="Myjava (Zamknutá oblasť)"
            >
              <span className="text-[6px] text-amber-500/70">🔒</span>
            </div>
          )}

          {/* Castle Fog */}
          {currentZone < 3 && (
            <div
              className="absolute bg-slate-950/95 backdrop-blur-[1px] flex items-center justify-center border-b border-amber-900/60"
              style={{
                left: `0px`,
                top: `0px`,
                width: `${MAP_WIDTH * scaleX}px`,
                height: `${380 * scaleY}px`,
              }}
              title="Severný Hrad (Zamknutá oblasť)"
            >
              <span className="text-[6px] text-amber-500/70">🔒</span>
            </div>
          )}

          {/* Severný Hrad Fog (Unlocked at Chapter 4: currentZone >= 3) */}
          {currentZone < 3 && (
            <div
              className="absolute bg-slate-950/95 backdrop-blur-[1px] flex items-center justify-center border-b border-amber-900/60"
              style={{
                left: 0,
                top: 0,
                width: `${MAP_WIDTH * scaleX}px`,
                height: `${280 * scaleY}px`,
              }}
              title="Severný Hrad (Zamknutá oblasť)"
            >
              <span className="text-[6px] text-amber-500/70">🔒</span>
            </div>
          )}

          {/* Enemies Dots (Red) - Only visible in discovered territory */}
          {enemies
            .filter((e) => {
              if (e.y < 280) return currentZone >= 3;
              if (e.x >= 1000) {
                if (e.y < 1040) return currentZone >= 2;
                return currentZone >= 1;
              }
              return true;
            })
            .map((e) => (
              <div
                key={e.id}
                className={`absolute rounded-full pointer-events-none ${
                  e.isBoss ? 'bg-red-500 w-2 h-2 shadow-[0_0_4px_red]' : 'bg-rose-400 w-1 h-1'
                }`}
                style={{
                  left: `${e.x * scaleX - (e.isBoss ? 4 : 2)}px`,
                  top: `${e.y * scaleY - (e.isBoss ? 4 : 2)}px`,
                }}
              />
            ))}

          {/* Heroes Indicator Dot (Yellow/Blue with pulse) */}
          {jakub && (
            <div
              className="absolute w-2 h-2 bg-yellow-300 border border-blue-600 rounded-full shadow-[0_0_6px_yellow] pointer-events-none animate-ping"
              style={{
                left: `${jakub.x * scaleX - 4}px`,
                top: `${jakub.y * scaleY - 4}px`,
              }}
            />
          )}
          {jakub && (
            <div
              className="absolute w-2 h-2 bg-yellow-400 border border-blue-900 rounded-full pointer-events-none"
              style={{
                left: `${jakub.x * scaleX - 4}px`,
                top: `${jakub.y * scaleY - 4}px`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
