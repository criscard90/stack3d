# stack3d

Gioco 3D "stack" in un singolo file: `index.html` (nessun build). Asset esterni minimi:
- **Three.js r128** — rendering 3D (CDN)
- **`8bit Stack Tower.mp3`** — colonna sonora in loop (root del repo)

## Avvio

Apri `index.html` nel browser, oppure servilo via HTTP (consigliato, per l'MP3):

```bash
npx serve .        # oppure: python -m http.server 8080
```

Serve una connessione internet solo per la CDN di Three.js.

> La musica parte al **primo gesto utente** (click/tap), come impone la autoplay policy dei browser.

## Comandi
| Input | Azione |
|---|---|
| Click / Tap | Piazza il blocco in movimento |
| `Spazio` | Piazza il blocco |
| `B` | Detona la bomba caricata |
| `1`–`4` | Frenzy / Color Blast: distruggi il colore scelto |
| `R` | Rigioca (a fine partita) |
| `M` | Accendi/spegni gli SFX |

## Audio
Due sistemi indipendenti:

- **Musica** — il file `8bit Stack Tower.mp3` riprodotto in loop da un elemento `<audio id="bgm" loop>` nel DOM. Non è più generata proceduralmente: non ci sono modalità musicali né sequencer. Il volume segue il master (`waVol * 0.55`).
- **SFX** — nativi **Web Audio API** (nessuna libreria, nessun asset esterno, nessun fallback): pluck, perfect, coin, boom, zap, magnet, shoot, UI. Bus SFX → `DynamicsCompressor` → master gain → destination.
- **Riverbero** — delay+feedback leggero, con send dal bus SFX al 22% (niente convolver: era la causa dei crash).

I toggle sono indipendenti: **SFX** spegne solo gli effetti, **Musica** spegne solo la colonna sonora. Il volume master è in `waMaster.gain` (persistito in `stack3d_vol`) e viene applicato anche all'MP3.

## HUD
In alto a sinistra le pillole di monete e perfect streak.
