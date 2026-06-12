# Dota 2 Replay Anonymizer

Browser UI for anonymizing Dota 2 `.dem` replay files locally. The React app runs
the Rust anonymizer through Wasm and downloads the rewritten replay bytes without
uploading the file.

## Development

```sh
npm install
npm run build:wasm
npm run dev
```

## Production build

```sh
npm run build
```

The Rust anonymizer crate is in `crates/anonymizer`; the Wasm bridge is in
`crates/wasm`.
