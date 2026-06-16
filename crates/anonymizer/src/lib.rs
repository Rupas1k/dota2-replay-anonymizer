mod options;
mod player;
mod reader;
mod writer;

pub use options::{AnonymizeOptions, AnonymizeRules, PlayerOption, PlayerSelectionMode};
pub use player::ReplayPlayer;
pub use reader::ReplayRead;
use source2_demo::prelude::ParserError;
use std::io::{Read, Seek, Write};

pub fn read_replay(input: &[u8]) -> Result<ReplayRead, ParserError> {
    reader::read_replay(input)
}

pub fn quick_scan_replay(input: &[u8]) -> Result<ReplayRead, ParserError> {
    reader::quick_scan_replay(input)
}

pub fn quick_scan_replay_reader<R>(input: R) -> Result<ReplayRead, ParserError>
where
    R: Read + Seek,
{
    reader::quick_scan_replay_reader(input)
}

pub fn anonymize_replay_bytes_with_options<O>(
    input: &[u8],
    options: O,
) -> Result<Vec<u8>, ParserError>
where
    O: AnonymizeRules + 'static,
{
    writer::anonymize_replay_bytes_with_options(input, options)
}

pub fn anonymize_replay_with_options<R, O, W>(
    input: R,
    options: O,
    output: W,
) -> Result<W, ParserError>
where
    R: Read + Seek,
    O: AnonymizeRules + 'static,
    W: Write + Seek,
{
    writer::anonymize_replay_with_options(input, options, output)
}
