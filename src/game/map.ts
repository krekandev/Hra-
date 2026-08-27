import { MapObstacle, Waystone } from '../types';

export const MAP_WIDTH = 2800;
export const MAP_HEIGHT = 2000;
export const TILE_SIZE = 40;

export interface TileMapData {
  cols: number;
  rows: number;
  tiles: number[][]; // 0 = lúčna tráva, 1 = horská tmavá tráva, 2 = kamenistá cesta, 3 = hradné dlaždice, 4 = potok/voda, 5 = festivalové pódium
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

        // Northern Castle Courtyard (Hrad na severe: y < 350 && worldX between 950 and 1850)
        if (worldY < 320 && worldX >= 950 && worldX <= 1850) {
          tile = 3; // Hradné kamenné nádvorie
        }

        // Festival Areas
        // 1. Detva Festival Arena (South-West: x: 300-750, y: 1250-1650)
        if (worldX >= 300 && worldX <= 750 && worldY >= 1250 && worldY <= 1650) {
          tile = (c + r) % 3 === 0 ? 5 : 0;
        }

        // 2. Terchová Festival Arena (South-East: x: 1950-2500, y: 1200-1750)
        if (worldX >= 1950 && worldX <= 2500 && worldY >= 1200 && worldY <= 1750) {
          tile = (c + r) % 3 === 0 ? 5 : 1;
        }

        // 3. Myjava Festival Arena (East / North-East: x: 1350-1750, y: 450-850)
        if (worldX >= 1350 && worldX <= 1750 && worldY >= 450 && worldY <= 850) {
          tile = (c + r) % 3 === 0 ? 5 : 0;
        }

        // Slovak Pathway Network
        // 1. Path from Start Chalúpka (480, 450) south to Detva Road & Totem (480, 1450)
        const isDetvaRoad = Math.abs(worldX - 480) < 45 && worldY >= 450 && worldY <= 1550;
        // 2. Road East across river to Terchová (from 480, 1450 across bridge at 1000, 1450 to 2200, 1450)
        const isTerchovaRoad = Math.abs(worldY - 1450) < 45 && worldX >= 450 && worldX <= 2300;
        // 3. Road North from Terchová crossroads to Myjava (from 1400, 1450 up to Myjava at 1500, 650)
        const isMyjavaRoad = Math.abs(worldX - 1400) < 45 && worldY >= 600 && worldY <= 1450;
        // 4. Road from Myjava to Northern Castle Gate (from 1400, 600 up to 1400, 260)
        const isCastleRoad = Math.abs(worldX - 1400) < 50 && worldY >= 240 && worldY <= 650;
        // 5. Local path around start chalúpka
        const isStartCrossroad = Math.abs(worldY - 450) < 45 && worldX >= 250 && worldX <= 600;

        if (isDetvaRoad || isTerchovaRoad || isMyjavaRoad || isCastleRoad || isStartCrossroad) {
          tile = 2; // Kamenistá cesta
        }

        // Horský Potok / River crossing at x = 1000 (continuous natural barrier between Detva and Eastern regions)
        const isRiver = Math.abs(worldX - 1000) < 45 && worldY >= 280;
        const isBridgeSouth = isRiver && Math.abs(worldY - 1450) < 50; // JEDINÝ most do Terchovej cez rieku

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
    // 1. Boundary Trees / Hory (Impassable borders of the world)
    for (let x = 0; x < MAP_WIDTH; x += 55) {
      this.obstacles.push({ x, y: 0, width: 55, height: 40, type: 'tree' });
      this.obstacles.push({ x, y: MAP_HEIGHT - 50, width: 55, height: 50, type: 'tree' });
    }
    for (let y = 0; y < MAP_HEIGHT; y += 55) {
      this.obstacles.push({ x: 0, y, width: 40, height: 55, type: 'tree' });
      this.obstacles.push({ x: MAP_WIDTH - 50, y, width: 50, height: 55, type: 'tree' });
    }

    // 2. Start Location: Stará Slovenská Chalúpka & Drevený Plot
    this.obstacles.push({ x: 340, y: 350, width: 110, height: 95, type: 'chalupka' });
    this.obstacles.push({ x: 260, y: 360, width: 70, height: 24, type: 'fence' });
    this.obstacles.push({ x: 260, y: 390, width: 24, height: 60, type: 'fence' });
    this.obstacles.push({ x: 290, y: 460, width: 45, height: 40, type: 'haystack' });

    // 3. NORTHERN CASTLE IMPASSABLE WALL (Spans the full width of the world at y: 220-280)
    // ONLY passage into Severný Hrad is through the locked castle gate at x: 1330 - 1470
    for (let x = 0; x < MAP_WIDTH; x += 60) {
      if (x >= 1300 && x <= 1460) continue; // Opening for Castle Gate
      this.obstacles.push({ x, y: 220, width: 62, height: 75, type: 'castle_wall' });
    }
    
    // Castle Main Locked Gate (Requires all 3 keys to unlock: lockedByChapter: 3)
    this.obstacles.push({
      id: 'castle_gate',
      x: 1330,
      y: 220,
      width: 140,
      height: 75,
      type: 'castle_gate',
      lockedByChapter: 3,
      unlocked: false,
      label: 'Hradná Brána (Vyžaduje 3 Kľúče)'
    });

