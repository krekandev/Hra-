import { Hero, Enemy, Projectile, Particle, SlashEffect, SlamEffect, FloatingText, LootOrb, MapObstacle, Waystone } from '../types';

export class PixelRenderer {
  // Draw pixel grid from string array
  private static drawPixelMap(
    ctx: CanvasRenderingContext2D,
    pixelMap: string[],
    colorMap: Record<string, string>,
    startX: number,
    startY: number,
    pixelSize: number = 2,
    flipX: boolean = false
  ) {
    const rows = pixelMap.length;
    const cols = pixelMap[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const char = pixelMap[r][c];
        if (char !== ' ' && char !== '.' && colorMap[char]) {
          ctx.fillStyle = colorMap[char];
          const x = flipX ? startX + (cols - 1 - c) * pixelSize : startX + c * pixelSize;
          const y = startY + r * pixelSize;
          ctx.fillRect(Math.floor(x), Math.floor(y), pixelSize, pixelSize);
        }
      }
    }
  }

  // Draw shadow ellipse beneath character
  private static drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y + 8, radius, radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.restore();
  }

  // --- HERO 1: JAKUB (Leader with Valaška, Kroj, Opasok, Klobúk s pierkom) ---
  public static drawJakub(ctx: CanvasRenderingContext2D, hero: Hero, animFrame: number) {
    this.drawShadow(ctx, hero.x, hero.y, 14);

    const bob = hero.state === 'walking' ? Math.sin(animFrame * 0.25) * 2 : 0;
    const isAttacking = hero.state === 'attacking';
    const flipX = hero.facing === 'left';

    // Pixel Map 16x20
    const jakubMap = [
      '    KKKKKKKK    ', // Klobúk
      '   KKKKKKKKKKP  ', // Klobúk + P=pierko
      '    FFFFFFFF    ', // Tvar
      '    FEFFEFEF    ', // Oči (E)
      '    FFFFFFFF    ', // Fúziky
      '   WWWWWWWWWW   ', // Biela košeľa
      '  VWWWRRRRWWWV  ', // Výšivka (R=červená stuha) + V=ruka
      '  VWWWRRRRWWWV  ',
      '   OOOOOOOOOO   ', // O=Široký mosadzný opasok
      '   OOOOOOOOOO   ',
      '    BBBBBBBB    ', // Tmavé nohavice
      '    BBBBBBBB    ',
      '    BB    BB    ',
      '    BB    BB    ',
      '    KK    KK    ', // Krpce
    ];

    const colors: Record<string, string> = {
      K: '#1e293b', // Klobúk čierny
      P: '#22c55e', // Zelené pierko
      F: '#fed7aa', // Pleť
      E: '#0f172a', // Oči
      W: '#f8fafc', // Biela vyšívaná košeľa
      R: '#dc2626', // Červená výšivka
      O: '#b45309', // Mosadzný vybíjaný opasok
      B: '#1e293b', // Súkenné nohavice
    };

    ctx.save();
    this.drawPixelMap(ctx, jakubMap, colors, hero.x - 16, hero.y - 20 + bob, 2, flipX);

    // Draw Valaška in Jakub's hand
    ctx.save();
    const valaskaX = flipX ? hero.x - 14 : hero.x + 14;
    const valaskaY = hero.y - 8 + bob;
    const valaskaAngle = isAttacking ? (flipX ? -Math.PI * 0.7 : Math.PI * 0.7) : (flipX ? -0.3 : 0.3);

    ctx.translate(valaskaX, valaskaY);
    ctx.rotate(valaskaAngle);

    // Toporisko (Drevená rúčka valašky)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -18, 4, 26);
    // Kovové ostrie valašky (Lesklá oceľ)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(flipX ? -12 : -2, -22, 14, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(flipX ? -12 : 8, -20, 4, 5);

    ctx.restore();

    // Leader crown/badge icon
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(hero.x - 3, hero.y - 28 + bob, 6, 3);

    ctx.restore();
  }

  // --- HERO 2: ŠIMI (Heligónka, Magické noty, Kroj) ---
  public static drawSimi(ctx: CanvasRenderingContext2D, hero: Hero, animFrame: number) {
    this.drawShadow(ctx, hero.x, hero.y, 13);

    const bob = hero.state === 'walking' ? Math.sin(animFrame * 0.25 + 1) * 2 : 0;
    const isCasting = hero.state === 'casting';
    const flipX = hero.facing === 'left';

    const simiMap = [
      '    KKKKKKKK    ', // Klobúčik
      '    FFFFFFFF    ', // Tvár
      '    FEFFEFEF    ', // Oči
      '    FFFFFFFF    ',
      '   WWVVVVWWWW   ', // V=vyšívaná vesta
      '  VWWVVVVWWWV   ',
      '  AHHHHHHHHHA   ', // H=Heligónka v rukách!
      '  AHHHHHHHHHA   ',
      '   OOOOOOOOOO   ', // Opasok
      '    BBBBBBBB    ', // Nohavice
      '    BB    BB    ',
      '    KK    KK    ', // Krpce
    ];

    const colors: Record<string, string> = {
      K: '#0f172a',
      F: '#ffedd5',
      E: '#3b82f6',
      W: '#f8fafc',
      V: '#7e22ce', // Fialová folklórna vesta
      H: '#b45309', // Drevená Heligónka
      A: '#fef08a', // Mosadzné gombíky heligónky
      O: '#d97706',
      B: '#334155',
    };

    ctx.save();
    this.drawPixelMap(ctx, simiMap, colors, hero.x - 16, hero.y - 18 + bob, 2, flipX);

    // Floating musical note pulse around Šimi's accordion
    if (isCasting || animFrame % 40 < 20) {
      const noteY = hero.y - 14 + Math.sin(animFrame * 0.15) * 4;
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 12px serif';
      ctx.fillText('♫', hero.x + (flipX ? -20 : 14), noteY);
    }

    ctx.restore();
  }

  // --- HERO 3: FILIP (Tank Juggernaut, Dupák, Mohutný zbojnícky kroj) ---
  public static drawFilip(ctx: CanvasRenderingContext2D, hero: Hero, animFrame: number) {
    this.drawShadow(ctx, hero.x, hero.y, 16);

    const bob = hero.state === 'walking' ? Math.sin(animFrame * 0.25 + 2) * 2 : 0;
    const isCharging = hero.state === 'charging';
    const flipX = hero.facing === 'left';

    const filipMap = [
      '   KKKKKKKKKK   ', // Široký klobúk
      '   KKKKKKKKKK   ',
      '    FFFFFFFF    ', // Široká tvár
      '    FEFFEFEF    ',
      '    FFFFFFFF    ',
      '  WWWWWWWWWWWW  ', // Mohutná hruď
      '  WWWWWWWWWWWW  ',
      '  RRWWWWWWWWWR  ',
      '  OOOOOOOOOOOO  ', // Obrovský trojprackový opasok
      '  OOOOOOOOOOOO  ',
      '   BBBBBBBBBB   ', // Hrubé súkenné nohavice
      '   BBBBBBBBBB   ',
      '   BB      BB   ',
      '   KK      KK   ', // Hrubé kožené krpce
    ];

    const colors: Record<string, string> = {
      K: '#332211',
      F: '#fed7aa',
      E: '#0f172a',
      W: '#f1f5f9',
      R: '#991b1b', // Červené stuhy
      O: '#78350f', // Mohutný hnedý opasok
      B: '#1e293b',
    };

    ctx.save();
    this.drawPixelMap(ctx, filipMap, colors, hero.x - 16, hero.y - 22 + bob, 2, flipX);

    // Filip's stomping dust aura
    if (isCharging) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hero.x, hero.y, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- NPC: SAMKO SZABÓ (Standing by the cottage) ---
  public static drawSamko(ctx: CanvasRenderingContext2D, x: number, y: number, animFrame: number) {
    this.drawShadow(ctx, x, y, 14);

    const bob = Math.sin(animFrame * 0.08) * 1.5;

    const samkoMap = [
      '    KKKKKKKK    ',
      '   KKKKKKKKKK   ',
      '    FFFFFFFF    ',
      '    FEFFEFEF    ',
      '    FFFFFFFF    ',
      '   WWWWWWWWWW   ',
      '  VWWVGGGGVWWV  ', // G=Zelená vyšívaná vesta
      '  VWWVGGGGVWWV  ',
      '   OOOOOOOOOO   ',
      '    BBBBBBBB    ',
      '    BB    BB    ',
      '    KK    KK    ',
    ];

    const colors: Record<string, string> = {
      K: '#1e1b4b',
      F: '#fed7aa',
      E: '#0f172a',
      W: '#ffffff',
      V: '#15803d',
      G: '#166534',
      O: '#b45309',
      B: '#1e293b',
    };

    ctx.save();
    this.drawPixelMap(ctx, samkoMap, colors, x - 16, y - 18 + bob, 2, false);

    // NPC Indicator Bubble (! over head)
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x - 6, y - 32 + bob, 12, 10);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('NPC', x - 8, y - 24 + bob);

    // Name tag
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 9px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Samko Szabó', x, y + 18);

    ctx.restore();
  }

  // --- Uväznené Dievčatá zo súboru (V Severnom Hrade) ---
  public static drawGirlsInCastle(ctx: CanvasRenderingContext2D, x: number, y: number, animFrame: number) {
    const bob = Math.sin(animFrame * 0.1) * 2;

    const girlMap = [
      '    PPPPPPPP    ', // P=Folklórna parta / veniec s kvetmi a stuhami
      '    FFFFFFFF    ',
      '    FEFFEFEF    ',
      '   RRRRRRRRRR   ', // Červený lajblík / živôtik
      '  WRRRRRRRRRRW  ',
      '  WWWWWWWWWWWW  ', // Široká biela sukňa s modrotlačou
      '  WMMMMMMMMMMW  ',
      '  WMMMMMMMMMMW  ',
      '   KK      KK   ',
    ];

    const colors: Record<string, string> = {
      P: '#f43f5e', // Červeno-ružová parta
      F: '#fde047',
      E: '#1e1b4b',
      R: '#e11d48',
      W: '#ffffff',
      M: '#3b82f6', // Modrotlačový vzor
      K: '#881337',
    };

    ctx.save();
    // 3 dievčatá stojace vedľa seba v bráne hradu
    this.drawPixelMap(ctx, girlMap, colors, x - 26, y + bob, 1.8, false);
    this.drawPixelMap(ctx, girlMap, colors, x - 6, y - 2 - bob, 2.0, false);
    this.drawPixelMap(ctx, girlMap, colors, x + 16, y + bob, 1.8, false);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 10px serif';
    ctx.textAlign = 'center';
    ctx.fillText('♥ Dievčatá zo súboru ♥', x + 5, y - 10 + bob);

    ctx.restore();
  }

  // --- ENEMIES (Zbojníci & Bosovia) ---
  public static drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, animFrame: number) {
    this.drawShadow(ctx, enemy.x, enemy.y, enemy.radius);

    const bob = Math.sin(animFrame * 0.2 + enemy.x) * 2;
    const flipX = enemy.facing === 'left';

    ctx.save();

    if (enemy.isBoss) {
      // BOSOVIA: Detviansky Bača / Myjavský Kapitán / Terchovský Jánošíkov Tieň
      const bossMap = [
        '   KKKKKKKKKKKK   ',
        '  KKKKKKKKKKKKKK  ',
        '   FFFFFFFFFFFF   ',
        '   FEFFFEFEFFEF   ',
        '   FFFFFFFFFFFF   ',
        '  RRRRRRRRRRRRRR  ', // Zbojnícky plášť
        '  RRWWWWWWWWWWRR  ',
        '  RROOOOOOOOOORR  ', // Širokánsky vybíjaný pás
        '   BBBBBBBBBBBB   ',
        '   BBBB    BBBB   ',
        '   KKKK    KKKK   ',
      ];

      const colors: Record<string, string> = {
        K: enemy.type === 'terchova_boss' ? '#0f172a' : '#451a03',
        F: '#fca5a5',
        E: '#dc2626', // Svietiace červené zbojnícke oči
        R: enemy.type === 'detva_boss' ? '#991b1b' : (enemy.type === 'myjava_boss' ? '#b45309' : '#581c87'),
        W: '#f8fafc',
        O: '#fbbf24',
        B: '#1e293b',
      };

      this.drawPixelMap(ctx, bossMap, colors, enemy.x - 24, enemy.y - 30 + bob, 3, flipX);

      // Boss Weapon
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(enemy.x + (flipX ? -28 : 24), enemy.y - 12 + bob, 6, 24);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(enemy.x + (flipX ? -34 : 24), enemy.y - 16 + bob, 14, 8);

      // Boss Name & HP Bar
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px serif';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${enemy.name} ★`, enemy.x, enemy.y - 38);

      const hpW = 60;
      const hpH = 6;
      ctx.fillStyle = '#000000';
      ctx.fillRect(enemy.x - hpW / 2, enemy.y - 34, hpW, hpH);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(enemy.x - hpW / 2, enemy.y - 34, (enemy.hp / enemy.maxHp) * hpW, hpH);

    } else {
      // COMMON ZBOJNÍCI (Zbojnícky holobriadok, Lesný lúpežník, Horský zbojník)
      const banditMap = [
        '    KKKKKKKK    ',
        '    FFFFFFFF    ',
        '    FEFFEFEF    ',
        '    FFFFFFFF    ',
        '   RRRRRRRRRR   ',
        '  VRRWWWWWWVRR  ',
        '   OOOOOOOOOO   ',
        '    BBBBBBBB    ',
        '    BB    BB    ',
        '    KK    KK    ',
      ];

      const colors: Record<string, string> = {
        K: '#1e293b',
        F: '#fed7aa',
        E: '#991b1b',
        R: enemy.type === 'horsky_zbojnik' ? '#854d0e' : (enemy.type === 'lesny_lupeznik' ? '#15803d' : '#9a3412'),
        W: '#f1f5f9',
        V: '#3b82f6',
        O: '#d97706',
        B: '#334155',
      };

      this.drawPixelMap(ctx, banditMap, colors, enemy.x - 14, enemy.y - 18 + bob, 2, flipX);

      // Enemy HP Bar
      if (enemy.hp < enemy.maxHp) {
        const hpW = 28;
        const hpH = 4;
        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x - hpW / 2, enemy.y - 24, hpW, hpH);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(enemy.x - hpW / 2, enemy.y - 24, Math.max(0, (enemy.hp / enemy.maxHp) * hpW), hpH);
      }
    }

    ctx.restore();
  }

  // --- MAP OBSTACLES (Stará slovenská chalúpka, Hrad, Hradná Brána, Vatra, Stohy sena, Pódium) ---
  public static drawObstacle(ctx: CanvasRenderingContext2D, obs: MapObstacle, animFrame: number) {
    ctx.save();

    if (obs.type === 'chalupka') {
      // Stará slovenská drevenica / chalúpka so šindľovou strechou
      // Zrubové steny (tmavé vyrezávané drevo)
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(obs.x, obs.y + 35, obs.width, obs.height - 35);
      // Špáry medzi brvnami
      ctx.fillStyle = '#3d2514';
      for (let y = obs.y + 42; y < obs.y + obs.height; y += 10) {
        ctx.fillRect(obs.x, y, obs.width, 2);
      }
      // Drevené okná s bielym orámovaním
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(obs.x + 18, obs.y + 48, 22, 22);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(obs.x + 20, obs.y + 50, 18, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(obs.x + 28, obs.y + 50, 2, 18);
      ctx.fillRect(obs.x + 20, obs.y + 58, 18, 2);

      // Vstupné dvere
      ctx.fillStyle = '#3d2514';
      ctx.fillRect(obs.x + 60, obs.y + 48, 26, obs.height - 48);
      ctx.fillStyle = '#fbbf24'; // Kľučka
      ctx.fillRect(obs.x + 80, obs.y + 68, 3, 3);

      // Šindľová sedlová strecha (Drevený šindeľ)
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.moveTo(obs.x - 10, obs.y + 38);
      ctx.lineTo(obs.x + obs.width / 2, obs.y);
      ctx.lineTo(obs.x + obs.width + 10, obs.y + 38);
      ctx.closePath();
      ctx.fill();

      // Štít chalúpky s vyrezávaným slnkom
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(obs.x + obs.width / 2, obs.y + 22, 6, 0, Math.PI * 2);
      ctx.fill();

    } else if (obs.type === 'castle_wall') {
      // Kamenné hradné hradby
      ctx.fillStyle = '#334155';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = '#1e293b';
      // Kamenné kvádre
      for (let y = obs.y + 8; y < obs.y + obs.height; y += 16) {
        for (let x = obs.x + 6; x < obs.x + obs.width - 10; x += 32) {
          ctx.fillRect(x, y, 28, 12);
        }
      }
      // Cimburie (Hradné zuby na vrchu)
      ctx.fillStyle = '#475569';
      for (let x = obs.x; x < obs.x + obs.width; x += 24) {
        ctx.fillRect(x, obs.y - 12, 16, 12);
      }

    } else if (obs.type === 'castle_gate') {
      // Veľká Hradná Brána s 3 magickými pečaťami / zámkami
      if (obs.unlocked) {
        // Otvorená Hradná Brána - Zlaté svetlo z nádvoria
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(obs.x, obs.y, 20, obs.height);
        ctx.fillRect(obs.x + obs.width - 20, obs.y, 20, obs.height);
        
        // Svetelná žiara zvnútra hradu
        const glow = Math.sin(animFrame * 0.1) * 0.15 + 0.35;
        ctx.fillStyle = `rgba(251, 191, 36, ${glow})`;
        ctx.fillRect(obs.x + 20, obs.y, obs.width - 40, obs.height);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px serif';
        ctx.textAlign = 'center';
        ctx.fillText('BRÁNA OTVORENÁ! VSTÚPTE! ✨', obs.x + obs.width / 2, obs.y + obs.height / 2 + 3);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Masívne kované drevené krídla brány
        ctx.fillStyle = '#451a03';
        ctx.fillRect(obs.x + 8, obs.y + 6, obs.width - 16, obs.height - 6);

        // Kované železné pásy
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(obs.x + 8, obs.y + 16, obs.width - 16, 6);
        ctx.fillRect(obs.x + 8, obs.y + 36, obs.width - 16, 6);

        // 3 Magické Zámky / Pečate na bráne (Detva, Terchová, Myjava)
        const keyColors = ['#e11d48', '#8b5cf6', '#f59e0b'];
        for (let i = 0; i < 3; i++) {
          const kx = obs.x + 30 + i * 38;
          const ky = obs.y + 24;

          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(kx, ky, 9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = keyColors[i];
          ctx.beginPath();
          ctx.arc(kx, ky, 7, 0, Math.PI * 2);
          ctx.fill();

          // Kľúčová dierka
          ctx.fillStyle = '#000000';
          ctx.fillRect(kx - 1.5, ky - 3, 3, 7);
        }

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 8px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 ZAPEČATENÉ (POTREBNÉ 3 KĽÚČE)', obs.x + obs.width / 2, obs.y - 6);
      }

    } else if (obs.type === 'barricade') {
      // Zbojnícka drevená barikáda s reťazami a ostňami
      if (obs.unlocked) {
        // Zničená / otvorená barikáda (hráč môže voľne prejsť)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(obs.x, obs.y, 10, obs.height);
        ctx.fillRect(obs.x + obs.width - 10, obs.y, 10, obs.height);
        
        ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
        ctx.fillRect(obs.x + 10, obs.y, obs.width - 20, obs.height);

        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 8px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔓 VOĽNÝ PRECHOD', obs.x + obs.width / 2, obs.y - 4);
      } else {
        // Zamknutá barikáda
        ctx.fillStyle = '#451a03';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Krížové drevené trámy
        ctx.fillStyle = '#78350f';
        ctx.fillRect(obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8);

        // Kované ostne
        ctx.fillStyle = '#94a3b8';
        for (let i = 4; i < obs.width - 4; i += 12) {
          ctx.beginPath();
          ctx.moveTo(obs.x + i, obs.y);
          ctx.lineTo(obs.x + i + 6, obs.y - 8);
          ctx.lineTo(obs.x + i + 12, obs.y);
          ctx.fill();
        }

        // Reťaz a červený zámok
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(obs.x + 4, obs.y + obs.height / 2 - 3, obs.width - 8, 6);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fecaca';
        ctx.font = 'bold 7.5px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 ZAMKNUTÉ', obs.x + obs.width / 2, obs.y - 10);
      }

    } else if (obs.type === 'tavern') {
      // Zbojnícka Krčma (Veľká drevená stavba s komínom, sudom piva a nápisom KRČMA)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(obs.x, obs.y + 35, obs.width, obs.height - 35);
      // Drevené okná so sviečkami
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(obs.x + 20, obs.y + 55, 25, 25);
      ctx.fillRect(obs.x + obs.width - 45, obs.y + 55, 25, 25);
      // Široké vstupné dvere s pivným sudom
      ctx.fillStyle = '#291e13';
      ctx.fillRect(obs.x + obs.width / 2 - 18, obs.y + 50, 36, obs.height - 50);
      ctx.fillStyle = '#b45309'; // Sud piva pri dverách
      ctx.beginPath();
      ctx.arc(obs.x + obs.width / 2 - 28, obs.y + obs.height - 15, 12, 0, Math.PI * 2);
      ctx.fill();

      // Strecha s komínom
      ctx.fillStyle = '#291e13';
      ctx.beginPath();
      ctx.moveTo(obs.x - 10, obs.y + 38);
      ctx.lineTo(obs.x + obs.width / 2, obs.y);
      ctx.lineTo(obs.x + obs.width + 10, obs.y + 38);
      ctx.closePath();
      ctx.fill();

      // Vývesný štít s pivom
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(obs.x + obs.width / 2 - 35, obs.y + 20, 70, 16);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🍻 ZBOJNÍCKA KRČMA', obs.x + obs.width / 2, obs.y + 31);

    } else if (obs.type === 'home_door') {
      // Dvere do rodného domu
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VSTUP 🏡', obs.x + obs.width / 2, obs.y + obs.height / 2 + 2);

    } else if (obs.type === 'booth') {
      // Jarmokový folklórny stánok s plachtou
      ctx.fillStyle = '#78350f';
      ctx.fillRect(obs.x, obs.y + 15, obs.width, obs.height - 15);
      // Pásikavá strieška (červeno-biela)
      for (let i = 0; i < obs.width; i += 10) {
        ctx.fillStyle = (i / 10) % 2 === 0 ? '#ef4444' : '#f8fafc';
        ctx.fillRect(obs.x + i, obs.y, 10, 15);
      }
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 6.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JARMOK 🥨', obs.x + obs.width / 2, obs.y + obs.height - 4);

    } else if (obs.type === 'bench') {
      // Drevené lavičky amfiteátra
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = '#3d2514';
      ctx.fillRect(obs.x, obs.y + 4, obs.width, 2);
      ctx.fillRect(obs.x, obs.y + 12, obs.width, 2);

    } else if (obs.type === 'festival_stage') {
      // Amfiteáter / Festivalové pódium s vyrezávanou drevenou bránou a stuhami
      ctx.fillStyle = '#78350f';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8);

      // Drevené stĺpy pódia
      ctx.fillStyle = '#b45309';
      ctx.fillRect(obs.x, obs.y - 25, 10, obs.height + 25);
      ctx.fillRect(obs.x + obs.width - 10, obs.y - 25, 10, obs.height + 25);

      // Horný preklad s vyrezávaným folklórnym nápisom
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(obs.x - 5, obs.y - 32, obs.width + 10, 18);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      const stageTitle = obs.label || 'FOLKLÓRNY FESTIVAL 🪈';
      ctx.fillText(stageTitle, obs.x + obs.width / 2, obs.y - 20);

      // Vlajúce pestrofarebné stuhy
      const wave = Math.sin(animFrame * 0.1) * 4;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(obs.x + 16, obs.y - 12, 4, 16 + wave);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(obs.x + 36, obs.y - 12, 4, 16 - wave);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(obs.x + 56, obs.y - 12, 4, 16 + wave);

    } else if (obs.type === 'tree') {
      // Slovenský smrek / dub
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(obs.x + obs.width / 2 - 6, obs.y + obs.height - 18, 12, 18);

      // Smreková koruna
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.width / 2, obs.y);
      ctx.lineTo(obs.x + obs.width + 4, obs.y + obs.height - 14);
      ctx.lineTo(obs.x - 4, obs.y + obs.height - 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.width / 2, obs.y + 8);
      ctx.lineTo(obs.x + obs.width - 4, obs.y + obs.height - 22);
      ctx.lineTo(obs.x + 4, obs.y + obs.height - 22);
      ctx.closePath();
      ctx.fill();

    } else if (obs.type === 'fire') {
      // Zbojnícka Vatra (Drevené polená a plápolajúci oheň)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(obs.x + 2, obs.y + 18, obs.width - 4, 8);

      // Plamene
      const flameH = 14 + Math.sin(animFrame * 0.3) * 5;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(obs.x + obs.width / 2, obs.y + 14, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(obs.x + obs.width / 2, obs.y + 14 - flameH * 0.4, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(obs.x + obs.width / 2, obs.y + 14 - flameH * 0.7, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (obs.type === 'haystack') {
      // Stoh sena (Tradičný slovenský stoh s dreveným stredovým kolom)
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2 - 4, obs.width / 2 - 4, obs.height / 2 - 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stredový kôl
      ctx.fillStyle = '#78350f';
      ctx.fillRect(obs.x + obs.width / 2 - 2, obs.y - 8, 4, 16);

    } else if (obs.type === 'fence') {
      // Drevený žrďový plot
      ctx.fillStyle = '#78350f';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = '#a16207';
      ctx.fillRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height - 4);
    }

    ctx.restore();
  }

  // --- WAYSTONES / FESTIVAL TOTEMS ---
  public static drawWaystone(ctx: CanvasRenderingContext2D, w: Waystone, animFrame: number) {
    ctx.save();
    this.drawShadow(ctx, w.x, w.y, w.radius * 0.85);

    const pulse = Math.sin(animFrame * 0.12) * 4;

    if (w.isTotem) {
      // Magický folklórny rituálny kruh na zemi
      ctx.save();
      const ringAlpha = w.completed ? 0.35 : (w.bossSpawned ? 0.5 : 0.4 + Math.sin(animFrame * 0.15) * 0.2);
      ctx.strokeStyle = w.completed ? `rgba(250, 204, 21, ${ringAlpha})` : (w.bossSpawned ? `rgba(239, 68, 68, ${ringAlpha})` : `rgba(56, 189, 248, ${ringAlpha})`);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius + pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Vnútorný ornamentálny kruh s runovými lúčmi
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Drevený vyrezávaný folklórny totem
      const woodColor = w.completed ? '#b45309' : (w.bossSpawned ? '#7f1d1d' : '#854d0e');
      ctx.fillStyle = woodColor;
      ctx.fillRect(w.x - 12, w.y - 36, 24, 42);

      // Vyrezávané folklórne pásy (červené, biele, žlté ornamenty)
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(w.x - 10, w.y - 30, 20, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w.x - 10, w.y - 22, 20, 4);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(w.x - 10, w.y - 14, 20, 4);

      // Horná koruna totemu / vyrezávané slnko a fujara
      ctx.fillStyle = w.completed ? '#fde047' : (w.bossSpawned ? '#f87171' : '#38bdf8');
      ctx.beginPath();
      ctx.arc(w.x, w.y - 42, 10, 0, Math.PI * 2);
      ctx.fill();

      // Žiariaci kryštál na vrchu totemu
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(w.x, w.y - 42, 5 + Math.sin(animFrame * 0.2) * 2, 0, Math.PI * 2);
      ctx.fill();

      // Vlajúce pestrofarebné stuhy na toteme
      const ribbonWave = Math.sin(animFrame * 0.15) * 5;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(w.x - 14, w.y - 34, 3, 16 + ribbonWave);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(w.x + 11, w.y - 34, 3, 16 - ribbonWave);

      // Názov a akčný popis
      ctx.fillStyle = w.completed ? '#fef08a' : (w.bossSpawned ? '#fca5a5' : '#7dd3fc');
      ctx.font = 'bold 10px serif';
      ctx.textAlign = 'center';
      ctx.fillText(w.name, w.x, w.y + 18);

      // Stavový štítok
      ctx.font = 'bold 8px monospace';
      if (w.completed) {
        ctx.fillStyle = '#86efac';
        ctx.fillText('✨ [ FESTIVAL OSLOBODENÝ 🗝️ ]', w.x, w.y + 28);
      } else if (w.bossSpawned) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('⚔️ [ BOJ S BOSOM PREBIEHA! ]', w.x, w.y + 28);
      } else {
        ctx.fillStyle = '#fde047';
        ctx.fillText('🎯 [ STÚP NA TOTEM PRE BOSA ]', w.x, w.y + 28);
      }

    } else {
      // Bežná svätyňa (Štartovná chalúpka)
      ctx.fillStyle = w.activated ? '#b45309' : '#57534e';
      ctx.fillRect(w.x - 10, w.y - 26, 20, 32);

      ctx.fillStyle = w.activated ? '#f59e0b' : '#78716c';
      ctx.fillRect(w.x - 7, w.y - 24, 14, 28);

      ctx.fillStyle = w.activated ? '#fde047' : '#a8a29e';
      ctx.fillRect(w.x - 14, w.y - 32, 28, 8);

      if (w.activated) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.beginPath();
        ctx.arc(w.x, w.y - 12, w.radius + pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = w.activated ? '#fef08a' : '#d6d3d1';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText(w.name, w.x, w.y + 18);
    }

    ctx.restore();
  }

  // --- COMBAT EFFECTS (Valaška Slash, Heligónka Sonic Note, Zbojnícky Dupák Slam) ---
  public static drawSlash(ctx: CanvasRenderingContext2D, s: SlashEffect) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);

    const alpha = s.life / s.maxLife;
    ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`; // Lesklá zlatistá valaška
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, s.radius, -s.arc / 2, s.arc / 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, s.radius, -s.arc / 2 + 0.1, s.arc / 2 - 0.1);
    ctx.stroke();

    ctx.restore();
  }

  public static drawSlam(ctx: CanvasRenderingContext2D, s: SlamEffect) {
    ctx.save();
    const progress = 1 - s.life / s.maxLife;
    const currentR = s.radius + (s.maxRadius - s.radius) * progress;
    const alpha = s.life / s.maxLife;

    // Rázová vlna po zbojníckom dupáku (zemné trhliny)
    ctx.strokeStyle = `rgba(217, 119, 6, ${alpha * 0.8})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(s.x, s.y, currentR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, currentR * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  public static drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile) {
    ctx.save();

    if (p.isNote || p.heroId === 'simi') {
      // Šimiho sonická hudobná nota z heligónky ♫
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♫', p.x, p.y);

      // Sonic trail
      ctx.fillStyle = 'rgba(192, 132, 252, 0.4)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Default / Enemy projectile
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  public static drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.shape === 'music_note') {
      ctx.font = 'bold 11px serif';
      ctx.fillText('♪', p.x, p.y);
    } else {
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    ctx.restore();
  }

  public static drawFloatingText(ctx: CanvasRenderingContext2D, t: FloatingText) {
    ctx.save();
    ctx.globalAlpha = t.alpha;
    ctx.fillStyle = t.color;
    ctx.font = t.isCrit ? 'bold 14px serif' : 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }

  public static drawLootOrb(ctx: CanvasRenderingContext2D, orb: LootOrb, animFrame: number) {
    ctx.save();
    const bob = Math.sin(animFrame * 0.15 + orb.x) * 3;

    if (orb.type === 'key') {
      // Zlatý festivalový kľúč
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🗝️', orb.x, orb.y + bob);
    } else if (orb.type === 'health') {
      // Žinčica / Hriatô (Liečivý nápoj)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(orb.x, orb.y + bob, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(orb.x - 1, orb.y + bob - 4, 2, 8);
      ctx.fillRect(orb.x - 4, orb.y + bob - 1, 8, 2);
    } else {
      // Zlaté dukáty
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(orb.x, orb.y + bob, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
