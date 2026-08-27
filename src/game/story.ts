import { DialogueLine, StoryChapter, RelicItem } from '../types';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: 'Kapitola I: Detvianske Podpolie',
    festivalName: 'Detva',
    objective: 'Príď na festival v Detve (juh) a stúp na Festivalový Totem, aby si privolal Detvianskeho Baču!',
    requiredKills: 8,
    zoneRequired: 1,
    completed: false,
    bossType: 'detva_boss',
    bossSpawned: false,
    bossDefeated: false,
    totemActivated: false,
    keyCollected: false,
    totemX: 480,
    totemY: 1450,
    dialogueTrigger: [
      {
        speaker: 'Rozprávač',
        speakerHeroId: 'narrator',
        mood: 'mysterious',
        text: 'Po energickom vystúpení na Východnej Jakub v šatni zatiahol tón na starej čarovnej fujare... a zrazu ste sa prebudili v mýtickom kraji slovenských legiend!'
      },
      {
        speaker: 'Jakub',
        speakerHeroId: 'jakub',
        mood: 'determined',
        text: 'Chlapi, kde to sme?! Kde sú dievčatá z nášho folklórneho súboru?!'
      },
      {
        speaker: 'Samko Szabó',
        speakerHeroId: 'samko',
        mood: 'mysterious',
        text: 'Vitajte, junáci! Zlí zbojníci prepadli festival, uniesli všetky dievčatá zo súboru a zamkli ich do Hradu na severe!'
      },
      {
        speaker: 'Samko Szabó',
        speakerHeroId: 'samko',
        mood: 'determined',
        text: 'Hradná brána vyžaduje 3 kľúče. Musíte oslobodiť festivaly v poradí: 1. Detva, 2. Terchová a 3. Myjava! Na každom festivale stúpte na Festivalový Totem, porazte bosa a vezmite si kľúč!'
      },
      {
        speaker: 'Šimi',
        speakerHeroId: 'simi',
        mood: 'determined',
        text: 'Moja heligónka [O / W] vystrelí magické sonické noty. Každého zbojníka odfúkne!'
      },
      {
        speaker: 'Filip',
        speakerHeroId: 'filip',
        mood: 'smug',
        text: 'A môj zbojnícky dupák [P / E] roztrasie zem! Jakub vedie útok valaškou [I / Q]. Hor sa do Detvy!'
      }
    ]
  },
  {
    id: 2,
    title: 'Kapitola II: Terchovská Tiesňava',
    festivalName: 'Terchová',
    objective: 'Prejdi cez odomknutú barikádu do Terchovej (juhovýchod), stúp na Totem a poraz Jánošíkov Tieň!',
    requiredKills: 10,
    zoneRequired: 2,
    completed: false,
    bossType: 'terchova_boss',
    bossSpawned: false,
    bossDefeated: false,
    totemActivated: false,
    keyCollected: false,
    totemX: 2200,
    totemY: 1450,
    dialogueTrigger: [
      {
        speaker: 'Jakub',
        speakerHeroId: 'jakub',
        mood: 'determined',
        text: 'Výborne, Kľúč z Detvy je náš a zbojnícka barikáda na ceste do Terchovej sa rozpadla!'
      },
      {
        speaker: 'Filip',
        speakerHeroId: 'filip',
        mood: 'angry',
        text: 'V Terchovej čaká obávaný Terchovský Jánošíkov Tieň. Musíme nájsť terchovský totem a privolať ho na férový súboj!'
      },
      {
        speaker: 'Šimi',
        speakerHeroId: 'simi',
        mood: 'smug',
        text: 'Naladím najrýchlejší terchovský čardáš. Keď padne terchovský bos, odomkne sa nám cesta do Myjavy!'
      }
    ]
  },
  {
    id: 3,
    title: 'Kapitola III: Myjavské Kopanice',
    festivalName: 'Myjava',
    objective: 'Prejdi na sever do Myjavy cez odomknutý prechod, stúp na Myjavský Totem a poraz Zbojníckeho Kapitána!',
    requiredKills: 12,
    zoneRequired: 3,
    completed: false,
    bossType: 'myjava_boss',
    bossSpawned: false,
    bossDefeated: false,
    totemActivated: false,
    keyCollected: false,
    totemX: 1500,
    totemY: 650,
    dialogueTrigger: [
      {
        speaker: 'Šimi',
        speakerHeroId: 'simi',
        mood: 'determined',
        text: 'Máme už 2 kľúče (Detva + Terchová)! Cesta na kopanice do Myjavy je voľná!'
      },
      {
        speaker: 'Jakub',
        speakerHeroId: 'jakub',
        mood: 'determined',
        text: 'Myjavský zbojnícky kapitán sa ukrýva na pódiu. Stúpnime na totem a vezmime si posledný 3. kľúč!'
      },
      {
        speaker: 'Filip',
        speakerHeroId: 'filip',
        mood: 'smug',
        text: 'Už len krok a rozrazíme bránu Severného Hradu. Za dievčatá a za folklór!'
      }
    ]
  },
  {
    id: 4,
    title: 'Finále: Záchrana Dievčat na Severnom Hrade',
    festivalName: 'Severný Hrad',
    objective: 'Všetky 3 kľúče sú zozbierané! Vykroč na sever k Hradu a stúp na hradný oltár pre oslobodenie dievčat!',
    requiredKills: 1,
    zoneRequired: 4,
    completed: false,
    bossSpawned: false,
    bossDefeated: false,
    totemActivated: false,
    keyCollected: true,
    totemX: 1400,
    totemY: 300,
    dialogueTrigger: [
      {
        speaker: 'Samko Szabó',
        speakerHeroId: 'samko',
        mood: 'smug',
        text: 'Sláva našim junákom! Máte všetky 3 kľúče z Detvy, Terchovej aj Myjavy! Hradná brána sa otvára!'
      },
      {
        speaker: 'Dievčatá zo súboru',
        speakerHeroId: 'girls',
        mood: 'determined',
        text: 'Jakub! Šimi! Filip! Počujeme vašu fujaru a heligónku! Vstúpte na nádvorie hradu!'
      },
      {
        speaker: 'Jakub',
        speakerHeroId: 'jakub',
        mood: 'determined',
        text: 'Sme tu, dievčatá! Zbojníci boli porazení a folklórny súbor bude opäť tancovať!'
      }
    ]
  }
];

