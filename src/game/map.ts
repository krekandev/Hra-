import { MapObstacle, Waystone } from '../types';

export const MAP_WIDTH = 3600;
export const MAP_HEIGHT = 2600;
export const TILE_SIZE = 40;

export interface TileMapData {
  cols: number;
  rows: number;
  tiles: number[][]; // 0 = lúčna tráva, 1 = horská tmavá tráva, 2 = kamenistá cesta, 3 = hradné dlaždice, 4 = potok/voda, 5 = festivalové pódium, 6 = drevená podlaha (dom/krčma)
}

export class GameWorld {
  public obstacles: MapObstacle[] = [];
  public waystones: Waystone[] = [];
  public tileData: TileMapData;

  constructor() {
    const cols = Math.ceil(MAP_WIDTH / TILE_SIZE);
    const rows = Math.ceil(MAP_HEIGHT / TILE_SIZE);
    const tiles: number[][] = [];

    // Procedural Slovak Folklore Landscape Tilemap
    for (let r = 0; r < rows; r++) {
      tiles[r] = [];
      for (let c = 0; c < cols; c++) {
        const worldX = c * TILE_SIZE;
        const worldY = r * TILE_SIZE;

        // Default lush green Slovak meadow
        let tile = (c + r) % 6 === 0 ? 1 : 0;

        // Northern Castle Courtyard (Hrad na severe: y < 380 && worldX between 1200 and 2400)
        if (worldY < 380 && worldX >= 1200 && worldX <= 2400) {
          tile = 3; // Hradné kamenné nádvorie
        }

        // Festival Areas:
        // 1. Detva Festival Arena (South-West: x: 350-950, y: 1650-2200)
        if (worldX >= 350 && worldX <= 950 && worldY >= 1650 && worldY <= 2200) {
          tile = (c + r) % 3 === 0 ? 5 : 0;
        }

        // 2. Terchová Festival Arena (South-East: x: 2550-3250, y: 1600-2300)
        if (worldX >= 2550 && worldX <= 3250 && worldY >= 1600 && worldY <= 2300) {
          tile = (c + r) % 3 === 0 ? 5 : 1;
        }

        // 3. Myjava Festival Arena (East / North-East: x: 1750-2350, y: 650-1200)
        if (worldX >= 1750 && worldX <= 2350 && worldY >= 650 && worldY <= 1200) {
          tile = (c + r) % 3 === 0 ? 5 : 0;
        }

        // 4. Zbojnícka Krčma (Crossroad Inn: x: 1100-1400, y: 1100-1350)
        if (worldX >= 1150 && worldX <= 1350 && worldY >= 1150 && worldY <= 1300) {
          tile = 6; // Drevená podlaha
        }

        // Slovak Pathway Network
        // 1. Path from Start Chalúpka (580, 550) south to Detva Road & Totem (580, 1950)
        const isDetvaRoad = Math.abs(worldX - 580) < 50 && worldY >= 450 && worldY <= 2100;
        // 2. Road East across river to Terchová (from 580, 1950 across bridge at 1350, 1950 to 2850, 1950)
        const isTerchovaRoad = Math.abs(worldY - 1950) < 50 && worldX >= 550 && worldX <= 3000;
        // 3. Road North from Terchová crossroads to Tavern and Myjava (from 1850, 1950 up to 1850, 900)
        const isMyjavaRoad = Math.abs(worldX - 1850) < 50 && worldY >= 800 && worldY <= 1950;
        // 4. Road from Myjava to Northern Castle Gate (from 1850, 800 up to 1850, 340)
        const isCastleRoad = Math.abs(worldX - 1850) < 55 && worldY >= 320 && worldY <= 850;
        // 5. Tavern branch road
        const isTavernRoad = Math.abs(worldY - 1250) < 45 && worldX >= 1200 && worldX <= 1850;

        if (isDetvaRoad || isTerchovaRoad || isMyjavaRoad || isCastleRoad || isTavernRoad) {
          tile = 2; // Kamenistá cesta
        }

        // Horský Potok / River crossing at x = 1350 (continuous barrier)
        const isRiver = Math.abs(worldX - 1350) < 55 && worldY >= 360;
        const isBridgeSouth = isRiver && Math.abs(worldY - 1950) < 60; // Most do Terchovej

        if (isRiver && !isBridgeSouth) {
          tile = 4; // Voda / Potok
        }

        tiles[r][c] = tile;
      }
    }

    this.tileData = { cols, rows, tiles };
    this.initObstacles();
    this.initWaystones();
  }

