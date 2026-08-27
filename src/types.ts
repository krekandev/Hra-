export type HeroId = 'jakub' | 'simi' | 'filip';

export interface Hero {
  id: HeroId;
  name: string;
  title: string;
  role: string;
  color: string;
  accentColor: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  speed: number;
  angle: number;
  facing: 'left' | 'right' | 'up' | 'down';
  attackCooldown: number;
  state: 'idle' | 'walking' | 'attacking' | 'charging' | 'casting';
  stateTimer: number;
  level: number;
  stats: {
    attackPower: number;
    magicPower: number;
    defense: number;
    critChance: number;
  };
}

export type EnemyType = 'zbojnik_novacik' | 'lesny_lupeznik' | 'horsky_zbojnik' | 'detva_boss' | 'myjava_boss' | 'terchova_boss';

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  maxAttackCooldown: number;
  angle: number;
  facing: 'left' | 'right';
  knockbackX: number;
  knockbackY: number;
  color: string;
  xpValue: number;
  isBoss?: boolean;
  bossPhase?: number;
  bossAttackTimer?: number;
  castTimer?: number;
  zone?: number;
}

export interface Projectile {
  id: string;
  owner: 'hero' | 'enemy';
  heroId?: HeroId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  trailColor: string;
  life: number;
  maxLife: number;
  pierce: number;
  aoeRadius?: number;
  homingTargetId?: string;
  isNote?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'spark' | 'ring' | 'shockwave' | 'music_note';
  customData?: any;
}

export interface SlashEffect {
  id: string;
  x: number;
  y: number;
  angle: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  arc: number;
}

export interface SlamEffect {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  isCrit?: boolean;
}

export interface LootOrb {
  id: string;
  x: number;
  y: number;
  type: 'health' | 'energy' | 'gold' | 'key' | 'relic';
  value: number;
  color: string;
  life: number;
}

export interface DialogueLine {
  speaker: 'Jakub' | 'Šimi' | 'Filip' | 'Samko Szabó' | 'Dievčatá zo súboru' | 'Zbojnícky Bača' | 'Rozprávač';
  speakerHeroId?: HeroId | 'samko' | 'girls' | 'boss' | 'narrator';
  text: string;
  portrait?: string;
  mood?: 'normal' | 'angry' | 'smug' | 'mysterious' | 'determined';
}

export interface StoryChapter {
  id: number;
  title: string;
  festivalName: string;
  objective: string;
  dialogueTrigger?: DialogueLine[];
  requiredKills?: number;
  zoneRequired?: number;
  completed: boolean;
  bossType?: EnemyType;
  bossSpawned?: boolean;
  bossDefeated?: boolean;
  totemActivated?: boolean;
  keyCollected: boolean;
  totemX?: number;
  totemY?: number;
}

export interface SkillCooldown {
  q: { current: number; max: number; name: string; desc: string };
  w: { current: number; max: number; name: string; desc: string };
  e: { current: number; max: number; name: string; desc: string };
}

export interface RelicItem {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  bonus: {
    hero: 'all' | 'jakub' | 'simi' | 'filip';
    attack?: number;
    cooldownReduction?: number;
    health?: number;
    speed?: number;
  };
}

export interface MapObstacle {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'tree' | 'chalupka' | 'castle_wall' | 'castle_gate' | 'festival_stage' | 'haystack' | 'fence' | 'water' | 'fire' | 'barricade' | 'totem';
  lockedByChapter?: number;
  unlocked?: boolean;
  label?: string;
}

export interface Waystone {
  id?: string;
  x: number;
  y: number;
  radius: number;
  name: string;
  activated: boolean;
  zone: number;
  festivalKey?: string;
  isTotem?: boolean;
  bossSpawned?: boolean;
  completed?: boolean;
}

export interface FestivalZone {
  id: number;
  name: string;
  x: number;
  y: number;
  radius: number;
  cleared: boolean;
}
