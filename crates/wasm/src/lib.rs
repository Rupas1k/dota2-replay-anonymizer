use d2_replay_anonymizer::{AnonymizeOptions, ReplayPlayer, ReplayRead};
use js_sys::{Array, BigInt, Object, Reflect, Uint8Array};
use std::cell::RefCell;
use wasm_bindgen::prelude::*;

thread_local! {
    static REPLAY: RefCell<Option<Vec<u8>>> = const { RefCell::new(None) };
    static OUTPUT: RefCell<Option<Vec<u8>>> = const { RefCell::new(None) };
}

fn set_property(target: &Object, key: &str, value: &JsValue) -> Result<(), JsValue> {
    Reflect::set(target, &JsValue::from_str(key), value).map(|_| ())
}

fn set_number(target: &Object, key: &str, value: impl Into<f64>) -> Result<(), JsValue> {
    set_property(target, key, &JsValue::from_f64(value.into()))
}

fn set_bigint(target: &Object, key: &str, value: u64) -> Result<(), JsValue> {
    set_property(target, key, &JsValue::from(BigInt::from(value)))
}

fn set_string(target: &Object, key: &str, value: &str) -> Result<(), JsValue> {
    set_property(target, key, &JsValue::from_str(value))
}

fn js_error(error: impl ToString) -> JsValue {
    JsValue::from_str(&error.to_string())
}

fn player_to_js(player: ReplayPlayer) -> Result<Object, JsValue> {
    let value = Object::new();

    set_number(&value, "player_id", player.player_id)?;
    set_bigint(&value, "steam_id", player.steam_id)?;
    set_number(&value, "team_slot", player.team_slot)?;
    set_number(&value, "team_num", player.team_num)?;
    set_number(&value, "hero_id", player.hero_id)?;
    set_string(&value, "name", &player.name)?;

    Ok(value)
}

fn inspection_to_js(replay: ReplayRead) -> Result<JsValue, JsValue> {
    let value = Object::new();
    let players = Array::new();

    for player in replay.players {
        let player = JsValue::from(player_to_js(player)?);
        players.push(&player);
    }

    set_property(&value, "players", &players)?;
    set_number(&value, "input_bytes", replay.input_bytes as f64)?;
    set_number(&value, "playback_ticks", replay.playback_ticks)?;

    Ok(value.into())
}

fn inspect_replay(input: &[u8]) -> Result<JsValue, JsValue> {
    let replay = d2_replay_anonymizer::inspect(input).map_err(js_error)?;
    inspection_to_js(replay)
}

fn scan_replay(input: &[u8]) -> Result<JsValue, JsValue> {
    let replay = d2_replay_anonymizer::scan(input).map_err(js_error)?;
    inspection_to_js(replay)
}

fn parse_options(options: &str) -> Result<AnonymizeOptions, JsValue> {
    serde_json::from_str(options).map_err(js_error)
}

fn clear_replay_bytes() {
    REPLAY.with(|replay| *replay.borrow_mut() = None);
}

fn clear_output_bytes() {
    OUTPUT.with(|output| *output.borrow_mut() = None);
}

#[wasm_bindgen]
pub fn load_replay_bytes(input: Vec<u8>) {
    clear_replay_bytes();
    clear_output_bytes();

    REPLAY.with(|replay| {
        *replay.borrow_mut() = Some(input);
    });
}

#[wasm_bindgen]
pub fn inspect_loaded_replay() -> Result<JsValue, JsValue> {
    REPLAY.with(|replay| {
        let replay = replay.borrow();
        let input = replay
            .as_deref()
            .ok_or_else(|| JsValue::from_str("No replay loaded."))?;

        inspect_replay(input)
    })
}

#[wasm_bindgen]
pub fn quick_scan_loaded_replay() -> Result<JsValue, JsValue> {
    REPLAY.with(|replay| {
        let replay = replay.borrow();
        let input = replay
            .as_deref()
            .ok_or_else(|| JsValue::from_str("No replay loaded."))?;

        scan_replay(input)
    })
}

#[wasm_bindgen]
pub fn load_replay(input: Vec<u8>) -> Result<JsValue, JsValue> {
    load_replay_bytes(input);
    let inspection = inspect_loaded_replay()?;

    Ok(inspection)
}

#[wasm_bindgen]
pub fn clear_replay() {
    clear_replay_bytes();
    clear_output_bytes();
}

#[wasm_bindgen]
pub fn anonymize_loaded_replay(options: &str) -> Result<Uint8Array, JsValue> {
    clear_output_bytes();

    let options = parse_options(options)?;
    let output = REPLAY.with(|replay| {
        let replay = replay.borrow();
        let input = replay
            .as_deref()
            .ok_or_else(|| JsValue::from_str("No replay loaded."))?;

        d2_replay_anonymizer::anonymize_bytes(input, options).map_err(js_error)
    })?;

    OUTPUT.with(|stored| {
        *stored.borrow_mut() = Some(output);

        let stored = stored.borrow();
        let output = stored
            .as_deref()
            .expect("output was just stored before creating a view");

        Ok(unsafe { Uint8Array::view(output) })
    })
}

#[wasm_bindgen]
pub fn release_anonymized_replay() {
    clear_output_bytes();
}
