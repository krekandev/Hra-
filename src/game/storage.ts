import { CollectibleItem } from '../types';

const STORAGE_KEY_COLLECTIBLES = 'cesta_za_dievcatami_collectibles_v1';
const STORAGE_KEY_DUKATY = 'cesta_za_dievcatami_dukaty_v1';

export const INITIAL_COLLECTIBLES: CollectibleItem[] = [
  {
    id: 'fujara_detva',
    name: 'Vyrezávaná Detvianska Fujara',
    category: 'instrument',
    icon: '🪈',
    description: 'Tradičná drevená fujara zdobená podpolianskymi motívmi. Zvyšuje silu Šimiho mágie o +20%.',
    unlocked: false,
    bonusText: '+20% Magické poškodenie'
  },
  {
    id: 'opasok_janosik',
    name: 'Jánošíkov Sedemprackový Opasok',
    category: 'garment',
    icon: '🥋',
    description: 'Legendárny opasok kovaný v Terchovej. Poskytuje +100 Max HP a znižuje poškodenie o 15%.',
    unlocked: false,
    bonusText: '+100 HP, -15% Prijaté poškodenie'
  },
  {
    id: 'valaska_zbojnicka',
    name: 'Vybíjaná Zbojnícka Valaška',
    category: 'relic',
    icon: '🪓',
    description: 'Ostrá oceľová valaška vyvážená na rýchly boj. Jakub ňou seká s +30% dosahom a kritickým úderom.',
    unlocked: false,
    bonusText: '+30% Útok valašky'
  },
  {
    id: 'kroj_myjava',
    name: 'Kopaničiarsky Sviatočný Kroj',
    category: 'garment',
    icon: '👘',
    description: 'Ručne vyšívaný kroj z Myjavy. Zvyšuje rýchlosť behu celej družiny o +25%.',
    unlocked: false,
    bonusText: '+25% Rýchlosť pohybu'
  },
  {
    id: 'zlaty_crpak',
    name: 'Zlatý Črpák so Žinčicou',
    category: 'trophy',
    icon: '🍶',
    description: 'Majstrovský salašnícky črpák. Regeneruje +5 HP každú sekundu počas celej hry.',
    unlocked: false,
    bonusText: '+5 HP/s Regenerácia'
  },
  {
    id: 'stuhy_dievcat',
    name: 'Kytica Krojovaných Stúh z Hradu',
    category: 'trophy',
    icon: '🎀',
    description: 'Pamiatka od všetkých 10 oslobodených dievčat. Skracuje cooldown Trojhlasného Víru na polovicu (30s).',
    unlocked: false,
    bonusText: '-50% Cooldown Superschopnosti [U]'
  }
];

export class StorageManager {
  public static getCollectibles(): CollectibleItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_COLLECTIBLES);
      if (!data) return INITIAL_COLLECTIBLES;
      const parsed: Record<string, boolean> = JSON.parse(data);
      return INITIAL_COLLECTIBLES.map(item => ({
        ...item,
        unlocked: !!parsed[item.id]
      }));
    } catch {
      return INITIAL_COLLECTIBLES;
    }
  }

  public static unlockCollectible(id: string): boolean {
    try {
      const current = this.getCollectibles();
      const item = current.find(c => c.id === id);
      if (item) {
        const map: Record<string, boolean> = {};
        current.forEach(c => { map[c.id] = c.unlocked || c.id === id; });
        localStorage.setItem(STORAGE_KEY_COLLECTIBLES, JSON.stringify(map));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public static getDukaty(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEY_DUKATY);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }

  public static addDukaty(amount: number): number {
    try {
      const total = this.getDukaty() + amount;
      localStorage.setItem(STORAGE_KEY_DUKATY, total.toString());
      return total;
    } catch {
      return 0;
    }
  }
}
