use std::env;
use std::fs;
use std::io::{BufReader, BufWriter, Read, Write};
use std::time::Instant;

fn parse_args() -> anyhow::Result<(String, String)> {
    let mut args = env::args();
    let program = args
        .next()
        .unwrap_or_else(|| "d2-replay-anonymizer".to_string());

    let Some(input_path) = args.next() else {
        anyhow::bail!("Usage: {program} <input.dem> <output.dem>");
    };
    let Some(output_path) = args.next() else {
        anyhow::bail!("Usage: {program} <input.dem> <output.dem>");
    };
    if args.next().is_some() {
        anyhow::bail!("Usage: {program} <input.dem> <output.dem>");
    }

    Ok((input_path, output_path))
}

fn main() -> anyhow::Result<()> {
    let (input_path, output_path) = parse_args()?;
    let start = Instant::now();
    let input_file = fs::File::open(input_path)?;
    let mut reader = BufReader::new(input_file);
    let mut input = Vec::new();
    reader.read_to_end(&mut input)?;
    let output = d2_replay_anonymizer::anonymize_replay_bytes(&input)?;
    let output_file = fs::File::create(output_path)?;
    let mut writer = BufWriter::new(output_file);
    writer.write_all(&output)?;
    writer.flush()?;
    println!("Elapsed: {:?}", start.elapsed());

    Ok(())
}
