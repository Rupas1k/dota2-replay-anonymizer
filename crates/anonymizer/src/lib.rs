mod options;
mod player;
mod reader;
mod writer;

pub use options::{AnonymizeOptions, AnonymizeRules, PlayerOption};
pub use player::ReplayPlayer;
pub use reader::ReplayRead;
use source2_demo::prelude::ParserError;

pub fn read_replay(input: &[u8]) -> Result<ReplayRead, ParserError> {
    reader::read_replay(input)
}

pub fn anonymize_replay_bytes_with_options(
    input: &[u8],
    options: AnonymizeOptions,
) -> Result<Vec<u8>, ParserError> {
    writer::anonymize_replay_bytes_with_options(input, options)
}
