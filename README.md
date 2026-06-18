# Dota 2 Replay Anonymizer

Dota 2 Replay Anonymizer is a local rewriter for Dota 2 replay files (`.dem`). It removes selected player, match, team, and replay details while keeping the file in replay format. Use it as a Rust library, through the command-line tool, or in the browser app.

Processing is local. The CLI works with files on disk, and the browser app runs the Rust anonymizer through WebAssembly without uploading the replay.

## What It Can Remove

- Player identity: Steam IDs and player names.
- Cosmetics: hero cosmetics, courier models, ward models, poogie models, and effigy statue wearables.
- Profile details: Dota Plus levels, icons, and badges; guild ID, logo, colors, and tier.
- Input traces: camera movements, cursor movements, and clicks.
- Communication: text chat, chat wheel lines, map pings, and minimap drawings.
- Global identifiers: match ID, lobby name, league ID.
- Team identity: Radiant and Dire team names, tags, tournament team IDs, logo, base logo, and banner logo.
- Extra: combat log messages, broadcaster channels, and broadcaster voice data

## Interfaces

- Rust library for replay inspection and rewriting.
- `d2ra` CLI for single files or batches.
- Browser app for reviewing players and options before downloading the anonymized replay.

## Requirements

- Rust toolchain with Cargo.
- Node.js and npm for the browser app.
- `wasm-pack` for building the WebAssembly package used by the browser app.

Install `wasm-pack` if it is not already available:

```bash
cargo install wasm-pack
```

## CLI

### Prebuilt Binary