  private initObstacles() {
    // 1. Boundary Trees / Hory (Impassable borders)
    for (let x = 0; x < MAP_WIDTH; x += 55) {
      this.obstacles.push({ x, y: 0, width: 55, height: 45, type: 'tree' });
      this.obstacles.push({ x, y: MAP_HEIGHT - 50, width: 55, height: 50, type: 'tree' });
    }
    for (let y = 0; y < MAP_HEIGHT; y += 55) {
      this.obstacles.push({ x: 0, y, width: 45, height: 55, type: 'tree' });
      this.obstacles.push({ x: MAP_WIDTH - 50, y, width: 50, height: 55, type: 'tree' });
    }

    // 2. Start Location: Náš Rodný Dom (Chalúpka s dverami & Zberateľskou Sieňou)
    this.obstacles.push({ id: 'our_home', x: 420, y: 430, width: 140, height: 110, type: 'chalupka', label: 'Náš Domov (Sieň Trofejí)' });
    this.obstacles.push({ id: 'home_door', x: 470, y: 535, width: 40, height: 20, type: 'home_door', label: 'Vstúpiť do Domu [E / Klik]' });
    this.obstacles.push({ x: 340, y: 450, width: 75, height: 24, type: 'fence' });
    this.obstacles.push({ x: 340, y: 480, width: 24, height: 70, type: 'fence' });
    this.obstacles.push({ x: 380, y: 560, width: 45, height: 40, type: 'haystack' });

    // 3. NORTHERN CASTLE WALL & GATE (Hermetically sealed except locked gate)
    for (let x = 0; x < MAP_WIDTH; x += 55) {
      if (x >= 1760 && x <= 1930) continue; // Opening for Castle Gate
      this.obstacles.push({ x, y: 300, width: 56, height: 95, type: 'castle_wall' });
    }
    
    this.obstacles.push({
      id: 'castle_gate',
      x: 1760,
      y: 300,
      width: 170,
      height: 95,
      type: 'castle_gate',
      lockedByChapter: 3,
      unlocked: false,
      label: 'Hradná Brána (Vyžaduje 3 Kľúče)'
    });

    // 4. POTOK / RIVER OBSTACLES (Hermetically sealed from y=0 to y=MAP_HEIGHT except locked bridge)
    for (let y = 0; y < MAP_HEIGHT; y += 35) {
      const isBridge = Math.abs(y - 1950) < 45;
      if (!isBridge) {
        this.obstacles.push({ x: 1310, y, width: 80, height: 40, type: 'water' });
      }
    }

    // 5. Zbojnícka Krčma (U Zbojníka) - Minihry Páka & Rytmický Tanec
    this.obstacles.push({
      id: 'tavern_building',
      x: 1160,
      y: 1140,
      width: 160,
      height: 120,
      type: 'tavern',
      label: 'Zbojnícka Krčma (Súboj v Páke & Tanec pri Vatre)'
    });
    this.obstacles.push({ x: 1340, y: 1200, width: 35, height: 35, type: 'fire', label: 'Tanečná Vatra' });

    // 6. Zone 1: Detva Festival Arena (Amfiteáter, Stánky, Hľadisko)
    this.obstacles.push({ id: 'detva_stage', x: 520, y: 1820, width: 120, height: 80, type: 'festival_stage', label: 'Detvianske Pódium' });
    this.obstacles.push({ x: 420, y: 1780, width: 55, height: 35, type: 'booth', label: 'Jarmok: Detvianske Vybíjané Valašky' });
    this.obstacles.push({ x: 670, y: 1780, width: 55, height: 35, type: 'booth', label: 'Jarmok: Podpolianske Bryndzové Halušky' });
    this.obstacles.push({ x: 400, y: 1960, width: 100, height: 25, type: 'bench' });
    this.obstacles.push({ x: 400, y: 2000, width: 100, height: 25, type: 'bench' });
    this.obstacles.push({ x: 650, y: 1960, width: 100, height: 25, type: 'bench' });
    this.obstacles.push({ x: 650, y: 2000, width: 100, height: 25, type: 'bench' });

    // BARRICADE 1: Cesta do Terchovej cez rieku
    this.obstacles.push({ x: 1320, y: 1890, width: 60, height: 25, type: 'fence' });
    this.obstacles.push({
      id: 'barricade_terchova',
      x: 1320,
      y: 1915,
      width: 60,
      height: 70,
      type: 'barricade',
      lockedByChapter: 1,
      unlocked: false,
      label: 'Zbojnícka Barikáda do Terchovej (Vyžaduje Kľúč z Detvy)'
    });
    this.obstacles.push({ x: 1320, y: 1985, width: 60, height: 25, type: 'fence' });

    // 7. Zone 2: Terchová Festival Arena
    this.obstacles.push({ id: 'terchova_stage', x: 2800, y: 1850, width: 130, height: 85, type: 'festival_stage', label: 'Jánošíkove Dni: Pódium' });
    this.obstacles.push({ x: 2680, y: 1800, width: 60, height: 35, type: 'booth', label: 'Stánok: Terchovský Korbáčik & Žinčica' });
    this.obstacles.push({ x: 2970, y: 1800, width: 60, height: 35, type: 'booth', label: 'Stánok: Zbojnícke Opasky' });
    this.obstacles.push({ x: 2700, y: 2020, width: 120, height: 25, type: 'bench' });
    this.obstacles.push({ x: 2700, y: 2060, width: 120, height: 25, type: 'bench' });

    // BARRICADE 2: Medzi Terchovou a Myjavou (Hermetický plot od rieky až po východný okraj mapy)
    for (let x = 1350; x < MAP_WIDTH; x += 50) {
      if (x >= 1810 && x <= 1890) continue; // Opening for the locked road barricade
      this.obstacles.push({ x, y: 1445, width: 52, height: 50, type: 'fence' });
    }
    this.obstacles.push({
      id: 'barricade_myjava',
      x: 1810,
      y: 1440,
      width: 85,
      height: 60,
      type: 'barricade',
      lockedByChapter: 2,
      unlocked: false,
      label: 'Zbojnícka Barikáda do Myjavy (Vyžaduje Kľúč z Terchovej)'
    });

    // 8. Zone 3: Myjava Festival Arena
    this.obstacles.push({ id: 'myjava_stage', x: 1950, y: 780, width: 120, height: 80, type: 'festival_stage', label: 'Myjavské Folklórne Slávnosti' });
    this.obstacles.push({ x: 1840, y: 740, width: 55, height: 35, type: 'booth', label: 'Stánok: Myjavská Slivovica & Medovníky' });
    this.obstacles.push({ x: 2100, y: 740, width: 55, height: 35, type: 'booth', label: 'Stánok: Kopaničiarske Kroje' });
    // 9. Forest Groves
    const forestTrees = [
      { x: 220, y: 280 }, { x: 750, y: 300 }, { x: 920, y: 450 },
      { x: 250, y: 850 }, { x: 450, y: 920 }, { x: 700, y: 800 },
      { x: 300, y: 1300 }, { x: 800, y: 1350 }, { x: 950, y: 1550 },
      { x: 1550, y: 950 }, { x: 1650, y: 1250 }, { x: 1450, y: 1550 },
      { x: 2150, y: 1250 }, { x: 2450, y: 1450 }, { x: 2250, y: 1750 },
      { x: 2650, y: 1100 }, { x: 3050, y: 1200 }, { x: 3300, y: 1500 },
      { x: 3200, y: 2200 }, { x: 2400, y: 2250 }, { x: 1600, y: 2250 }
    ];
    forestTrees.forEach(t => {
      this.obstacles.push({ x: t.x, y: t.y, width: 55, height: 65, type: 'tree' });
    });
  }