    // 4. POTOK / RIVER OBSTACLES (Blocks crossing from Detva to Terchová / East from y=280 to MAP_HEIGHT)
    for (let y = 280; y < MAP_HEIGHT - 50; y += 36) {
      const isBridge = Math.abs(y - 1450) < 45;
      if (!isBridge) {
        this.obstacles.push({ x: 975, y, width: 55, height: 38, type: 'water' });
      }
    }

    // 5. Zone 1: Detva Festival Arena (Amfiteáter, vyrezávané kríže, vatra)
    this.obstacles.push({ x: 450, y: 1350, width: 80, height: 60, type: 'festival_stage' });
    this.obstacles.push({ x: 380, y: 1320, width: 30, height: 30, type: 'fire' });
    this.obstacles.push({ x: 550, y: 1320, width: 30, height: 30, type: 'fire' });
    this.obstacles.push({ x: 320, y: 1480, width: 45, height: 40, type: 'haystack' });

    // BARRICADE 1: Cesta do Terchovej (Jediný most na rieke cez prechod na východ do Terchovej)
    // Flanked by dense fences on the bridge edges so players cannot slip around
    this.obstacles.push({ x: 975, y: 1395, width: 55, height: 25, type: 'fence' });
    this.obstacles.push({
      id: 'barricade_terchova',
      x: 975,
      y: 1420,
      width: 55,
      height: 60,
      type: 'barricade',
      lockedByChapter: 1,
      unlocked: false,
      label: 'Zbojnícka Barikáda do Terchovej (Vyžaduje Kľúč z Detvy)'
    });
    this.obstacles.push({ x: 975, y: 1480, width: 55, height: 25, type: 'fence' });

    // 6. Zone 2: Terchová Festival Arena (South-East)
    this.obstacles.push({ x: 2150, y: 1400, width: 90, height: 65, type: 'festival_stage' });
    this.obstacles.push({ x: 2060, y: 1360, width: 30, height: 30, type: 'fire' });
    this.obstacles.push({ x: 2260, y: 1360, width: 30, height: 30, type: 'fire' });
    this.obstacles.push({ x: 2000, y: 1520, width: 30, height: 30, type: 'fire' });
    this.obstacles.push({ x: 2320, y: 1520, width: 30, height: 30, type: 'fire' });

    // BARRICADE 2 FENCE LINE: Full continuous fence line between Terchová and Myjava at y = 1040
    // Spans all the way from the River (x = 1000) to the East Edge (x = 2800)
    for (let x = 1000; x < MAP_WIDTH; x += 50) {
      if (x >= 1350 && x <= 1425) continue; // Opening for the road barricade
      this.obstacles.push({ x, y: 1040, width: 52, height: 36, type: 'fence' });
    }

    // BARRICADE 2: Cesta do Myjavy (Guards the only opening at the road x: 1365..1435)
    this.obstacles.push({
      id: 'barricade_myjava',
      x: 1365,
      y: 1035,
      width: 70,
      height: 45,
      type: 'barricade',
      lockedByChapter: 2,
      unlocked: false,
      label: 'Zbojnícka Barikáda do Myjavy (Vyžaduje Kľúč z Terchovej)'
    });

    // 7. Zone 3: Myjava Festival Arena (East / North-East)
    this.obstacles.push({ x: 1500, y: 550, width: 80, height: 60, type: 'festival_stage' });
    this.obstacles.push({ x: 1430, y: 520, width: 30, height: 30, type: 'fire' });
    this.obstacles.push({ x: 1600, y: 520, width: 30, height: 30, type: 'fire' });
    this.obstacles.push({ x: 1680, y: 640, width: 45, height: 40, type: 'haystack' });

    // 8. Slovenské Smreky & Duby (Forest groves)
    const forestTrees = [
      { x: 180, y: 220 }, { x: 620, y: 200 }, { x: 740, y: 320 },
      { x: 200, y: 650 }, { x: 380, y: 720 }, { x: 550, y: 620 },
      { x: 250, y: 1000 }, { x: 650, y: 1050 }, { x: 780, y: 1200 },
      { x: 1150, y: 750 }, { x: 1250, y: 950 }, { x: 1100, y: 1200 },
      { x: 1650, y: 950 }, { x: 1850, y: 1150 }, { x: 1750, y: 1350 },
      { x: 2050, y: 900 }, { x: 2350, y: 950 }, { x: 2550, y: 1200 },
      { x: 2450, y: 1650 }, { x: 1850, y: 1650 }, { x: 1250, y: 1650 }
    ];
    forestTrees.forEach(t => {
      this.obstacles.push({ x: t.x, y: t.y, width: 50, height: 60, type: 'tree' });
    });
  }

  private initWaystones() {
    this.waystones = [
      {
        id: 'start_chalupka',
        x: 480,
        y: 450,
        radius: 28,
        name: 'Štart: Stará Slovenská Chalúpka',
        activated: true,
        zone: 0,
        isTotem: false
      },
      {
        id: 'totem_detva',
        x: 480,
        y: 1450,
        radius: 36,
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
        x: 2200,
        y: 1450,
        radius: 36,
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
        x: 1500,
        y: 650,
        radius: 36,
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
        x: 1400,
        y: 300,
        radius: 40,
        name: 'Hradný Oltár (Záchrana Dievčat)',
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
