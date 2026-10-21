# STACK 3D — Game Design Document (GDD)
Versione 2.0 — 21/10/2026 — da codice reale `index.html` (~2100 righe)

> Single-file game. Three.js via CDN, nessun build. Solo `localStorage`. Run: aprire `index.html` con internet.

## 1. High Concept / Pillars
**Pitch:** Tower-stacker 3D isometrico: un tap = un piano. Precisione, risk/reward, eventi caotici e meta-progressione shop.
1. One-tap skill — immediato, difficile da padroneggiare.
2. Juice costante — flash, shake, particelle, vibrazione, banner a ogni azione.
3. Progressione permanente — monete, record, sblocchi, shop.
4. Caos controllato — TNT, Bombe, Frenzy, Blast rompono la routine.

**Loop core:** osserva blocco oscillante → tap → Perfect/taglio → monete/punti → torre si restringe → speciale/evento → piu veloce.
**Loop meta:** gioca → monete → shop temi/forme/scie/power-up/upgrade → sblocca Frenzy (record 50) e Blast (record 75) → record/badge.

## 2. Tech Spec
- File unico `index.html`. `bridge/` solo infra Cline, non di gioco. README vuoto.
- Renderer `WebGLRenderer antialias`, pixelRatio min(dpr,2), `setAnimationLoop`.
- Camera ortografica `(-20*aspect,20*aspect,20,-20)`, pos `(20,20,20)` lookAt `(0,0,0)`. Poi `targetY=20+(len-2)*1`. Salita lerp .08, discesa snap dopo demolizioni. Shake offset random.
- Luci Ambient + Directional (10,20,10), da tema.
- Persistenza `localStorage`: `stack_3d_highscore`, `stack3d_coins/theme/shape/owned/beststreak/equip/inv/upg/pending/badges/frenzy_unlocked/blast_unlocked`.
- Nessun backend/test (solo `navigator.vibrate`). Audio: Web Audio API nativa (SFX procedurali + musica procedurale), toggle persistenti.

## 3. Controlli
- Click/Tap = `handlePlace()`. Ignorato se demolishing/frenzy/blast/shop aperto/click su button/menu/shop/gameover. Se gameEnded → restart.
- Space = tap (bloccato in frenzy/blast). R = restart. B o bottone bomba = `detonateBomb()`.
- 1/2/3/4 in Frenzy = `shootFrenzy(red/green/blue/yellow)`. In Blast = `explodeBlast(...)`.
- Menu alto-dx → Ricomincia/Negozio. GameOver → Rigioca/Negozio.

## 4. Core — Piazzamento
- `boxHeight=1`. 2 basi fisse 10x10 in (0,0).
- Moving = `stack[len-1]`: spawn -20 su asse corrente x/z, `pos+=speed*(runSlow?0.8:1)`, wrap >20→-20. Direzione alterna x→z ogni piazzamento.
- `speed` init 0.15, +0.005 ogni piazzamento tranne TNT. Mai resettata da bombe/frenzy/blast. Reset solo restart. Congelata se demolishing/frenzy/blast/gameEnded.
- Risoluzione: `size=top.width/depth`, `delta=top.pos-prev.pos`, `snapTol=0.3+upg.tol*0.05` (max .45). Se magnet e |delta|<size: `delta*=0.25`, snapTol=1.6. `placeErr=|delta|`, `overlap=size-placeErr`.
- Hit (overlap>0): Perfect se |delta|<snapTol → snap, streak++, bestStreak, `coins+=1+upg.combo`, carica bomba, bonus ogni 3 streak `+5*(1+upg.combo)`, burst 22, flash .45. Taglio altrimenti → streak=0, resize overlap, overhang cade.
- Poi: consuma special, score++, highScore, sblocchi, runSlow--, saveMeta, flip asse, speed+ (no TNT), pickSpecial+addLayer con dimensioni ref, trigger frenzy/blast.
- Miss (overlap<=0): se runLife → Seconda Chance (rimuovi moving, banner, nuovo layer, no score). Altrimenti endGame (moving→overhang, overlay `Hai mancato il blocco!`).
- Primo tap: gameStarted=true, consuma 1 per pending armato → runLife/runSlow 15/runMagnet, banner Power-up attivi.
## 5. Blocchi Speciali
`pickSpecial()`: null se frenzy/blast o score<4. Altrimenti countdown da 5 (reset 5+rand0-4 → uno speciale ogni 5-9 piazzamenti). Roll: `pc=0.35` base, `0.525` con runMagnet → coin; `+0.3` → magnet; else tnt. Quindi base 35/30/35%, con calamita 52.5/30/17.5%. Banner `---- TNT/MAGNETE/BLOCCO DORATO IN ARRIVO ----` 1800ms.
- Look: outline EdgesGeometry + emissive blink + texture canvas (TNT rossa `TNT!!!`, coin oro `$` rotante `rotation.y+=0.06`, magnet ciano `U N+S`).
- Magnet: attrazione pre-calcolo (delta*.25, snap 1.6). Se non perfect → banner assistita.
- Coin: `placeErr<0.1` → PERFETTO DORATO +15-20, burst 42 oro; `overlapRatio<0.25` → frantumata +0 grigia; else opaca +3-5.
- TNT: `await detonateTNT()`.

