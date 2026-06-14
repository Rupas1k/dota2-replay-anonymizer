mod options;
mod player;
mod reader;
mod writer;

pub use options::{AnonymizeOptions, AnonymizeRules, PlayerOption};
pub use player::ReplayPlayer;
pub use reader::ReplayRead;
use source2_demo::prelude::ParserError;
use std::io::{Read, Seek, Write};

pub fn read_replay(input: &[u8]) -> Result<ReplayRead, ParserError> {
    reader::read_replay(input)
}

pub fn anonymize_replay_bytes_with_options(
    input: &[u8],
    options: AnonymizeOptions,
) -> Result<Vec<u8>, ParserError> {
    writer::anonymize_replay_bytes_with_options(input, options)
}

pub fn anonymize_replay_with_options<R, W>(
    input: R,
    options: AnonymizeOptions,
    output: W,
) -> Result<W, ParserError>
where
    R: Read + Seek,
    W: Write + Seek,
{
    writer::anonymize_replay_with_options(input, options, output)
}