export const VICTORY_DIALOGUE: DialogueLine[] = [
  {
    speaker: 'Dievčatá zo súboru',
    speakerHeroId: 'girls',
    mood: 'smug',
    text: 'Dokázali ste to! Hradná brána je otvorená a my sme voľné! Ste naši skutoční hrdinovia!'
  },
  {
    speaker: 'Filip',
    speakerHeroId: 'filip',
    mood: 'smug',
    text: 'Hahaha! Videli ste tie zbojnícke dupáky?! Lúpežníci utekali cez hory a doly!'
  },
  {
    speaker: 'Šimi',
    speakerHeroId: 'simi',
    mood: 'normal',
    text: 'A moja heligónka zahrala najkrajší víťazný čardáš. Celý súbor je opäť spolu!'
  },
  {
    speaker: 'Jakub',
    speakerHeroId: 'jakub',
    mood: 'determined',
    text: 'Založte obrovskú vatru, vytiahnite fujary, husle aj basu! Dnes v noci oslavuje celé Slovensko!'
  }
];

export const AVAILABLE_RELICS: RelicItem[] = [
  {
    id: 'fujara_vychodna',
    name: 'Čarovná Fujara z Východnej',
    icon: '🪈',
    rarity: 'legendary',
    description: '+25% Rýchlosť pohybu a -25% cooldowny na všetky schopnosti pre celú trojicu.',
    bonus: { hero: 'all', speed: 25, cooldownReduction: 25 }
  },
  {
    id: 'janosikova_valaska',
    name: 'Ostrá Jánošíkova Valaška',
    icon: '🪓',
    rarity: 'epic',
    description: 'Jakubov [I / Q] Sek valaškou má o 40% väčší dosah a spôsobuje +50% poškodenie.',
    bonus: { hero: 'jakub', attack: 40 }
  },
  {
    id: 'zlata_heligonka',
    name: 'Zlatá Heligónka Majstrov',
    icon: '🪗',
    rarity: 'epic',
    description: 'Šimiho [O / W] Magická nota sa pri zásahu rozprskne a spôsobí masívne poškodenie.',
    bonus: { hero: 'simi', attack: 35 }
  },
  {
    id: 'zbojnocky_opasok',
    name: 'Vybíjaný Zbojnícky Opasok',
    icon: '🥋',
    rarity: 'epic',
    description: 'Filipov [P / E] Zbojnícky dupák má o 50% väčší polomer rázovej vlny a omráči okolitých nepriateľov.',
    bonus: { hero: 'filip', health: 140 }
  },
  {
    id: 'tatranska_slivovica',
    name: 'Tatranské Hriatô a Žinčica',
    icon: '🍶',
    rarity: 'rare',
    description: 'Všetci mládenci regenerujú +6 HP každé 2 sekundy a získavajú +100 Max HP.',
    bonus: { hero: 'all', health: 100 }
  },
  {
    id: 'krpce_rychlosti',
    name: 'Krpce Rýchleho Tanca',
    icon: '👞',
    rarity: 'common',
    description: '+30% Základná rýchlosť pohybu pre celú trojicu junákov.',
    bonus: { hero: 'all', speed: 30 }
  }
];
