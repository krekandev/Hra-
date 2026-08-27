# 🚀 Návod na Git Push & Prácu s Assetmi (Web & Audio)

Tento dokument stručne popisuje presný postup a workflow, ktorý bol použitý pri spracovaní assetov (obrázkov, zvukov) a ako celý aktuálny kód nahrať / pushnúť späť na GitHub.

---

## 1. 📤 Ako pushnúť aktuálny kód na GitHub (Overwrite / Update)

V termináli v priečinku projektu (`c:\Weby\Hra-`) stačí zadať tieto 3 príkazy:

```bash
# 1. Pridať všetky zmenené aj nové súbory
git add .

# 2. Vytvoriť commit s popisom zmien
git commit -m "Aktualizacia hry: dialogy Jakub, nove zvuky, portrety a festival challenge"

# 3. Odoslať na GitHub do vetvy main
git push origin main
```

*(Ak by si náhodou potreboval natvrdo prepísať vzdialený repozitár, použije sa `git push origin main --force`, ale štandardný `git push origin main` postačuje).*

---

## 2. 🛠️ Workflow: Ako pripraviť nové súbory pre web

### A. Obrázky / Portréty (Sprites & Dialogy)
1. **Uloženie súboru:** Vlož obrázok (PNG/JPG) do priečinka `public/` (napr. `public/jakub.png` alebo `public/marek.jpg`).
2. **Prečo `public/`?**
   - Všetko, čo je v `public/`, Vite a prehliadač servujú priamo z koreňovej URL (napr. `/jakub.png`).
3. **Použitie v kóde:**
   - V [story.ts](file:///c:/Weby/Hra-/src/game/story.ts) alebo v typoch postáv stačí zadať cestu k portrétu:
     ```ts
     portraitUrl: '/jakub.png'
     ```

---

### B. Zvuky & Hlasy (Audio)
Webové prehliadače (a Web Audio API) najlepšie fungujú s formátom **MP3** alebo **WAV/OGG**.

1. **Uloženie zdrojov:** Vlož nahrávky do `assets/sounds/` (alebo priamo do `public/sounds/`).
2. **Konverzia / Kopírovanie do Web formátu:**
   - Pre web je ideálne mať súbory priamo v `public/sounds/` ako `.mp3`.
   - V projekte máme skript [convert_sounds.cjs](file:///c:/Weby/Hra-/convert_sounds.cjs), ktorý automaticky skopíruje/prevedie audio súbory do `public/sounds/`.
   - Spustenie skriptu:
     ```bash
     node convert_sounds.cjs
     ```
3. **Použitie v audio engine:**
   - V [sound.ts](file:///c:/Weby/Hra-/src/game/sound.ts) je definovaná mapa zvukov, napr.:
     ```ts
     const VOICE_TRACKS: Record<string, string> = {
       jakub_intro: '/sounds/jakub_intro.mp3',
       // ďalšie hlasy...
     };
     ```

---

## 3. 🧪 Spustenie a overenie lokálne

Pred pushnutím si vždy môžeš overiť funkčnosť lokálne:

```bash
# Spustenie lokálneho servera
npm run dev

# Test produkčného buildu (overenie, či TypeScript nehádže chyby)
npm run build
```