## 6. Bombe (da Perfect)
Ogni Perfect: bombProgress++. Ogni 10 → bombs=min(3,+1), banner `Bomba caricata! (n/3)`. HUD basso-sx label `n/3`, fill charge/10, ready rosso se n>0.
`detonateBomb()`: guardie gameEnded/demolishing/frenzy/blast/bombs0/len<=3. `total=min(10,len-1-2)` (conserva 2 basi). Banner -N, burst 60, cascata 130ms/pezzo da alto (`splice(len-2)`), riallinea Y, camera snap giu `min(camY,20+(len-2))`, moving resettato a top fisico, speed invariata.

## 7. TNT
`TNT_POWER=2`. `below=min(2,len-3)`. TNT esplode (pop non conteggiata) + cascata below pezzi (130ms, burst 16). Solo Y ritoccata, poi ricentro nuova cima su blocco sotto (x/z). Camera giu `20+(len-1)`. Moving resettato, speed invariata e senza +0.005.

## 8. Frenzy Color Blast
- Sblocco permanente highScore>=50, flag + alert 4s `FRENZY COLOR BLAST SBLOCCATO!`.
- Trigger: ogni 15 piazzamenti, 10%, solo se sbloccato + len>4 + no frenzy/blast/gameEnded.
- Durata 5s base, 7s upg1, 10s upg2.
- Setup: colora indici 2..len-2 (no 2 basi + moving) con red/green/blue/yellow (salva origColor/emissive/map, toglie texture, nasconde outline). HUD 4 bottoni + timer + `Colpisci la cima: COLORE · Distrutti N · Ns`.
- `shootFrenzy(color)`: sfera r.55 da top+14Y a cima in ~0.45s. `frenzyHit`: giusto → rimuovi len-2, score++, coins+=2, burst 22, riallinea Y, camera snap; se len<=3 fine. Sbagliato → burst grigio, banner `Colore sbagliato! Serve X`, no danno.
- `endFrenzy()`: ripristina colori/scala/texture, moving adattato, speed invariata, banner `Frenzy finito! -N pezzi`.
- Guardie: handlePlace/Space/B bloccati, pickSpecial null, pulse scala Y 1±.03, cleanup in endGame/restart.

## 9. Color Blast (one-shot)
- Sblocco highScore>=75, alert `COLOR BLAST SBLOCCATO!`. Trigger come Frenzy ma mutua esclusione.
- Durata 8s = 4 ondate x 2s. Ogni ondata ricolora tutta torre 2..len-2 random.
- HUD dedicato `#blast-hud/#blast-btns`: 4 tasti, timer, `Ondata x/4 · R n G n B n Y n · Distrutti N · Ns`.
- `explodeBlast(color)` ONE-SHOT: rimuove TUTTI indici len-2..2 di quel colore (+1 score +2 coins cad.), riallinea Y, poi subito `endBlast(msg)`. Se nessuno → FX grigia + endBlast. Tasti 1-4.
- `endBlast(msg)`: ripristino, moving adattato, speed invariata. Timeout 8s chiude solo se nessun colore premuto.
- Guardie come Frenzy + startFrenzy bloccato durante blast.
## 10. Economia & Progressione
- Score +1 piazzamento, +1 frenzy giusto, +N blast. highScore persistente.
- Coins: Perfect 1+combo, bonus ogni 3 streak +5*(1+combo), coin 0/3-5/15-20, frenzy/blast +2/blocco. Mai perse a game over.
- Streak live `Perfect xN` (hot rosa se >0) + bestStreak persistente.
- Badge persistenti (toast 3200ms): 30 Architetto Novizio, 50 Maestro Precisione, 100 Equilibrista Supremo. HUD ultimo `🏅 nome`.
- Sblocchi su highScore: Frenzy 50, Blast 75.

