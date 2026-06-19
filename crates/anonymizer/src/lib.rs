mod options;
mod player;
mod reader;
mod writer;

pub use options::{AnonymizeOptions, AnonymizeRules, PlayerOption, PlayerSelectionMode};
pub use player::ReplayPlayer;
pub use reader::ReplayRead;
use source2_demo::prelude::ParserError;
use std::io::{Read, Seek, Write};

pub fn full_scan_bytes(input: &[u8]) -> Result<ReplayRead, ParserError> {
    reader::full_scan_bytes(input)
}

pub fn full_scan<R>(input: R) -> Result<ReplayRead, ParserError>
where
    R: Read + Seek,
{
    reader::full_scan(input)
}

pub fn scan_bytes(input: &[u8]) -> Result<ReplayRead, ParserError> {
    reader::scan_bytes(input)
}

pub fn scan<R>(input: R) -> Result<ReplayRead, ParserError>
where
    R: Read + Seek,
{
    reader::scan(input)
}

pub fn anonymize_bytes<O>(input: &[u8], options: O) -> Result<Vec<u8>, ParserError>
where
    O: AnonymizeRules + 'static,
{
    writer::anonymize_bytes(input, options)
}

pub fn anonymize<R, O, W>(input: R, options: O, output: W) -> Result<W, ParserError>
where
    R: Read + Seek,
    O: AnonymizeRules + 'static,
    W: Write + Seek,
{
    writer::anonymize(input, options, output)
}
