# STACK3D — Contesto Progetto (21/10/2026)

> Single-file game: `index.html` (1337 righe di JS inline). README minimale.
> Stack: Three.js r128 via CDN + **Web Audio API nativa**, nessun build. Persistenza `localStorage`.
> Branch `main` sync con origin.

## 0. Audio: Web Audio API (SFX) + MP3 in loop (musica)
- **Motore leggero**: Tone.js e ZzFX rimossi del tutto. Gli SFX sono generati con `OscillatorNode`/`BufferSource` nativi.
- **Architettura**: un solo `AudioContext` → bus `waSfxBus` gain 1.0 → `waComp` (DynamicsCompressor) → `waMaster` (gain utente) → destination. **Il bus musica non esiste più**: la musica è un `<audio>` HTML5 standard.
- **Musica**: file `8bit Stack Tower.mp3` (in root del repo) in loop tramite `<audio id="bgm" src="8bit%20Stack%20Tower.mp3" loop preload="auto">`. Il nome è URL-encoded per gli spazi.
- **Nessun sequencer generativo**: rimossi `AUDIO_MODES`, `waTick`/`waScheduleStep`, `waPadChord`/`waBassNote`/drummer, `waMusicBus`, `waMusicStart`/`waMusicStop`, `waWatchStart`, `musicMode` e le modalità musicali (menu/game/frenzy/danger). La musica non cambia più con lo stato di gioco.
- **Mix**: volume MP3 = `waVol * WA_BGM_GAIN` (0.55) → il master Web Audio resta per gli SFX. `waSetVol`/`waMuteSync` chiamano `waBgmSync()` per tenere il volume allineato.
- **SFX**: procedurali (pluck, perfect, coin, boom, zap, magnet, shoot, UI), nessun asset esterno. Il riverbero (`waVerbInit`) e il compressore restano invariati.
- `musicOn` controlla **solo** la musica (start/pause dell'`<audio>`); `soundOn` controlla **solo** gli SFX. Il master non viene mai mutato, solo regolato in gain.
- `waMaster.gain` = master volume utente (`stack3d_vol`).
- Il playback parte al **primo gesto utente** (`audioUnlock` → `waBgmPlay()`), come impone l'autoplay policy. `waBgmPlay`/`waBgmStop`/`waBgmSync`/`waBgmInit` gestiscono l'`<audio>`; il `play()` è avvolto in try/catch per non generare rejection non gestite.
- La musica non dipende dal Web Audio: `audioUnlock()` avvia l'MP3 **prima** di verificare la disponibilità di `AudioContext`, quindi parte anche se il context fallisce.
- Toggle Musica: `toggleMusic()` → `waBgmStop()` (OFF) oppure `audioUnlock()` + `waBgmPlay()` (ON).
- Loop nativo dell'elemento `<audio>`: niente scheduling, niente guard anti-stuttering, niente voice cap.
- HUD: in alto a sinistra solo monete e perfect streak (la pillola musica `#music-pill` è stata rimossa).
- Modalità musicali (`AUDIO_MODES`): **rimosse** (menu/game/frenzy/danger) — la musica è un unico brano in loop.

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
- Tutto in un file. bridge/ solo infra Cline, non di gioco. README minimale.
- **Test**: `test_bgm.js` (node, senza dipendenze) gira Chrome headless via CDP con un server statico temporaneo e verifica: `<audio id="bgm">` presente, sblocco al primo gesto, avanzamento del playback, toggle Musica OFF/ON, volume master applicato all'MP3, SFX ancora funzionanti, wrap del loop, persistenza di `stack3d_music=0`, reload, assenza di residui procedurali, nessun errore in console. Uso: `node test_bgm.js`.
- Tuning: BOMB_POWER=10, TNT_POWER=2, FRENZY_TIME=5, SPEED_INC=0.005.
- **Bug 7 (fixato)**: in `handlePlace()` la `const on=[]` era dichiarata dentro `if(firstPlace){...}` ma letta fuori → `ReferenceError: on is not defined` al primo tap, che abortiva il piazzamento del primo blocco di ogni partita. Ora `let on=[]` hoisted. La riga `if(firstPlace)musicMode='game'` è stata rimossa insieme al sequencer.
- Verifica audio: harness jsdom in `/tmp/s3dtest` (stub Three/Tone/WebAudio) — 74 test (funzionali, toggle, isolamento bus, HUD, stress) tutti verdi. Non incluso nel repo.

## 9. Run
Aprire index.html (CDN internet). Click piazzare, Menu per shop, bottone bomba, frenzy auto dopo 50.
Primo gesto utente necessario (autoplay policy): la musica MP3 parte al primo tocco/click, gli SFX richiedono l'`AudioContext` che si sblocca con lo stesso gesto.
Nota: il file `8bit Stack Tower.mp3` (2.8 MB) è un asset del repo e va servito come `audio/mpeg` (se aperto via `file://` alcuni browser lo caricano comunque, ma è consigliato servire via HTTP).