## 11. Shop (popup a tab)
Aperto da Menu o GameOver. Valuta `monete N`. Bottoni: Compra oro / Usa ciano / Attivo verde disabled.
- Temi: Classico 0 (#1a1a2e bianco), Vaporwave 50 (#2b1055 rosa/ciano), Cyberpunk 100 (#0b0e1a teal/magenta), Pastel 75 (#3a2b4d rosa/giallo). Cambiano bg/fog/luci/accent/particelle.
- Forme: Cubi 0, Cilindri 50 (28seg), Cristalli 100 (6seg), Stelle 150 (extrude 5 punte). `rebuildShape()` live preservando materiali/scala/frenzy/outline.
- Scie (equip.trail): Nessuna 0, Fumo 30, Bolle 40, Polvere stelle 45, Fuoco 55, Neon 55. Particelle ogni 2-3 tick dal moving.
- Effetti taglio (equip.cut): Nessuno 0, Coriandoli 40, Pixel 50, Fuochi 60.
- Aure (equip.aura): Nessuna 0, Dorata 70 (12 sprite nebbiolina additiva orbitanti), Fulmini 85 (scintille ogni 7 tick), Anelli 90 (3 tori).
- Cornici (equip.frame): Nessuna 0, Dorata 50, Neon 60, Animata 100 (CSS su score).
- Consumabili: Seconda Chance 60 (salva un miss), Rallentatore 40 (-20% x0.8 primi 15 turni), Calamita 50 (+50% dorati). Flow: Compra→scorta→Attiva solo pre-partita→pending persistente→primo tap consuma 1 e attiva run→chip basso-dx→Disattiva solo pre-partita.
- Upgrade (prezzo fisso/livello): Tolleranza 50 max3 (+0.05 Perfect/lvl), Combo 70 max3 (+1 moneta/lvl), Timer Frenzy 60 max2 (7s/10s). UI pallini livello, MAX disabled.

## 12. UI Layout
- Top-center: score 4.2rem + record + special-banner (alert 1.75rem gialla pulsante).
- Alto-sx: pill monete oro + Perfect. Alto-dx: menu.
- Basso-sx: bottone bomba con fill. Basso-dx: chip power-up.
- Centro-bottom: frenzy-hud / blast-hud (titolo, timer bar 220px, 4 bottoni, info).
- Overlay: shop a tab, gameover (`Hai mancato il blocco! + stats + Rigioca/Negozio`), flash fullscreen.

## 13. Juice / FX
flash overlay 80ms; shake max(mag,time); vibrate (20 taglio, 50 perfect, [40,40,80] bomba, [80,50,80] demolizioni, [60,40,60,40,120] sblocchi); particelle box .22 con gravita .15, scala *.985; overhang speedY-=0.05 rimossi y<-30; blinkT globale; blocchi normali hsl(lvl*14,75%,60%) Lambert.
- **Suono esplosione 8-bit NES**: `sfxBlockExplode()` — pulse square + noise + triangle, suono crush 8-bit. Chiamato su bomba, TNT, frenzy hit, color blast.
- **Vortice di cubi colorati**: su bomba e color blast. 80 cubi (0.45 unità) orbitano attorno alla torre (raggio 4.5-7), dal basso verso l'alto, con spin su tutti gli assi, dissolvendosi (shrink + fade) arrivati in cima. Durata sincronizzata con l'esplosione (bomba: total×0.13s, color blast: 1.5s).
- **TAP TO PLAY**: testo lampeggiante (blink 1.2s) centrato in basso, z-index 30 (sotto shop overlay z-50), mostrato quando il gioco non è iniziato.

## 14. Stati & Edge
preRun→inRun→demolishing (async 130ms/step, id demolishSeq per abort)→frenzy/blast→gameEnded→restart. restartGame pulisce tutto, reset score/speed .15/dir x/bombe/run/eventi/countdown 5/streak, 2 basi, camera (20,20,20). endGame cleanup eventi + moving→overhang + overlay. Basi 0-1 mai rimosse/colorate. Speed mai resettata tranne restart.

## 15. Tuning (codice)
boxH 1, basi 10x10 x2, range ±20, speed .15+.005 (no TNT), perfect .3+.05/lvl, magnet 1.6/delta*.25, coin gold .1/+15-20, edge .25/+0, std +3-5, bomba max3/ogni10/potenza10, tnt 2/cascata 130ms, frenzy ogni15/10%/5s(7/10)/min50, blast ogni15/10%/8s=4x2s/min75, slow 15 turni x.8, upg tol50x3/combo70x3/frenzy60x2.

## 16. Debiti & Next
Nessun test, README vuoto, runMagnet solo boost drop, bilanciamento da playtest. Mancano audio/tutorial/leaderboard/settings. Backlog: daily, skin, zen mode, boss.

## 17. QA rapido
Aprire index.html con internet. Click piazza, shop da Menu, bomba dopo 10 perfect, Frenzy dopo record 50, Blast dopo 75. Test miss con/senza cuore, TNT -2, bomba -10, frenzy ok/ko, blast one-shot/timeout, R, persistenza refresh.
