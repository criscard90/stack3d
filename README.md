# stack3d

Gioco 3D "stack" in un singolo file: `index.html` (nessun build, nessun asset esterno oltre le CDN).

## Avvio
Apri `index.html` nel browser. Serve una connessione internet per le CDN:
- **Three.js r128** — rendering 3D
- **Tone.js 14.7.77** — colonna sonora dinamica

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
Due sistemi paralleli, entrambi procedurali (nessun file audio):

- **Musica** — sequencer Tone.js a 16 note con pad, basso, batteria e arpeggio. Cambia modalità e intensità con lo stato di gioco:
  | Modalità | Quando | Bpm |
  |---|---|---|
  | `menu` (chill) | Menu / game over | 78 |
  | `game` (groove) | Partita in corso | 104 |
  | `frenzy` (hyper) | Frenzy Color | 140 |
  | `danger` (tensione) | Bomba / TNT | 92 |
  L'intensità cresce con score, perfect streak e altezza della torre.

- **SFX** — ZzFX + layer Tone.js (pluck, perfect, coin, boom, zap, magnet, shoot, UI).

I toggle sono indipendenti: **SFX** spegne solo gli effetti, **Musica** spegne solo la colonna sonora. Il volume master è in `Tone.Destination.volume`.

## HUD
Pillola `🎵 <modalità> · <stile> · <bpm>` in alto a sinistra, accanto a monete e perfect streak.
