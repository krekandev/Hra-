import { Hero, Enemy, EnemyType, Projectile, Particle, SlashEffect, SlamEffect, FloatingText, LootOrb, HeroId, DialogueLine, SkillCooldown, RelicItem, Waystone, FestivalChallenge } from '../types';
import { GameWorld, MAP_WIDTH, MAP_HEIGHT } from './map';
import { PixelRenderer } from './sprites';
import { sound } from './sound';
import { STORY_CHAPTERS, VICTORY_DIALOGUE, AVAILABLE_RELICS, FESTIVAL_CHALLENGES } from './story';

export interface GameCallbacks {
  onDialogueStart: (lines: DialogueLine[], onComplete?: () => void) => void;
  onChapterUpdate: (chapter: any, currentKills: number) => void;
  onHeroStatsUpdate: (heroes: Hero[], cooldowns: SkillCooldown) => void;
  onRelicChoice: (relics: RelicItem[], onSelect: (relic: RelicItem) => void) => void;
  onFestivalChallenge: (challenge: FestivalChallenge, onShot: (shot: number) => void, onComplete: () => void) => void;
  onGameOver: (score: number) => void;
  onVictory: (score: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private isDialogueActive: boolean = false;

  // World & Camera
  public world: GameWorld;
  public cameraX: number = 480;
  public cameraY: number = 450;
  public cameraShake: number = 0;
  private animFrameCounter: number = 0;

  // Heroes (Jakub, Šimi, Filip)
  public jakub: Hero;
  public simi: Hero;
  public filip: Hero;
  public heroes: Hero[] = [];

  // Entities
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public slashes: SlashEffect[] = [];
  public slams: SlamEffect[] = [];
  public floatingTexts: FloatingText[] = [];
  public lootOrbs: LootOrb[] = [];
  public activeRelics: RelicItem[] = [];

  // Folklore Skill Cooldowns (in seconds)
  public cooldowns: SkillCooldown = {
    q: { current: 0, max: 2.0, name: "Jakubova Valaška (I / Q)", desc: "Sek ostrou zbojníckou valaškou nablízko." },
    w: { current: 0, max: 2.8, name: "Šimiho Heligónka (O / W)", desc: "Vystrelí hľadajúci magický sonický tón z heligónky." },
    e: { current: 0, max: 4.2, name: "Filipov Dupák (P / E)", desc: "Mocný zbojnícky dupák, ktorý zatrasie zemou a odhodí nepriateľov." },
  };

  // Story & Festival Keys State
  public currentChapterIndex: number = 0;
  public chapterKills: number = 0;
  public totalKills: number = 0;
  public score: number = 0;
  public keysCollected: number = 0;
  public bossSpawned: boolean = false;
  public gameWon: boolean = false;
  public isDefeated: boolean = false;

  // NPC Samko position
  public samkoX: number = 460;
  public samkoY: number = 380;
  private samkoDialogueCooldown: number = 0;

  // Input State
  private keys: Record<string, boolean> = {};
  public joystickVector: { x: number; y: number } = { x: 0, y: 0 };
  private callbacks: GameCallbacks;

  // Wave spawn timer
  private spawnTimer: number = 0;

  // Custom audio trigger counters
  private jakubHitCounter: number = 0;
  private filipDamageHitCounter: number = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.callbacks = callbacks;
    this.world = new GameWorld();

    // 1. Jakub (Vodca družiny - Valaška)
    this.jakub = {
      id: 'jakub',
      name: 'Jakub',
      title: 'Zbojnícky Vodca',
      role: 'Valaška & Melee (I / Q)',
      color: '#3b82f6',
      accentColor: '#93c5fd',
      x: 480,
      y: 450,
      vx: 0,
      vy: 0,
      radius: 15,
      hp: 360,
      maxHp: 360,
      energy: 100,
      maxEnergy: 100,
      speed: 215,
      angle: 0,
      facing: 'right',
      attackCooldown: 0,
      state: 'idle',
      stateTimer: 0,
      level: 1,
      stats: { attackPower: 70, magicPower: 10, defense: 25, critChance: 0.20 }
    };

    // 2. Šimi (Heligónka & Magické sonické noty)
    this.simi = {
      id: 'simi',
      name: 'Šimi',
      title: 'Folklórny Mág',
      role: 'Heligónka (O / W)',
      color: '#a855f7',
      accentColor: '#d8b4fe',
      x: 440,
      y: 480,
      vx: 0,
      vy: 0,
      radius: 14,
      hp: 250,
      maxHp: 250,
      energy: 150,
      maxEnergy: 150,
      speed: 220,
      angle: 0,
      facing: 'right',
      attackCooldown: 0,
      state: 'idle',
      stateTimer: 0,
      level: 1,
      stats: { attackPower: 20, magicPower: 90, defense: 15, critChance: 0.20 }
    };

    // 3. Filip (Zbojnícky Dupák & Tank)
    this.filip = {
      id: 'filip',
      name: 'Filip',
      title: 'Tanečný Obr',
      role: 'Zbojnícky Dupák (P / E)',
      color: '#eab308',
      accentColor: '#fde047',
      x: 440,
      y: 420,
      vx: 0,
      vy: 0,
      radius: 17,
      hp: 500,
      maxHp: 500,
      energy: 100,
      maxEnergy: 100,
      speed: 210,
      angle: 0,
      facing: 'right',
      attackCooldown: 0,
      state: 'idle',
      stateTimer: 0,
      level: 1,
      stats: { attackPower: 55, magicPower: 15, defense: 42, critChance: 0.12 }
    };

    this.heroes = [this.jakub, this.simi, this.filip];

    this.initEventListeners();
    this.spawnInitialZoneMonsters();

    // Trigger Chapter 1 Opening Dialogue with Samko Szabó
    setTimeout(() => {
      this.triggerChapterDialogue(0);
    }, 400);
  }

  private initEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public destroy() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  public restart() {
    this.world = new GameWorld();
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.slashes = [];
    this.slams = [];
    this.floatingTexts = [];
    this.lootOrbs = [];
    this.activeRelics = [];

    this.currentChapterIndex = 0;
    this.chapterKills = 0;
    this.totalKills = 0;
    this.score = 0;
    this.keysCollected = 0;
    this.bossSpawned = false;
    this.gameWon = false;
    this.isDefeated = false;

    // Reset heroes
    this.jakub.hp = this.jakub.maxHp = 360;
    this.jakub.x = 480;
    this.jakub.y = 450;
    this.jakub.speed = 215;
    this.jakub.state = 'idle';

    this.simi.hp = this.simi.maxHp = 250;
    this.simi.x = 440;
    this.simi.y = 480;
    this.simi.speed = 220;
    this.simi.state = 'idle';

    this.filip.hp = this.filip.maxHp = 500;
    this.filip.x = 440;
    this.filip.y = 420;
    this.filip.speed = 210;
    this.filip.state = 'idle';

    this.cooldowns.q.current = 0;
    this.cooldowns.w.current = 0;
    this.cooldowns.e.current = 0;

    this.spawnInitialZoneMonsters();
    this.triggerChapterDialogue(0);
  }