  private initWaystones() {
    this.waystones = [
      {
        id: 'start_chalupka',
        x: 490,
        y: 540,
        radius: 50,
        name: 'Štart: Náš Rodný Dom',
        activated: true,
        zone: 0,
        isTotem: false
      },
      {
        id: 'waystone_tavern',
        x: 1240,
        y: 1270,
        radius: 55,
        name: 'Zbojnícka Krčma (Páka & Tanec)',
        activated: true,
        zone: 0,
        isTotem: false
      },
      {
        id: 'totem_detva',
        x: 580,
        y: 1950,
        radius: 40,
        name: 'Festivalový Totem Detva',
        activated: false,
        zone: 1,
        festivalKey: 'Kľúč z Detvy',
        isTotem: true,
        bossSpawned: false,
        completed: false
      },
      {
        id: 'totem_terchova',
        x: 2850,
        y: 1950,
        radius: 40,
        name: 'Festivalový Totem Terchová',
        activated: false,
        zone: 2,
        festivalKey: 'Kľúč z Terchovej',
        isTotem: true,
        bossSpawned: false,
        completed: false
      },
      {
        id: 'totem_myjava',
        x: 1950,
        y: 850,
        radius: 40,
        name: 'Festivalový Totem Myjava',
        activated: false,
        zone: 3,
        festivalKey: 'Kľúč z Myjavy',
        isTotem: true,
        bossSpawned: false,
        completed: false
      },
      {
        id: 'totem_castle',
        x: 1850,
        y: 350,
        radius: 45,
        name: 'Hradný Oltár (Grandfinále & Záchrana Dievčat)',
        activated: false,
        zone: 4,
        isTotem: true,
        bossSpawned: false,
        completed: false
      }
    ];
  }

