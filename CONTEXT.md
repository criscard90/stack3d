# STACK3D — Contesto Progetto (20/10/2026, commit e27700d)

> Single-file game: `index.html` (700 righe). README vuoto.
> Stack: Three.js r128 via CDN, nessun build. Persistenza `localStorage`.
> Branch `main` sync con origin. Ultimo pull: `56e8504..e27700d` (12 commit).

## 1. Core gameplay
- Torre box 3x3, `boxHeight=1`, base fissa. Moving oscilla x/z tra -20/+20.
- `speed=0.12`, +0.005 a ogni piazzamento normale (NON su TNT/frenzy/bomba).
- Oscillazione congelata durante `demolishing` o `frenzyActive`.
- Click/tap = `handlePlace()`. Miss con `overlap<=0`: se `runLife` perdi solo blocco, else `endGame()`.
- Hit: taglio overhang (cade con gravita), resize, `score++`, camera `20+(len-2)*h`.
- Perfect se `|delta| < 0.25 + upg.tol*0.05`: snap, streak++, `coins += 1+upg.combo`.
- Meta in `stack3d_meta_v1`: coins, high, inv/pending{life,slow,magnet}, upg{tol,combo,frenzyTime}, equip{trail,fx,aura,frame,shape}.

## 2. Blocchi speciali (pickSpecial, solo len>4, no frenzy)
- TNT 8%, magnet 10%, coin 12%. Banner `---- X IN ARRIVO ----`.
- Outline EdgesGeometry + emissive: TNT rosso blink, coin oro rotante con texture `$`, magnet ciano blink.
- Magnete: `delta*=0.25`, `snapTol=1.6` (calamita sul piazzamento).
- Coin: soglie placeErr -> <tol PERFECT +20, <0.3 +10, <0.6 +5, else +2.
- TNT -> detonateTNT(): TNT esplode + 2 sotto a cascata (130ms/step, FX bomba). Solo Y ritoccata, mai X/Z. Ricentro nuova cima, camera giu subito, moving resettato a top, speed invariata. `TNT_POWER=2`.

## 3. Bombe (perfect)
- Ogni 10 perfect -> `bombs++` max 3. Bottone basso-sx con fill `charge/10`.
- detonateBomb(): `total=min(10, len-3)`, cascata conserva 2 basi, burst 60, banner `-N pezzi`. Reset moving a top fisico, speed invariata, camera giu subito.

## 4. Frenzy Color Blast
- Sblocco permanente a score>=50, flag `stack3d_frenzy_unlocked`, alert grande una tantum.
- Trigger: ogni 15 blocchi, 10% chance, solo se sbloccato + len>4.
- Durata `5 + upg.frenzyTime*2` sec. Pittura 4 colori (red/green/blue/yellow) su torre tranne 2 basi + moving (salva origColor, rimuove texture coin, nasconde outline).
- HUD 4 bottoni, sfere sequenziali ogni 320ms cadono dall'alto; hit colore giusto -> rimuovi top, score++, coins+=2; colore sbagliato -> banner + FX grigia. Fine: ripristino colori/scala/texture, reset moving, speed invariata.
## 4b. Color Blast 💥 (NUOVO)
- Sblocco permanente a highScore>=75, flag `stack3d_blast_unlocked`, alert `💥 COLOR BLAST SBLOCCATO! ✨` una tantum.
- Trigger: ogni 15 blocchi, 10% chance, solo se sbloccato + len>4 + NON durante frenzy/demolizioni (mutua esclusione con frenzy).
- Durata 8s = 4 ondate x 2s (`BLAST_DURATION/WAVES/WAVE_TIME`). A ogni ondata TUTTA la torre (tranne 2 basi + moving) si ricolora con nuova combinazione casuale dei 4 colori (riuso `frenzyColorize`, salva/ripristina origColor).
- HUD `#blast-hud` dedicato (fixato id duplicato `frenzy-btns` -> `blast-btns` + selettore CSS `.blast-btns` -> `#blast-btns`): 4 tasti colore, timer, conteggio live per colore + ondata/distrutti/secondi.
- `explodeBlast(color)`: ONE-SHOT — rimuove TUTTI i blocchi di quel colore in un colpo (indici da len-2 a 2, mai basi/moving), +1 score e +2 coins a blocco, poi chiama subito `endBlast(msg)` (evento finito, tasti riabilitati, piazzamento sbloccato); se nessun blocco di quel colore: FX grigia + `endBlast` con messaggio. Tasti 1-4 anche da tastiera.
- Fine (`endBlast(finalMsg)`): messaggio custom se one-shot altrimenti riepilogo, ripristino colori/scala, moving adattato al top fisico (come frenzy), speed invariata, `saveMeta+refreshHUD`. Lo scadere degli 8s chiude l'evento solo se il giocatore non ha premuto alcun colore.
- Guardie: `handlePlace`/Space/B/blast-bomba bloccati durante blast, `pickSpecial` null, `startFrenzy` bloccato durante blast, cleanup in `endGame`/`restartGame`, pulse scala condiviso frenzy+blast in animation.
## 5. Shop (tab Estetica/Consumabili/Miglioramenti)
- Menu alto-dx -> popup Ricomincia/Negozio. Header/footer sticky.
- Estetica live via applyEquip: scie none/neon/pixel/fire/rainbow (0/40/60/80/100), distruzione burst/confetti/fireworks/hearts/snow/ghost (0/60/90/90/70/120), auree none/neon/gold/cyan/rainbow (gold=12 sprite nebbiolina additiva), cornici none/gold/neon/retro, forme box/cylinder/rounded/hexagon/star (star=ExtrudeGeometry 5 punte, 150). rebuildShape() preserva materiali/scala/frenzy/outline.
- Consumabili (life 80, slow 60, magnet 70): pending armato persistente, al primo tap inv-- e runLife/runSlowLeft=15/runMagnet. Banner Power-up attivi. Disattiva in shop. Chip basso-dx visibili pre-partita (pending+scorta) e in-game (run attivi).
- Miglioramenti max 5 lvl costo 50*(lvl+1): tol (+0.05 perfect), combo (+1 coin), frenzyTime (+2s).
- Bottoni: Compra/Migliora oro, Usa ciano outline, Attiva verde pieno, Attivo/MAX verde outline disabled.

## 6. UI/Juiciness
- Score top-center, pills monete/perfect alto-sx, bomb basso-sx, power basso-dx, frenzy centro-bottom, gameover overlay con Rigioca.
- FX: flash overlay, shake camera, vibrate, particelle Box 0.18, overhang caduta, blinkT speciali, trailTick scie.
- Camera (20,y,20) lookAt(0,y-20,0), lerp 0.08 salita, snap discesa.

## 7. Ultimo pull (12 commit da 56e8504)
e48fb25 shop espanso; f523f1a shop a tab; 76a9b36 margine; 7292e6a colori sezioni; a70f4dc stella; f5684cf nebbiolina gold; 8079ce5 frenzy da 50; ab5528a forma live; 08a80c7 frenzy permanente; 7acd307 bottoni; 401763f consumabili persistenti; e27700d chip subito dopo Attiva.

## 8. Debiti / note
- Tutto in un file, nessun test. runMagnet solo flag HUD (effetto globale non applicato?). bridge/ solo infra Cline, non di gioco. README vuoto.
- Tuning: BOMB_POWER=10, TNT_POWER=2, FRENZY_TIME=5, SPEED_INC=0.005.

## 9. Run
Aprire index.html (CDN internet). Click piazzare, Menu per shop, bottone bomba, frenzy auto dopo 50.

