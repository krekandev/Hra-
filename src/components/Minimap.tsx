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
}) => {
  const mapWidth = 90;
  const mapHeight = 65;

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
          <span className="text-[6px] font-mono text-stone-400">2.8x2.0km</span>
        </div>

        <div
          className="relative bg-[#14532d] border border-[#57534e] rounded overflow-hidden"
          style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
        >
          {/* Northern Castle Zone */}
          <div
            className="absolute bg-slate-700 border border-slate-500 rounded-xs flex items-center justify-center text-[7px]"
            style={{
              left: `${950 * scaleX}px`,
              top: `${80 * scaleY}px`,
              width: `${900 * scaleX}px`,
              height: `${220 * scaleY}px`,
            }}
            title="Severný Hrad"
          >
            🏰
          </div>

          {/* Detva Festival Arena */}
          <div
            className="absolute bg-amber-800/80 rounded-full flex items-center justify-center text-[7px]"
            style={{
              left: `${480 * scaleX - 4}px`,
              top: `${1450 * scaleY - 4}px`,
              width: `8px`,
              height: `8px`,
            }}
            title="Festival Detva"
          >
            🎪
          </div>

          {/* Myjava Festival Arena */}
          <div
            className="absolute bg-amber-800/80 rounded-full flex items-center justify-center text-[7px]"
            style={{
              left: `${1500 * scaleX - 4}px`,
              top: `${650 * scaleY - 4}px`,
              width: `8px`,
              height: `8px`,
            }}
            title="Festival Myjava"
          >
            🎪
          </div>

          {/* Terchová Festival Arena */}
          <div
            className="absolute bg-amber-800/80 rounded-full flex items-center justify-center text-[7px]"
            style={{
              left: `${2200 * scaleX - 4}px`,
              top: `${1450 * scaleY - 4}px`,
              width: `8px`,
              height: `8px`,
            }}
            title="Festival Terchová"
          >
            🎪
          </div>

          {/* Start Chalúpka */}
          <div
            className="absolute bg-amber-950 flex items-center justify-center text-[6px]"
            style={{
              left: `${480 * scaleX - 3}px`,
              top: `${450 * scaleY - 3}px`,
              width: `6px`,
              height: `6px`,
            }}
            title="Stará Chalúpka"
          >
            🏠
          </div>

          {/* Enemies Dots (Red) */}
          {enemies.map((e) => (
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
