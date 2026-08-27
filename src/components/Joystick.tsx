import React, { useState, useRef, useCallback } from 'react';

interface JoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const pointerIdRef = useRef<number | null>(null);

  const radius = 46; // Maximum knob distance in pixels

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      setKnobPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
      return;
    }

    const clampedDist = Math.min(distance, radius);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    // Normalized vector -1 to 1
    const normX = knobX / radius;
    const normY = knobY / radius;
    onMove({ x: normX, y: normY });
  }, [onMove, radius]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    pointerIdRef.current = e.pointerId;
    try {
      container.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || e.pointerId !== pointerIdRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      if (containerRef.current && pointerIdRef.current !== null && containerRef.current.hasPointerCapture(pointerIdRef.current)) {
        containerRef.current.releasePointerCapture(pointerIdRef.current);
      }
    } catch {
      // ignore
    }
    pointerIdRef.current = null;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  return (
    <div
      id="mobile-joystick-wrapper"
      className="fixed bottom-24 left-4 sm:bottom-28 sm:left-8 z-40 select-none touch-none pointer-events-auto"
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <div
        ref={containerRef}
        id="virtual-joystick-pad"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1a1a1a]/85 backdrop-blur-md border-2 ${
          isDragging ? 'border-[#b8860b] shadow-[0_0_15px_rgba(184,134,11,0.35)]' : 'border-[#4a3728]/80 shadow-2xl'
        } flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors touch-none`}
        style={{ touchAction: 'none' }}
      >
        {/* Crosshair guide lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-full h-[1px] bg-[#b8860b]" />
          <div className="h-full w-[1px] bg-[#b8860b] absolute" />
        </div>

        {/* Direction indicators */}
        <div className="absolute top-1 text-[8px] font-mono text-[#b8860b]/70 pointer-events-none">▲</div>
        <div className="absolute bottom-1 text-[8px] font-mono text-[#b8860b]/70 pointer-events-none">▼</div>
        <div className="absolute left-1.5 text-[8px] font-mono text-[#b8860b]/70 pointer-events-none">◄</div>
        <div className="absolute right-1.5 text-[8px] font-mono text-[#b8860b]/70 pointer-events-none">►</div>

        {/* Inner concentric ring */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-[#4a3728]/60 pointer-events-none flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#b8860b]/40" />
        </div>

        {/* Movable Thumb Knob */}
        <div
          id="virtual-joystick-knob"
          className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0c100e] border-2 border-[#b8860b] shadow-lg flex items-center justify-center pointer-events-none transition-transform duration-75"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-[#b8860b] shadow-[0_0_8px_#b8860b] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