Prebuilt `d2ra` binaries are available on the [GitHub Releases](https://github.com/Rupas1k/dota2-replay-anonymizer/releases) page. Download the archive for your platform, extract it, and put the `d2ra` binary somewhere on your `PATH`.

### Build From Source

You can also build the CLI locally:

```bash
cargo build --release -p d2-replay-anonymizer-cli
```

The source-built binary is written to `target/release/d2ra`.

Anonymize one replay:

```bash
d2ra input.dem output.dem
```

Use an options file:

```bash
d2ra input.dem output.dem --options options.json
```

Process a directory of replays:

```bash
d2ra ./replays/raw ./replays/anonymized --options options.json --jobs 8
```

When the input is a directory, the CLI recursively finds `.dem` files and mirrors the input directory structure under the output directory.

```text
d2ra <input.dem> <output.dem> [--options options.json] [--jobs N]
d2ra <input_dir> <output_dir> [--options options.json] [--jobs N]
```

`--jobs` controls the number of worker threads used for directory processing. It must be greater than zero and defaults to `1`.

## Browser App

Install dependencies:

```bash
npm install
```

For local development, build the WASM bindings once, then start Vite:

```bash
npm run build:wasm
npm run dev
```

Build the production app:

```bash
npm run build
```

`npm run build` runs `npm run build:wasm` first and then runs `vite build`.

Preview the production build:

```bash
npm run preview
```

In the app:

1. Load a `.dem` replay file.
2. Review detected players and replay metadata.
3. Adjust global options and per-player rules.
4. Export options JSON if you want to reuse the settings.
5. Download the anonymized replay.

## Options JSON

All fields are optional when Rust reads the JSON; missing fields use the library defaults. The browser exports the same schema the CLI accepts.

For CLI and browser options, leave `players` empty. Use `player_selection_mode`, `include_steam_ids`, and `exclude_steam_ids` to choose which players are anonymized.

Steam IDs may be strings or numbers. Strings are safer in JSON that may pass through JavaScript, because Steam IDs are larger than JavaScript can represent precisely as numbers.

Reusable CLI/browser options:

```json
{
  "player_selection_mode": "include_all",
  "include_steam_ids": [],
  "exclude_steam_ids": ["76561198000000000"],
  "players": [],
  "remove_match_id": true,
  "remove_lobby_name": true,
  "remove_league_info": true,
  "remove_chat_messages": true,
  "remove_chat_wheel": true,
  "remove_map_pings": true,
  "remove_minimap_drawings": true,
  "remove_player_names": true,
  "remove_player_steam_ids": true,
  "remove_hero_cosmetics": true,
  "remove_courier_cosmetics": true,
  "remove_ward_cosmetics": true,
  "remove_poogie_cosmetics": true,
  "remove_statue_cosmetics": true,
  "remove_dota_plus_badges": true,
  "remove_guild_data": true,
  "remove_team_name": true,
  "remove_team_tag": true,
  "remove_tournament_team_id": true,
  "remove_team_logo": true,
  "remove_plus_subscriber": true,
  "remove_broadcaster_info": true,
  "remove_combat_log": false,
  "remove_player_camera_movements": false,
  "remove_player_mouse_movements": false,
  "remove_player_clicks": false
}
```

In the CLI and browser app, player selection is resolved after the replay has been inspected:

- `player_selection_mode: "include_all"` anonymizes detected players by default.
- `player_selection_mode: "exclude_all"` keeps detected players by default.
- `include_steam_ids` marks matching players for anonymization.
- `exclude_steam_ids` marks matching players to be kept.

## Rust Library

Use the library from this workspace:

```toml
[dependencies]
d2-replay-anonymizer = { path = "crates/anonymizer" }
```

Or use the Git repository:

```toml
[dependencies]
d2-replay-anonymizer = { git = "https://github.com/Rupas1k/dota2-replay-anonymizer.git" }
```

Rewrite a replay with the default options. With no `players` overrides, the default rules apply to every player in the replay.

```rust
use std::fs::File;
use std::io::{BufReader, BufWriter};

use d2_replay_anonymizer::{anonymize, AnonymizeOptions};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let input = BufReader::new(File::open("input.dem")?);
    let output = BufWriter::new(File::create("output.dem")?);

    anonymize(input, AnonymizeOptions::default(), output)?;

    Ok(())
}
```

Inspect replay metadata:

```rust
use std::fs::File;
use std::io::BufReader;

use d2_replay_anonymizer::scan_reader;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let replay = scan_reader(BufReader::new(File::open("input.dem")?))?;

    println!("playback ticks: {}", replay.playback_ticks);

    for player in replay.players {
        println!("{} {}", player.player_id, player.steam_id);
    }

    Ok(())
}
```

Use metadata to build per-player rewrite rules:

```rust
use std::fs::File;
use std::io::{BufReader, BufWriter};

use d2_replay_anonymizer::{
    anonymize, scan_reader, AnonymizeOptions, PlayerOption,
};

const STEAM_IDS_TO_KEEP: &[u64] = &[
    76561198000000000,
    76561198000000001,
    76561198000000002,
];

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let input_path = "input.dem";
    let output_path = "output.dem";

    let replay = scan_reader(BufReader::new(File::open(input_path)?))?;

    let player_rules = replay
        .players
        .into_iter()
        .map(|player| PlayerOption {
            player_id: player.player_id,
            steam_id: player.steam_id,
            anonymize: !STEAM_IDS_TO_KEEP.contains(&player.steam_id),
        })
        .collect::<Vec<_>>();

    let options = AnonymizeOptions {
        players: player_rules,
        ..AnonymizeOptions::default()
    };

    let input = BufReader::new(File::open(input_path)?);
    let output = BufWriter::new(File::create(output_path)?);

    anonymize(input, options, output)?;

    Ok(())
}
```

The library exports:

- `inspect` and `scan` for byte slices.
- `scan_reader` for seekable readers.
- `anonymize_bytes` for in-memory rewriting.
- `anonymize` for seekable input and output streams.
- `AnonymizeOptions`, `AnonymizeRules`, `PlayerOption`, `PlayerSelectionMode`, `ReplayPlayer`, and `ReplayRead`.

Custom callers can implement `AnonymizeRules` instead of using `AnonymizeOptions` directly.

`AnonymizeOptions::players` is for Rust callers that already have replay metadata and want explicit per-player decisions. Values should come from `scan_reader` or `inspect` for the same replay. Replay player IDs are not portable across arbitrary replays.

## GitHub Pages

The Pages build uses Vite's `pages` mode:

```bash
npm run build:pages
```

This builds the WASM package first, then writes the static site to `dist` with `base` set to `/dota2-replay-anonymizer/`. Publish the contents of `dist` from your GitHub Pages workflow or deployment script.

If the repository or Pages path changes, update the `base` value in `vite.config.ts` before deploying.

## Project Layout

| Path                | Purpose                                                                  |
|---------------------|--------------------------------------------------------------------------|
| `crates/anonymizer` | Core Rust library for reading, inspecting, and rewriting replay bytes.   |
| `crates/cli`        | `d2ra` CLI wrapper around the library.                                   |
| `crates/wasm`       | `wasm-bindgen` bindings used by the browser app.                         |
| `src`               | React + Vite browser app and replay worker.                              |
| `src/anonymizer`    | Browser-side option mapping, player-rule handling, and OpenDota lookups. |

## Development Checks

Useful local checks:

```bash
cargo fmt --all
cargo test --workspace
npm run build
```

`npm run build` includes `npm run build:wasm`, so it verifies that the Rust WASM bindings and the React app compile together.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