  private cheatBuffer: string = '';

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keys[key] = true;

    // Cheat code: 'r', 't', 'z' (alebo 'r', 't', 'y') po sebe okamžite vyvolá finále s dievčatami
    this.cheatBuffer = (this.cheatBuffer + key).slice(-5);
    if (this.cheatBuffer.endsWith('rtz') || this.cheatBuffer.endsWith('rty') || key === 'v') {
      this.keysCollected = 3;
      this.currentChapterIndex = 3;
      this.jakub.x = 1400;
      this.jakub.y = 350;
      this.simi.x = 1380;
      this.simi.y = 380;
      this.filip.x = 1420;
      this.filip.y = 380;
      this.handleVictory();
      return;
    }

    if (this.isDialogueActive || this.isPaused || this.isDefeated || this.gameWon) return;

    // Ability I (or Q): Jakub - Sek valaškou
    if (key === 'i' || key === 'q') {
      this.castJakubSlash();
    }
    // Ability O (or W): Šimi - Magický tón z heligónky
    else if (key === 'o' || key === 'w') {
      this.castSimiMagic();
    }
    // Ability P (or E): Filip - Zbojnícky dupák
    else if (key === 'p' || key === 'e') {
      this.castFilipSlam();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keys[key] = false;
  };

  public setDialogueActive(active: boolean) {
    this.isDialogueActive = active;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public setJoystick(x: number, y: number) {
    this.joystickVector = { x, y };
  }

  // --- FOLKLORE COMBAT ABILITIES ---

  // 'I' / 'Q': Jakub - Sek zbojníckou valaškou
  public castJakubSlash() {
    if (this.cooldowns.q.current > 0 || this.jakub.hp <= 0) return;

    this.cooldowns.q.current = this.cooldowns.q.max;
    this.jakub.state = 'attacking';
    this.jakub.stateTimer = 0.25;

    sound.playSlash();
    this.addCameraShake(4);

    // Jakub voice line: once every 5 attacks
    this.jakubHitCounter++;
    if (this.jakubHitCounter % 5 === 0) {
      sound.playCustomAudio('jakub_zasah', 1.0);
      this.floatingTexts.push({
        id: Math.random().toString(),
        x: this.jakub.x,
        y: this.jakub.y - 45,
        text: '🗣️ Jakub: „Zásah!“',
        color: '#60a5fa',
        alpha: 1,
        life: 1.4,
        isCrit: true,
      });
    }

    let slashAngle = this.jakub.angle;
    if (this.jakub.facing === 'right') slashAngle = 0;
    if (this.jakub.facing === 'left') slashAngle = Math.PI;
    if (this.jakub.facing === 'down') slashAngle = Math.PI / 2;
    if (this.jakub.facing === 'up') slashAngle = -Math.PI / 2;

    const hasJanosik = this.activeRelics.some(r => r.id === 'janosikova_valaska');
    const slashRadius = hasJanosik ? 100 : 75;
    const slashCenterDist = 32;
    const slashX = this.jakub.x + Math.cos(slashAngle) * slashCenterDist;
    const slashY = this.jakub.y + Math.sin(slashAngle) * slashCenterDist;

    // Visual Golden Slash Arc
    this.slashes.push({
      id: Math.random().toString(),
      x: slashX,
      y: slashY,
      angle: slashAngle,
      radius: slashRadius,
      color: '#fbbf24',
      life: 0.22,
      maxLife: 0.22,
      arc: Math.PI * 0.9,
    });

    // Sparks
    for (let i = 0; i < 14; i++) {
      const sparkAngle = slashAngle - 0.7 + Math.random() * 1.4;
      const speed = 130 + Math.random() * 180;
      this.particles.push({
        x: slashX,
        y: slashY,
        vx: Math.cos(sparkAngle) * speed,
        vy: Math.sin(sparkAngle) * speed,
        size: 3 + Math.random() * 3,
        color: i % 2 === 0 ? '#fbbf24' : '#ffffff',
        alpha: 1,
        life: 0.25,
        maxLife: 0.25,
        shape: 'spark'
      });
    }

    // Damage enemies
    const critMult = hasJanosik ? 2.5 : 1.8;
    const isCrit = Math.random() < this.jakub.stats.critChance;
    const damage = this.jakub.stats.attackPower * (isCrit ? critMult : 1.0);

    this.enemies.forEach(enemy => {
      const dx = enemy.x - this.jakub.x;
      const dy = enemy.y - this.jakub.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < slashRadius + enemy.radius + 15) {
        const enemyAngle = Math.atan2(dy, dx);
        let angleDiff = Math.abs(enemyAngle - slashAngle);
        while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

        if (angleDiff < Math.PI * 0.55 || dist < 45) {
          this.damageEnemy(enemy, damage, isCrit, Math.cos(enemyAngle) * 230, Math.sin(enemyAngle) * 230);
        }
      }
    });
  }