  // Update barricades unlock status based on keys collected
  public updateUnlocks(keysCount: number) {
    this.obstacles.forEach(obs => {
      if (obs.lockedByChapter !== undefined) {
        if (keysCount >= obs.lockedByChapter) {
          obs.unlocked = true;
        } else {
          obs.unlocked = false;
        }
      }
    });
  }

  // Draw Ground Layer
  public renderGround(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, viewW: number, viewH: number, animFrame: number) {
    const startCol = Math.max(0, Math.floor((cameraX - viewW / 2) / TILE_SIZE) - 1);
    const endCol = Math.min(this.tileData.cols, Math.ceil((cameraX + viewW / 2) / TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor((cameraY - viewH / 2) / TILE_SIZE) - 1);
    const endRow = Math.min(this.tileData.rows, Math.ceil((cameraY + viewH / 2) / TILE_SIZE) + 1);

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const tile = this.tileData.tiles[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (tile === 0) {
          // Lush Slovak Meadow Grass
          ctx.fillStyle = '#22542a';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          // Grass flowers & blades (bielo-žlté lúčne kvety)
          ctx.fillStyle = '#2e6f38';
          ctx.fillRect(x + 6, y + 8, 3, 5);
          ctx.fillRect(x + 24, y + 22, 3, 5);
          if ((c + r * 3) % 5 === 0) {
            ctx.fillStyle = '#fef08a'; // Púpava
            ctx.fillRect(x + 16, y + 14, 2, 2);
          } else if ((c + r * 2) % 7 === 0) {
            ctx.fillStyle = '#ffffff'; // Sedmokráska
            ctx.fillRect(x + 30, y + 6, 2, 2);
          }
        } else if (tile === 1) {
          // Dark Mountain Grass (Horská lúka)
          ctx.fillStyle = '#163e20';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#0f2c17';
          ctx.fillRect(x + 10, y + 12, 4, 4);
          ctx.fillRect(x + 28, y + 6, 3, 4);
        } else if (tile === 2) {
          // Slovak Dirt & Cobblestone Path (Kamenistá cesta)
          ctx.fillStyle = '#574836';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#423729';
          ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#6e5d47';
          ctx.fillRect(x + 4, y + 6, 10, 8);
          ctx.fillRect(x + 20, y + 18, 14, 10);
        } else if (tile === 3) {
          // Castle Courtyard Stone Flagstones (Hradná kamenná dlažba)
          ctx.fillStyle = '#334155';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#475569';
          ctx.fillRect(x + 6, y + 6, 12, 12);
        } else if (tile === 4) {
          // Horský Potok (Priezračná modrá voda s vlnkami)
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          const wave = Math.sin(animFrame * 0.1 + c + r) * 3;
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 4, y + 12 + wave, 22, 3);
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(x + 14, y + 24 - wave, 18, 3);
        } else if (tile === 5) {
          // Festival Stage Wooden Planks (Drevené dosky amfiteátra)
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);
        }
      }
    }
  }

  // Check circle-rectangle collision with obstacles (skips unlocked barricades/gates)
  public checkObstacleCollision(cx: number, cy: number, radius: number): { hit: boolean; pushX: number; pushY: number } {
    let hit = false;
    let pushX = 0;
    let pushY = 0;

    for (const obs of this.obstacles) {
      if (obs.unlocked) continue; // Unlocked barricade or gate does not block

      const closestX = Math.max(obs.x, Math.min(cx, obs.x + obs.width));
      const closestY = Math.max(obs.y, Math.min(cy, obs.y + obs.height));

      const dx = cx - closestX;
      const dy = cy - closestY;
      const distSq = dx * dx + dy * dy;

      if (distSq < radius * radius && distSq > 0.0001) {
        hit = true;
        const dist = Math.sqrt(distSq);
        const overlap = radius - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        pushX += nx * overlap;
        pushY += ny * overlap;
      }
    }

    // World Boundaries
    if (cx - radius < 0) { hit = true; pushX += -(cx - radius); }
    if (cx + radius > MAP_WIDTH) { hit = true; pushX -= (cx + radius - MAP_WIDTH); }
    if (cy - radius < 0) { hit = true; pushY += -(cy - radius); }
    if (cy + radius > MAP_HEIGHT) { hit = true; pushY -= (cy + radius - MAP_HEIGHT); }

    return { hit, pushX, pushY };
  }
}
