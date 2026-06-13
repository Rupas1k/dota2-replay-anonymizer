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

fn read_replay_bytes(input: &[u8]) -> Result<JsValue, JsValue> {
    let replay = d2_replay_anonymizer::read_replay(input)
        .map_err(|err| JsValue::from_str(&err.to_string()))?;

    let inspection = Object::new();
    let players = Array::new();

    for player in replay.players {
        let value = Object::new();
        set_property(
            &value,
            "player_id",
            &JsValue::from_f64(player.player_id as f64),
        )?;
        set_property(
            &value,
            "steam_id",
            &JsValue::from(BigInt::from(player.steam_id)),
        )?;
        set_property(
            &value,
            "team_slot",
            &JsValue::from_f64(player.team_slot as f64),
        )?;
        set_property(
            &value,
            "team_num",
            &JsValue::from_f64(player.team_num as f64),
        )?;
        set_property(&value, "hero_id", &JsValue::from_f64(player.hero_id as f64))?;
        set_property(&value, "name", &JsValue::from_str(&player.name))?;
        players.push(&value);
    }

    set_property(&inspection, "players", &players)?;
    set_property(
        &inspection,
        "input_bytes",
        &JsValue::from_f64(replay.input_bytes as f64),
    )?;
    set_property(
        &inspection,
        "playback_ticks",
        &JsValue::from_f64(replay.playback_ticks as f64),
    )?;

    Ok(inspection.into())
}

fn parse_options(options: &str) -> Result<d2_replay_anonymizer::AnonymizeOptions, JsValue> {
    serde_json::from_str(options).map_err(|err| JsValue::from_str(&err.to_string()))
}

fn clear_output() {
    OUTPUT.with(|output| {
        *output.borrow_mut() = None;
    });
}

#[wasm_bindgen]
pub fn load_replay(input: Vec<u8>) -> Result<JsValue, JsValue> {
    clear_output();

    REPLAY.with(|replay| {
        *replay.borrow_mut() = Some(input);

        let inspection = {
            let replay = replay.borrow();
            read_replay_bytes(replay.as_deref().expect("replay was just loaded"))
        };

        if inspection.is_err() {
            *replay.borrow_mut() = None;
        }

        inspection
    })
}

#[wasm_bindgen]
pub fn clear_replay() {
    REPLAY.with(|replay| {
        *replay.borrow_mut() = None;
    });
    clear_output();
}

#[wasm_bindgen]
pub fn anonymize_loaded_replay(options: &str) -> Result<Uint8Array, JsValue> {
    clear_output();

    let options = parse_options(options)?;
    let output = REPLAY.with(|replay| {
        let replay = replay.borrow();
        let input = replay
            .as_deref()
            .ok_or_else(|| JsValue::from_str("No replay loaded."))?;

        d2_replay_anonymizer::anonymize_replay_bytes_with_options(input, options)
            .map_err(|err| JsValue::from_str(&err.to_string()))
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
    clear_output();
}