  // 'O' / 'W': Šimi - Magický tón z heligónky
  public castSimiMagic() {
    if (this.cooldowns.w.current > 0 || this.simi.hp <= 0) return;

    this.cooldowns.w.current = this.cooldowns.w.max;
    this.simi.state = 'casting';
    this.simi.stateTimer = 0.3;

    sound.playMagic();

    let target = this.findNearestEnemy(this.simi.x, this.simi.y, 480);
    let targetAngle = this.simi.facing === 'left' ? Math.PI : 0;

    if (target) {
      targetAngle = Math.atan2(target.y - this.simi.y, target.x - this.simi.x);
    } else {
      targetAngle = this.jakub.facing === 'left' ? Math.PI : (this.jakub.facing === 'up' ? -Math.PI / 2 : (this.jakub.facing === 'down' ? Math.PI / 2 : 0));
    }

    const projSpeed = 440;
    this.projectiles.push({
      id: Math.random().toString(),
      owner: 'hero',
      heroId: 'simi',
      x: this.simi.x,
      y: this.simi.y - 4,
      vx: Math.cos(targetAngle) * projSpeed,
      vy: Math.sin(targetAngle) * projSpeed,
      radius: 11,
      damage: this.simi.stats.magicPower * 1.35,
      color: '#c084fc',
      trailColor: 'rgba(192, 132, 252, 0.45)',
      life: 1.6,
      maxLife: 1.6,
      pierce: 1,
      aoeRadius: 75,
      homingTargetId: target ? target.id : undefined,
      isNote: true,
    });

    // Musical note particles
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        x: this.simi.x,
        y: this.simi.y - 4,
        vx: Math.cos(a) * 50,
        vy: Math.sin(a) * 50,
        size: 10,
        color: '#e879f9',
        alpha: 1,
        life: 0.35,
        maxLife: 0.35,
        shape: 'music_note',
      });
    }
  }

  // 'P' / 'E': Filip - Zbojnícky dupák
  public castFilipSlam() {
    if (this.cooldowns.e.current > 0 || this.filip.hp <= 0) return;

    this.cooldowns.e.current = this.cooldowns.e.max;
    this.filip.state = 'charging';
    this.filip.stateTimer = 0.4;

    const forwardAngle = this.jakub.facing === 'left' ? Math.PI : (this.jakub.facing === 'up' ? -Math.PI / 2 : (this.jakub.facing === 'down' ? Math.PI / 2 : 0));
    const chargeDist = 70;
    const targetX = this.jakub.x + Math.cos(forwardAngle) * chargeDist;
    const targetY = this.jakub.y + Math.sin(forwardAngle) * chargeDist;

    this.filip.x = targetX;
    this.filip.y = targetY;

    sound.playSlam();
    this.addCameraShake(8);

    const hasBelt = this.activeRelics.some(r => r.id === 'zbojnocky_opasok');
    const maxRadius = hasBelt ? 150 : 110;

    // Slam shockwave
    this.slams.push({
      id: Math.random().toString(),
      x: this.filip.x,
      y: this.filip.y,
      radius: 20,
      maxRadius,
      color: '#f59e0b',
      life: 0.35,
      maxLife: 0.35,
    });

    // Dust & earth particles
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 100 + Math.random() * 180;
      this.particles.push({
        x: this.filip.x,
        y: this.filip.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        size: 4 + Math.random() * 4,
        color: i % 3 === 0 ? '#fbbf24' : (i % 3 === 1 ? '#d97706' : '#78350f'),
        alpha: 1,
        life: 0.4,
        maxLife: 0.4,
        shape: 'spark',
      });
    }

    const slamDamage = this.filip.stats.attackPower * 1.25;
    const knockbackForce = 420;

    this.enemies.forEach(enemy => {
      const dx = enemy.x - this.filip.x;
      const dy = enemy.y - this.filip.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxRadius + 10) {
        const angle = Math.atan2(dy, dx);
        this.damageEnemy(
          enemy,
          slamDamage,
          false,
          Math.cos(angle) * knockbackForce,
          Math.sin(angle) * knockbackForce
        );
      }
    });
  }

  // --- MONSTER SPAWN & ZONE PROGRESSION ---

  private spawnInitialZoneMonsters() {
    // Zone 1: Detvianski Zbojníci (lúka pod amfiteátrom)
    for (let i = 0; i < 6; i++) {
      this.spawnEnemy('zbojnik_novacik', 350 + Math.random() * 300, 750 + Math.random() * 350);
    }
  }

  public spawnEnemy(type: EnemyType, x: number, y: number): Enemy {
    const id = 'enemy_' + Math.random().toString(36).substring(2, 9);
    let hp = 90;
    let maxHp = 90;
    let speed = 95;
    let damage = 14;
    let radius = 14;
    let color = '#ec4899';
    let xpValue = 25;
    let isBoss = false;
    let name = 'Zbojník';

    if (type === 'zbojnik_novacik') {
      name = 'Zbojnícky Holobriadok';
      hp = maxHp = 85;
      speed = 105;
      damage = 12;
      radius = 13;
      color = '#ec4899';
      xpValue = 20;
    } else if (type === 'lesny_lupeznik') {
      name = 'Lesný Lúpežník';
      hp = maxHp = 150;
      speed = 125;
      damage = 22;
      radius = 15;
      color = '#f97316';
      xpValue = 35;
    } else if (type === 'horsky_zbojnik') {
      name = 'Horský Zbojník';
      hp = maxHp = 300;
      speed = 75;
      damage = 36;
      radius = 18;
      color = '#22c55e';
      xpValue = 65;
    } else if (type === 'detva_boss') {
      name = 'Detviansky Zbojnícky Bača';
      hp = maxHp = 1200;
      speed = 90;
      damage = 40;
      radius = 28;
      color = '#dc2626';
      xpValue = 300;
      isBoss = true;
    } else if (type === 'myjava_boss') {
      name = 'Myjavský Zbojnícky Kapitán';
      hp = maxHp = 1600;
      speed = 100;
      damage = 48;
      radius = 30;
      color = '#b45309';
      xpValue = 400;
      isBoss = true;
    } else if (type === 'terchova_boss') {
      name = 'Terchovský Jánošíkov Tieň';
      hp = maxHp = 2200;
      speed = 105;
      damage = 55;
      radius = 34;
      color = '#7e22ce';
      xpValue = 600;
      isBoss = true;
    }

    const enemy: Enemy = {
      id,
      type,
      name,
      x,
      y,
      vx: 0,
      vy: 0,
      radius,
      hp,
      maxHp,
      speed,
      damage,
      attackRange: radius + 15,
      attackCooldown: Math.random() * 1.5,
      maxAttackCooldown: isBoss ? 1.6 : 1.2,
      angle: 0,
      facing: 'right',
      knockbackX: 0,
      knockbackY: 0,
      color,
      xpValue,
      isBoss,
      bossPhase: isBoss ? 1 : undefined,
      bossAttackTimer: isBoss ? 3.0 : undefined,
    };

    this.enemies.push(enemy);
    return enemy;
  }

  public damageEnemy(enemy: Enemy, amount: number, isCrit: boolean, knockX: number = 0, knockY: number = 0) {
    if (enemy.hp <= 0) return;

    enemy.hp -= amount;
    enemy.knockbackX += knockX;
    enemy.knockbackY += knockY;

    sound.playHit();

    // Floating text in Slovak / numbers
    this.floatingTexts.push({
      id: Math.random().toString(),
      x: enemy.x + (Math.random() - 0.5) * 16,
      y: enemy.y - 12,
      text: Math.round(amount).toString() + (isCrit ? '!' : ''),
      color: isCrit ? '#fbbf24' : '#ffffff',
      alpha: 1,
      life: 0.6,
      isCrit,
    });

    // Blood / Folklore spark particles
    for (let i = 0; i < (isCrit ? 8 : 4); i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(a) * (60 + Math.random() * 80),
        vy: Math.sin(a) * (60 + Math.random() * 80),
        size: 2.5,
        color: enemy.color,
        alpha: 1,
        life: 0.25,
        maxLife: 0.25,
        shape: 'spark'
      });
    }

    if (enemy.hp <= 0) {
      this.handleEnemyDeath(enemy);
    }
  }

  private handleEnemyDeath(enemy: Enemy) {
    sound.playEnemyDeath();
    this.score += enemy.xpValue * 10;
    this.totalKills++;
    this.chapterKills++;

    // Boss death drops Festival Key
    if (enemy.isBoss) {
      this.keysCollected++;
      this.lootOrbs.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y,
        type: 'key',
        value: 100,
        color: '#fbbf24',
        life: 60,
      });

      this.floatingTexts.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y - 25,
        text: 'ZÍSKANÝ FESTIVALOVÝ KĽÚČ! 🗝️',
        color: '#fbbf24',
        alpha: 1,
        life: 1.8,
        isCrit: true
      });
    } else if (Math.random() < 0.45) {
      // Health / Dukáty
      this.lootOrbs.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y,
        type: Math.random() < 0.6 ? 'health' : 'gold',
        value: 50,
        color: '#10b981',
        life: 25,
      });
    }

    // Story / Wave Progress Check
    const currentChapter = STORY_CHAPTERS[this.currentChapterIndex];
    if (currentChapter && !currentChapter.completed) {
      this.callbacks.onChapterUpdate(currentChapter, this.chapterKills);

      // Only advance chapter when the chapter boss is defeated!
      if (enemy.isBoss) {
        currentChapter.bossDefeated = true;
        this.advanceChapter();
      }
    }
  }

  public spawnChapterBoss(bossType: EnemyType) {
    this.bossSpawned = true;
    sound.playBossRoar();
    sound.playCustomAudio('simon_podme_na_nich', 1.0);
    this.addCameraShake(12);

    this.floatingTexts.push({
      id: Math.random().toString(),
      x: this.simi.x,
      y: this.simi.y - 45,
      text: '🗣️ Šimon: „Poďme na nich!“',
      color: '#c084fc',
      alpha: 1,
      life: 2.5,
      isCrit: true,
    });

    let spawnX = this.jakub.x;
    let spawnY = this.jakub.y - 180;

    if (bossType === 'detva_boss') {
      spawnX = 480;
      spawnY = 1350;
      // Minions
      this.spawnEnemy('zbojnik_novacik', 420, 1370);
      this.spawnEnemy('zbojnik_novacik', 540, 1370);
    } else if (bossType === 'terchova_boss') {
      spawnX = 2200;
      spawnY = 1400;
      // Minions
      this.spawnEnemy('lesny_lupeznik', 2130, 1420);
      this.spawnEnemy('lesny_lupeznik', 2270, 1420);
    } else if (bossType === 'myjava_boss') {
      spawnX = 1500;
      spawnY = 550;
      // Minions
      this.spawnEnemy('horsky_zbojnik', 1440, 570);
      this.spawnEnemy('horsky_zbojnik', 1560, 570);
    }

    this.spawnEnemy(bossType, spawnX, spawnY);

    this.floatingTexts.push({
      id: Math.random().toString(),
      x: spawnX,
      y: spawnY - 35,
      text: '⚔️ RITUÁL TOTEMU AKTIVOVANÝ! BOS POVSTAL!',
      color: '#ef4444',
      alpha: 1,
      life: 2.5,
      isCrit: true,
    });
  }

  private advanceChapter() {
    const current = STORY_CHAPTERS[this.currentChapterIndex];
    current.completed = true;
    current.keyCollected = true;
    sound.playLevelUp();

    // Update obstacles and barricades in the world
    this.world.updateUnlocks(this.keysCollected);

    this.currentChapterIndex++;
    this.chapterKills = 0;
    this.bossSpawned = false;

    if (this.currentChapterIndex < STORY_CHAPTERS.length) {
      const nextChapter = STORY_CHAPTERS[this.currentChapterIndex];
      this.callbacks.onChapterUpdate(nextChapter, 0);

      this.floatingTexts.push({
        id: Math.random().toString(),
        x: this.jakub.x,
        y: this.jakub.y - 45,
        text: `🗺️ NOVÁ OBLASŤ ODOMKNUTÁ: ${nextChapter.festivalName.toUpperCase()}!`,
        color: '#86efac',
        alpha: 1,
        life: 2.8,
        isCrit: true
      });

      this.offerRelicSelection();
    } else {
      this.handleVictory();
    }
  }

  private offerRelicSelection() {
    const available = AVAILABLE_RELICS.filter(r => !this.activeRelics.some(ar => ar.id === r.id));
    const choices = available.slice(0, 3);

    if (choices.length > 0) {
      this.isPaused = true;
      this.callbacks.onRelicChoice(choices, (selectedRelic) => {
        this.applyRelic(selectedRelic);
        this.isPaused = false;
        this.triggerChapterDialogue(this.currentChapterIndex);
      });
    } else {
      this.triggerChapterDialogue(this.currentChapterIndex);
    }
  }

  public applyRelic(relic: RelicItem) {
    this.activeRelics.push(relic);
    sound.playPickup();

    if (relic.bonus.speed) {
      const mult = 1 + relic.bonus.speed / 100;
      this.jakub.speed *= mult;
      this.simi.speed *= mult;
      this.filip.speed *= mult;
    }
    if (relic.bonus.cooldownReduction) {
      const red = 1 - relic.bonus.cooldownReduction / 100;
      this.cooldowns.q.max *= red;
      this.cooldowns.w.max *= red;
      this.cooldowns.e.max *= red;
    }
    if (relic.bonus.health) {
      this.heroes.forEach(h => {
        h.maxHp += relic.bonus.health!;
        h.hp = h.maxHp;
      });
    }
    if (relic.id === 'janosikova_valaska') {
      this.jakub.stats.attackPower += 35;
      this.jakub.stats.critChance += 0.25;
    }
    if (relic.id === 'zlata_heligonka') {
      this.simi.stats.magicPower += 40;
    }
    if (relic.id === 'zbojnocky_opasok') {
      this.filip.stats.attackPower += 25;
      this.filip.stats.defense += 20;
    }
  }

  public triggerChapterDialogue(index: number) {
    const chapter = STORY_CHAPTERS[index];
    if (!chapter || !chapter.dialogueTrigger) return;

    this.isDialogueActive = true;
    this.callbacks.onDialogueStart(chapter.dialogueTrigger, () => {
      this.isDialogueActive = false;
      this.onChapterDialogueEnded(index);
    });
  }

  private onChapterDialogueEnded(index: number) {
    if (index === 1) {
      // Myjava: Spawn Lesní Lúpežníci
      for (let i = 0; i < 8; i++) {
        this.spawnEnemy('lesny_lupeznik', 1250 + Math.random() * 300, 480 + Math.random() * 200);
      }
    } else if (index === 2) {
      // Terchová: Spawn Horskí Zbojníci
      for (let i = 0; i < 6; i++) {
        this.spawnEnemy('horsky_zbojnik', 2050 + Math.random() * 300, 1300 + Math.random() * 250);
        this.spawnEnemy('lesny_lupeznik', 2150 + Math.random() * 250, 1400 + Math.random() * 200);
      }
    }
  }

  private checkCastleGateInteraction() {
    // Castle gate at x: 1400, y: 260
    const dx = this.jakub.x - 1400;
    const dy = this.jakub.y - 280;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 90 && !this.gameWon) {
      if (this.keysCollected >= 3) {
        // Unlock Castle and win!
        this.handleVictory();
      } else {
        // Warning that keys are missing
        if (Math.random() < 0.03) {
          this.floatingTexts.push({
            id: Math.random().toString(),
            x: 1400,
            y: 220,
            text: `BRÁNA JE ZAMKNUTÁ! Potrebujete 3 kľúče z festivalov (${this.keysCollected}/3)`,
            color: '#ef4444',
            alpha: 1,
            life: 1.2,
          });
        }
      }
    }
  }

  private checkSamkoInteraction(dt: number) {
    this.samkoDialogueCooldown -= dt;
    const dx = this.jakub.x - this.samkoX;
    const dy = this.jakub.y - this.samkoY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 60 && this.samkoDialogueCooldown <= 0) {
      this.samkoDialogueCooldown = 15;
      const samkoLines: DialogueLine[] = [
        {
          speaker: 'Samko Szabó',
          speakerHeroId: 'samko',
          mood: 'normal',
          text: `Držím vám palce, chlapci! Zatiaľ máte ${this.keysCollected} z 3 festivalových kľúčov. Dievčatá na Hrade čakajú!`
        }
      ];
      this.callbacks.onDialogueStart(samkoLines);
    }
  }

  private handleVictory() {
    this.gameWon = true;
    sound.playLevelUp();
    this.callbacks.onDialogueStart(VICTORY_DIALOGUE, () => {
      this.callbacks.onVictory(this.score);
    });
  }

  // --- MAIN LOOP ---

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  private loop = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (!this.isPaused && !this.isDialogueActive && !this.isDefeated && !this.gameWon) {
      this.update(dt);
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.animFrameCounter++;

    // Ability Cooldowns
    if (this.cooldowns.q.current > 0) this.cooldowns.q.current = Math.max(0, this.cooldowns.q.current - dt);
    if (this.cooldowns.w.current > 0) this.cooldowns.w.current = Math.max(0, this.cooldowns.w.current - dt);
    if (this.cooldowns.e.current > 0) this.cooldowns.e.current = Math.max(0, this.cooldowns.e.current - dt);

    // Passive regeneration from Tatranská Slivovica relic
    if (this.activeRelics.some(r => r.id === 'tatranska_slivovica')) {
      this.heroes.forEach(h => {
        if (h.hp > 0 && h.hp < h.maxHp) {
          h.hp = Math.min(h.maxHp, h.hp + 3 * dt);
        }
      });
    }

    // 1. Update Player Jakub (Leader)
    let moveX = 0;
    let moveY = 0;

    if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    if (moveX !== 0 && moveY !== 0 && Math.abs(this.joystickVector.x) < 0.01 && Math.abs(this.joystickVector.y) < 0.01) {
      moveX *= 0.7071;
      moveY *= 0.7071;
    }

    // Virtual Joystick blend
    if (Math.abs(this.joystickVector.x) > 0.01 || Math.abs(this.joystickVector.y) > 0.01) {
      moveX += this.joystickVector.x;
      moveY += this.joystickVector.y;
      const mag = Math.hypot(moveX, moveY);
      if (mag > 1) {
        moveX /= mag;
        moveY /= mag;
      }
    }

    if (Math.abs(moveX) > 0.05 || Math.abs(moveY) > 0.05) {
      this.jakub.state = 'walking';
      if (Math.abs(moveX) > Math.abs(moveY)) {
        this.jakub.facing = moveX < 0 ? 'left' : 'right';
      } else {
        this.jakub.facing = moveY < 0 ? 'up' : 'down';
      }
      this.jakub.angle = Math.atan2(moveY, moveX);
    } else if (this.jakub.state !== 'attacking') {
      this.jakub.state = 'idle';
    }

    this.jakub.vx = moveX * this.jakub.speed;
    this.jakub.vy = moveY * this.jakub.speed;

    this.jakub.x += this.jakub.vx * dt;
    this.jakub.y += this.jakub.vy * dt;

    const jakubCol = this.world.checkObstacleCollision(this.jakub.x, this.jakub.y, this.jakub.radius);
    if (jakubCol.hit) {
      this.jakub.x += jakubCol.pushX;
      this.jakub.y += jakubCol.pushY;
    }

    // 2. Update AI Companions (Šimi & Filip)
    this.updateCompanionAI(this.simi, 'right', dt);
    this.updateCompanionAI(this.filip, 'left', dt);

    // 3. Update Camera
    const targetCamX = this.jakub.x;
    const targetCamY = this.jakub.y;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    this.cameraY += (targetCamY - this.cameraY) * 0.1;

    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 15);
    }

    // 4. Update Effects
    this.slashes.forEach(s => s.life -= dt);
    this.slashes = this.slashes.filter(s => s.life > 0);

    this.slams.forEach(s => s.life -= dt);
    this.slams = this.slams.filter(s => s.life > 0);

    // 5. Update Projectiles
    this.updateProjectiles(dt);

    // 6. Update Enemies AI
    this.updateEnemies(dt);

    // 7. Update Particles & Loot
    this.updateParticlesAndLoot(dt);

    // 8. Ambient Zbojníci spawning
    this.handleAmbientSpawning(dt);

    // 9. Waystones & Castle interactions
    this.checkWaystones();
    this.checkCastleGateInteraction();
    this.checkSamkoInteraction(dt);

    // 10. Update UI callback
    this.callbacks.onHeroStatsUpdate(this.heroes, this.cooldowns);
  }

  private updateCompanionAI(companion: Hero, flankSide: 'left' | 'right', dt: number) {
    if (companion.hp <= 0) return;

    const leaderAngle = this.jakub.angle;
    const sideOffset = flankSide === 'left' ? -Math.PI * 0.65 : Math.PI * 0.65;
    const formationDist = 42;

    const targetX = this.jakub.x + Math.cos(leaderAngle + sideOffset) * formationDist;
    const targetY = this.jakub.y + Math.sin(leaderAngle + sideOffset) * formationDist;

    const dx = targetX - companion.x;
    const dy = targetY - companion.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 8) {
      const followSpeed = dist > 90 ? companion.speed * 1.4 : companion.speed;
      const angle = Math.atan2(dy, dx);
      companion.vx = Math.cos(angle) * followSpeed;
      companion.vy = Math.sin(angle) * followSpeed;
      companion.state = 'walking';
      companion.facing = companion.vx < 0 ? 'left' : 'right';
    } else {
      companion.vx = 0;
      companion.vy = 0;
      if (companion.state !== 'casting' && companion.state !== 'charging') {
        companion.state = 'idle';
      }
      companion.facing = this.jakub.facing;
    }

    // Repulsion from other heroes
    this.heroes.forEach(other => {
      if (other.id !== companion.id) {
        const hdx = companion.x - other.x;
        const hdy = companion.y - other.y;
        const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
        const minDist = companion.radius + other.radius + 6;
        if (hdist < minDist && hdist > 0.001) {
          companion.x += (hdx / hdist) * (minDist - hdist) * 0.5;
          companion.y += (hdy / hdist) * (minDist - hdist) * 0.5;
        }
      }
    });

    companion.x += companion.vx * dt;
    companion.y += companion.vy * dt;

    const col = this.world.checkObstacleCollision(companion.x, companion.y, companion.radius);
    if (col.hit) {
      companion.x += col.pushX;
      companion.y += col.pushY;
    }

    // Auto-attack assist
    companion.attackCooldown -= dt;
    if (companion.attackCooldown <= 0) {
      const nearbyEnemy = this.findNearestEnemy(companion.x, companion.y, companion.id === 'simi' ? 180 : 45);
      if (nearbyEnemy) {
        companion.attackCooldown = 1.4;
        if (companion.id === 'simi') {
          const sparkAngle = Math.atan2(nearbyEnemy.y - companion.y, nearbyEnemy.x - companion.x);
          this.projectiles.push({
            id: Math.random().toString(),
            owner: 'hero',
            heroId: 'simi',
            x: companion.x,
            y: companion.y,
            vx: Math.cos(sparkAngle) * 320,
            vy: Math.sin(sparkAngle) * 320,
            radius: 6,
            damage: 25,
            color: '#a855f7',
            trailColor: 'rgba(168, 85, 247, 0.3)',
            life: 0.9,
            maxLife: 0.9,
            pierce: 1,
            isNote: true,
          });
        } else if (companion.id === 'filip') {
          this.damageEnemy(nearbyEnemy, 32, false, (nearbyEnemy.x - companion.x) * 3, (nearbyEnemy.y - companion.y) * 3);
        }
      }
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;

      if (p.homingTargetId) {
        const target = this.enemies.find(e => e.id === p.homingTargetId && e.hp > 0);
        if (target) {
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) {
            const desiredVx = (dx / dist) * 440;
            const desiredVy = (dy / dist) * 440;
            p.vx += (desiredVx - p.vx) * 0.15;
            p.vy += (desiredVy - p.vy) * 0.15;
          }
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Particle trail
      if (Math.random() < 0.6) {
        this.particles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20,
          size: 2.5,
          color: p.color,
          alpha: 0.8,
          life: 0.18,
          maxLife: 0.18,
          shape: p.isNote ? 'music_note' : 'spark'
        });
      }

      // Check hit
      if (p.owner === 'hero') {
        let hit = false;
        for (const enemy of this.enemies) {
          const dx = enemy.x - p.x;
          const dy = enemy.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < enemy.radius + p.radius) {
            hit = true;
            sound.playMagicBurst();

            if (p.aoeRadius) {
              this.enemies.forEach(e => {
                const edx = e.x - p.x;
                const edy = e.y - p.y;
                const edist = Math.sqrt(edx * edx + edy * edy);
                if (edist < p.aoeRadius! + e.radius) {
                  const splashDamage = p.damage * (1 - (edist / (p.aoeRadius! + e.radius)) * 0.4);
                  this.damageEnemy(e, splashDamage, false, edx * 1.5, edy * 1.5);
                }
              });
            } else {
              this.damageEnemy(enemy, p.damage, false, p.vx * 0.2, p.vy * 0.2);
            }

            p.pierce--;
            if (p.pierce <= 0) break;
          }
        }
        if (hit && p.pierce <= 0) {
          p.life = 0;
        }
      }

      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.hp <= 0) {
        this.enemies.splice(i, 1);
        continue;
      }

      enemy.x += enemy.knockbackX * dt;
      enemy.y += enemy.knockbackY * dt;
      enemy.knockbackX *= 0.85;
      enemy.knockbackY *= 0.85;

      const targetHero = this.findClosestHero(enemy.x, enemy.y);
      if (!targetHero) continue;

      const dx = targetHero.x - enemy.x;
      const dy = targetHero.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      enemy.facing = dx < 0 ? 'left' : 'right';

      if (dist > enemy.attackRange) {
        const moveSpeed = enemy.speed;
        enemy.vx = (dx / dist) * moveSpeed;
        enemy.vy = (dy / dist) * moveSpeed;
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;
      } else {
        enemy.vx = 0;
        enemy.vy = 0;
      }

      const col = this.world.checkObstacleCollision(enemy.x, enemy.y, enemy.radius);
      if (col.hit) {
        enemy.x += col.pushX;
        enemy.y += col.pushY;
      }

      enemy.attackCooldown -= dt;
      if (enemy.attackCooldown <= 0 && dist <= enemy.attackRange + 12) {
        enemy.attackCooldown = enemy.maxAttackCooldown;
        this.damageHero(targetHero, enemy.damage);
      }

      if (enemy.isBoss) {
        enemy.bossAttackTimer = (enemy.bossAttackTimer || 3) - dt;
        if (enemy.bossAttackTimer <= 0) {
          enemy.bossAttackTimer = 3.2;
          this.executeBossAbility(enemy);
        }
      }
    }
  }

  private executeBossAbility(boss: Enemy) {
    sound.playBossRoar();
    this.addCameraShake(6);

    // 8-directional zbojnícke projektily
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8 + Math.random() * 0.2;
      const spd = 210;
      this.projectiles.push({
        id: Math.random().toString(),
        owner: 'enemy',
        x: boss.x,
        y: boss.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        radius: 8,
        damage: 28,
        color: '#dc2626',
        trailColor: 'rgba(220, 38, 38, 0.4)',
        life: 2.2,
        maxLife: 2.2,
        pierce: 1,
      });
    }

    if (this.enemies.length < 10) {
      this.spawnEnemy('zbojnik_novacik', boss.x - 60, boss.y);
      this.spawnEnemy('zbojnik_novacik', boss.x + 60, boss.y);
    }
  }

  public damageHero(hero: Hero, amount: number) {
    if (hero.hp <= 0) return;

    const actualDamage = Math.max(5, amount * (1 - hero.stats.defense / 100));
    hero.hp = Math.max(0, hero.hp - actualDamage);

    sound.playHeroHurt();

    // Custom audio: Filip "Dostali ma" every 10 hits on Filip
    if (hero.id === 'filip') {
      this.filipDamageHitCounter++;
      if (this.filipDamageHitCounter % 10 === 0) {
        sound.playCustomAudio('filip_dostali_ma', 1.0);
        this.floatingTexts.push({
          id: Math.random().toString(),
          x: this.filip.x,
          y: this.filip.y - 45,
          text: '🗣️ Filip: „Dostali ma!“',
          color: '#f59e0b',
          alpha: 1,
          life: 1.4,
          isCrit: true,
        });
      }
    }

    this.addCameraShake(3);

    this.floatingTexts.push({
      id: Math.random().toString(),
      x: hero.x,
      y: hero.y - 14,
      text: '-' + Math.round(actualDamage),
      color: '#f87171',
      alpha: 1,
      life: 0.6,
    });

    if (this.jakub.hp <= 0) {
      this.handlePartyDefeat();
    }
  }

  private handlePartyDefeat() {
    this.isDefeated = true;
    this.callbacks.onGameOver(this.score);
  }

  private updateParticlesAndLoot(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= dt;
      t.y -= 30 * dt;
      t.alpha = Math.max(0, t.life / 0.6);
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    for (let i = this.lootOrbs.length - 1; i >= 0; i--) {
      const orb = this.lootOrbs[i];
      orb.life -= dt;

      for (const hero of this.heroes) {
        const dx = hero.x - orb.x;
        const dy = hero.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < hero.radius + 18) {
          sound.playPickup();
          if (orb.type === 'health') {
            this.heroes.forEach(h => h.hp = Math.min(h.maxHp, h.hp + orb.value));
            this.floatingTexts.push({
              id: Math.random().toString(),
              x: hero.x,
              y: hero.y - 12,
              text: '+' + orb.value + ' HP (Žinčica)',
              color: '#34d399',
              alpha: 1,
              life: 0.7,
            });
          } else if (orb.type === 'key') {
            this.score += 500;
          } else {
            this.score += orb.value * 5;
          }
          this.lootOrbs.splice(i, 1);
          break;
        }
      }
    }
  }

  private handleAmbientSpawning(dt: number) {
    this.spawnTimer += dt;
    if (this.spawnTimer > 4.5 && this.enemies.length < 8 && !this.bossSpawned) {
      this.spawnTimer = 0;
      const angle = Math.random() * Math.PI * 2;
      const dist = 380 + Math.random() * 120;
      const sx = Math.max(80, Math.min(MAP_WIDTH - 80, this.jakub.x + Math.cos(angle) * dist));
      const sy = Math.max(80, Math.min(MAP_HEIGHT - 80, this.jakub.y + Math.sin(angle) * dist));

      const type: EnemyType = this.currentChapterIndex === 0 ? 'zbojnik_novacik' : (this.currentChapterIndex === 1 ? 'lesny_lupeznik' : 'horsky_zbojnik');
      this.spawnEnemy(type, sx, sy);
    }
  }

  private totemInteractCooldown: number = 0;

  private checkWaystones(dt: number = 0.016) {
    if (this.totemInteractCooldown > 0) {
      this.totemInteractCooldown -= dt;
    }

    this.world.waystones.forEach(w => {
      const dx = this.jakub.x - w.x;
      const dy = this.jakub.y - w.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < w.radius + this.jakub.radius) {
        // Start Chalúpka: Heal Shrine
        if (w.id === 'start_chalupka') {
          const needsHeal = this.heroes.some(h => h.hp < h.maxHp);
          if (needsHeal && this.totemInteractCooldown <= 0) {
            this.totemInteractCooldown = 3.0;
            sound.playLevelUp();
            this.heroes.forEach(h => h.hp = h.maxHp);
            this.floatingTexts.push({
              id: Math.random().toString(),
              x: w.x,
              y: w.y - 30,
              text: 'CHALÚPKA: PLNÉ ZDRAVIE OBNOVENÉ! 🍶',
              color: '#38bdf8',
              alpha: 1,
              life: 1.6,
            });
          }
          return;
        }

        // Festival Totems
        if (w.isTotem) {
          const currentChapter = STORY_CHAPTERS[this.currentChapterIndex];

          // 1. Detva Totem (Zone 1)
          if (w.zone === 1) {
            if (this.currentChapterIndex === 0) {
              if (!this.bossSpawned && !w.completed) {
                this.triggerFestivalChallenge(1, w, currentChapter);
              }
            } else if (w.completed && this.totemInteractCooldown <= 0) {
              this.totemInteractCooldown = 2.5;
              this.floatingTexts.push({
                id: Math.random().toString(),
                x: w.x,
                y: w.y - 30,
                text: 'FESTIVAL DETVA JE OSLOBODENÝ! 🗝️',
                color: '#fef08a',
                alpha: 1,
                life: 1.5,
              });
            }
          }

          // 2. Terchová Totem (Zone 2)
          else if (w.zone === 2) {
            if (this.currentChapterIndex === 1) {
              if (!this.bossSpawned && !w.completed) {
                this.triggerFestivalChallenge(2, w, currentChapter);
              }
            } else if (this.currentChapterIndex < 1 && this.totemInteractCooldown <= 0) {
              this.totemInteractCooldown = 2.5;
              this.floatingTexts.push({
                id: Math.random().toString(),
                x: w.x,
                y: w.y - 30,
                text: '🔒 NAJPRV OSLOBOĎ DETVU A ZÍSKAJ 1. KĽÚČ!',
                color: '#f87171',
                alpha: 1,
                life: 1.8,
              });
            } else if (w.completed && this.totemInteractCooldown <= 0) {
              this.totemInteractCooldown = 2.5;
              this.floatingTexts.push({
                id: Math.random().toString(),
                x: w.x,
                y: w.y - 30,
                text: 'FESTIVAL TERCHOVÁ JE OSLOBODENÝ! 🗝️',
                color: '#fef08a',
                alpha: 1,
                life: 1.5,
              });
            }
          }

          // 3. Myjava Totem (Zone 3)
          else if (w.zone === 3) {
            if (this.currentChapterIndex === 2) {
              if (!this.bossSpawned && !w.completed) {
                this.triggerFestivalChallenge(3, w, currentChapter);
              }
            } else if (this.currentChapterIndex < 2 && this.totemInteractCooldown <= 0) {
              this.totemInteractCooldown = 2.5;
              this.floatingTexts.push({
                id: Math.random().toString(),
                x: w.x,
                y: w.y - 30,
                text: '🔒 NAJPRV OSLOBOĎ TERCHOVÚ A ZÍSKAJ 2. KĽÚČ!',
                color: '#f87171',
                alpha: 1,
                life: 1.8,
              });
            } else if (w.completed && this.totemInteractCooldown <= 0) {
              this.totemInteractCooldown = 2.5;
              this.floatingTexts.push({
                id: Math.random().toString(),
                x: w.x,
                y: w.y - 30,
                text: 'FESTIVAL MYJAVA JE OSLOBODENÝ! 🗝️',
                color: '#fef08a',
                alpha: 1,
                life: 1.5,
              });
            }
          }

          // 4. Northern Castle Altar (Zone 4)
          else if (w.zone === 4) {
            if (this.keysCollected >= 3 && !this.gameWon) {
              w.completed = true;
              this.handleVictory();
            } else if (this.keysCollected < 3 && this.totemInteractCooldown <= 0) {
              this.totemInteractCooldown = 2.5;
              this.floatingTexts.push({
                id: Math.random().toString(),
                x: w.x,
                y: w.y - 30,
                text: `🔒 POTREBUJEŠ 3 KĽÚČE! (Máš ${this.keysCollected}/3)`,
                color: '#f87171',
                alpha: 1,
                life: 2.0,
              });
            }
          }
        }
      }
    });
  }

  private triggerFestivalChallenge(zoneIndex: number, w: Waystone, currentChapter: any) {
    const challenge = FESTIVAL_CHALLENGES[zoneIndex];
    if (!challenge) {
      w.bossSpawned = true;
      w.activated = true;
      currentChapter.totemActivated = true;
      currentChapter.bossSpawned = true;
      const bType: EnemyType = zoneIndex === 1 ? 'detva_boss' : (zoneIndex === 2 ? 'terchova_boss' : 'myjava_boss');
      this.spawnChapterBoss(bType);
      return;
    }

    this.isPaused = true;
    this.callbacks.onFestivalChallenge(
      challenge,
      (goalIndex: number) => {
        // Heal whole party and restore energy
        this.heroes.forEach(h => {
          if (h.hp > 0) {
            h.hp = Math.min(h.maxHp, h.hp + challenge.healPerGoal);
            h.energy = Math.min(h.maxEnergy, h.energy + challenge.energyPerGoal);
          }
        });
        this.floatingTexts.push({
          id: Math.random().toString(),
          x: this.jakub.x,
          y: this.jakub.y - 45,
          text: `✨ SKÚŠKA #${goalIndex} SPLNENÁ! +${challenge.healPerGoal} HP +${challenge.energyPerGoal} ENERGIA`,
          color: '#34d399',
          alpha: 1,
          life: 1.8,
          isCrit: true,
        });
      },
      () => {
        this.isPaused = false;
        w.bossSpawned = true;
        w.activated = true;
        currentChapter.totemActivated = true;
        currentChapter.bossSpawned = true;
        this.spawnChapterBoss(challenge.bossType);
      }
    );
  }

  private findClosestHero(x: number, y: number): Hero | null {
    let closest: Hero | null = null;
    let minD = Infinity;

    this.heroes.forEach(h => {
      if (h.hp > 0) {
        const d = (h.x - x) ** 2 + (h.y - y) ** 2;
        if (d < minD) {
          minD = d;
          closest = h;
        }
      }
    });

    return closest;
  }

  private findNearestEnemy(x: number, y: number, maxDist: number = 500): Enemy | null {
    let nearest: Enemy | null = null;
    let minD = maxDist * maxDist;

    this.enemies.forEach(e => {
      if (e.hp > 0) {
        const d = (e.x - x) ** 2 + (e.y - y) ** 2;
        if (d < minD) {
          minD = d;
          nearest = e;
        }
      }
    });

    return nearest;
  }

  private addCameraShake(amount: number) {
    this.cameraShake = Math.min(15, this.cameraShake + amount);
  }

  // --- RENDERING ---

  private render() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const shakeX = (Math.random() - 0.5) * this.cameraShake;
    const shakeY = (Math.random() - 0.5) * this.cameraShake;

    ctx.save();
    ctx.translate(
      Math.floor(width / 2 - this.cameraX + shakeX),
      Math.floor(height / 2 - this.cameraY + shakeY)
    );

    // 1. Ground Map
    this.world.renderGround(ctx, this.cameraX, this.cameraY, width, height, this.animFrameCounter);

    // 2. Waystones
    this.world.waystones.forEach(w => PixelRenderer.drawWaystone(ctx, w, this.animFrameCounter));

    // 3. Ground Slams
    this.slams.forEach(s => PixelRenderer.drawSlam(ctx, s));

    // 4. Loot Orbs & Festival Keys
    this.lootOrbs.forEach(orb => PixelRenderer.drawLootOrb(ctx, orb, this.animFrameCounter));

    // 5. Y-Sorted Entities (Obstacles, NPCs, Enemies, Heroes, Girls in Castle)
    const renderEntities: Array<{ y: number; draw: () => void }> = [];

    // Obstacles
    this.world.obstacles.forEach(obs => {
      renderEntities.push({
        y: obs.y + obs.height,
        draw: () => PixelRenderer.drawObstacle(ctx, obs, this.animFrameCounter)
      });
    });

    // NPC Samko Szabó
    renderEntities.push({
      y: this.samkoY + 12,
      draw: () => PixelRenderer.drawSamko(ctx, this.samkoX, this.samkoY, this.animFrameCounter)
    });

    // Girls in Castle (x: 1400, y: 160)
    renderEntities.push({
      y: 180,
      draw: () => PixelRenderer.drawGirlsInCastle(ctx, 1400, 140, this.animFrameCounter)
    });

    // Enemies (only drawn if within discovered territory)
    this.enemies.forEach(enemy => {
      if (this.isZoneDiscovered(enemy.x, enemy.y)) {
        renderEntities.push({
          y: enemy.y,
          draw: () => PixelRenderer.drawEnemy(ctx, enemy, this.animFrameCounter)
        });
      }
    });

    // Heroes
    if (this.jakub.hp > 0) {
      renderEntities.push({
        y: this.jakub.y,
        draw: () => PixelRenderer.drawJakub(ctx, this.jakub, this.animFrameCounter)
      });
    }
    if (this.simi.hp > 0) {
      renderEntities.push({
        y: this.simi.y,
        draw: () => PixelRenderer.drawSimi(ctx, this.simi, this.animFrameCounter)
      });
    }
    if (this.filip.hp > 0) {
      renderEntities.push({
        y: this.filip.y,
        draw: () => PixelRenderer.drawFilip(ctx, this.filip, this.animFrameCounter)
      });
    }

    renderEntities.sort((a, b) => a.y - b.y);
    renderEntities.forEach(e => e.draw());

    // 6. Slashes
    this.slashes.forEach(s => PixelRenderer.drawSlash(ctx, s));

    // 7. Projectiles
    this.projectiles.forEach(p => {
      if (this.isZoneDiscovered(p.x, p.y)) {
        PixelRenderer.drawProjectile(ctx, p);
      }
    });

    // 8. Particles
    this.particles.forEach(p => PixelRenderer.drawParticle(ctx, p));

    // 9. Floating Combat Text
    this.floatingTexts.forEach(t => PixelRenderer.drawFloatingText(ctx, t));

    // 10. Fog of War / Undiscovered Region Darkness
    this.renderFogOfWar(ctx);

    ctx.restore();

    // 11. Screen Vignette
    this.renderScreenVignette(ctx, width, height);
  }

  public isZoneDiscovered(x: number, y: number): boolean {
    // Castle area: y < 280
    if (y < 280) {
      return this.keysCollected >= 3;
    }
    // East side of the river: x >= 990
    if (x >= 990) {
      // Myjava area: y < 1040
      if (y < 1040) {
        return this.keysCollected >= 2;
      }
      // Terchová area: y >= 1040
      return this.keysCollected >= 1;
    }
    // West side (Detva & Chalúpka) is always discovered from start
    return true;
  }

  private renderFogOfWar(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // 1. Severný Hrad (Zone 4) - Locked if keysCollected < 3
    if (this.keysCollected < 3) {
      this.drawDarkFogZone(ctx, 0, 0, MAP_WIDTH, 280, '🔒 SEVERNÝ HRAD (Zamknutá oblasť)');
    }

    // 2. Myjavské Kopanice (Zone 3) - Locked if keysCollected < 2
    if (this.keysCollected < 2) {
      this.drawDarkFogZone(ctx, 990, 280, MAP_WIDTH - 990, 760, '🔒 FESTIVAL MYJAVA (Zamknutá oblasť)');
    }

    // 3. Terchová (Zone 2) - Locked if keysCollected < 1
    if (this.keysCollected < 1) {
      this.drawDarkFogZone(ctx, 990, 1040, MAP_WIDTH - 990, MAP_HEIGHT - 1040, '🔒 FESTIVAL TERCHOVÁ (Zamknutá oblasť)');
    }

    ctx.restore();
  }

  private drawDarkFogZone(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string) {
    // Deep black fog overlay completely obscuring undiscovered territory
    ctx.fillStyle = 'rgba(3, 7, 18, 0.98)';
    ctx.fillRect(x, y, w, h);

    // Animated mystical dark mist swirls
    const time = this.animFrameCounter * 0.015;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    for (let i = 0; i < 4; i++) {
      const fx = x + ((Math.sin(time + i * 1.7) * 0.5 + 0.5) * (w - 200)) + 100;
      const fy = y + ((Math.cos(time * 0.8 + i * 1.3) * 0.5 + 0.5) * (h - 100)) + 50;
      ctx.beginPath();
      ctx.arc(fx, fy, 150, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centered ominous locked label
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.fillText(label, cx, cy);
  }

  private renderScreenVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
    grad.addColorStop(0, 'rgba(5, 8, 16, 0)');
    grad.addColorStop(1, 'rgba(5, 8, 16, 0.65)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
