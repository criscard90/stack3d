# stack3d

Gioco 3D "stack" in un singolo file: `index.html` (nessun build, nessun asset esterno oltre le CDN).

## Avvio
Apri `index.html` nel browser. Serve una connessione internet solo per la CDN:
- **Three.js r128** — rendering 3D

L'audio è **nativo Web Audio API**: nessuna libreria audio, nessun asset estterno, nessuna CDN audio.

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
Un solo sistema, **Web Audio API nativa** (nessuna libreria, nessun asset esterno, nessun fallback):

- **Architettura** — un solo `AudioContext` → 2 bus (`music` gain 0.9 / `sfx` gain 1.0) → `DynamicsCompressor` → master gain → destination.
- **Musica** — sequencer generativo a 16 note con pad, basso, batteria e arpeggio, scheduled in anticipo sul clock del `AudioContext` (lookahead 120ms, tick 25ms). Cambia modalità e intensità con lo stato di gioco:
  | Modalità | Quando | Bpm |
  |---|---|---|
  | `menu` (chill) | Menu / game over | 78 |
  | `game` (groove) | Partita in corso | 104 |
  | `frenzy` (hyper) | Frenzy Color | 140 |
  | `danger` (tensione) | Bomba / TNT | 92 |
  L'intensità cresce con score, perfect streak e altezza della torre.

- **SFX** — procedurali con `OscillatorNode`/`BufferSource` (pluck, perfect, coin, boom, zap, magnet, shoot, UI).
- **Riverbero** — delay+feedback leggero, con send dal bus SFX al 22% (niente convolver: era la causa dei crash).

I toggle sono indipendenti: **SFX** spegne solo gli effetti, **Musica** spegne solo la colonna sonora. Il volume master è in `waMaster.gain` (persistito in `stack3d_vol`).

## HUD
In alto a sinistra le pillole di monete e perfect streak.
