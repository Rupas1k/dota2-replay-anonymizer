use std::{env, fs, path::PathBuf, process};

use d2_replay_anonymizer::{anonymize_replay_bytes_with_options, AnonymizeOptions};

struct Args {
    input: PathBuf,
    options: Option<PathBuf>,
    output: PathBuf,
}

fn main() {
    if let Err(error) = run() {
        eprintln!("{error}");
        process::exit(1);
    }
}

fn run() -> Result<(), Box<dyn std::error::Error>> {
    let args = parse_args()?;
    let input = fs::read(&args.input)?;
    let options = match args.options {
        Some(path) => serde_json::from_slice(&fs::read(path)?)?,
        None => AnonymizeOptions::default(),
    };
    let output = anonymize_replay_bytes_with_options(&input, options)?;

    fs::write(&args.output, output)?;
    Ok(())
}

fn parse_args() -> Result<Args, String> {
    let mut args = env::args_os().skip(1);

    let Some(input) = args.next() else {
        return Err(usage());
    };
    let Some(next) = args.next() else {
        return Err(usage());
    };

    let (options, output) = match args.next() {
        Some(output) => {
            if args.next().is_some() {
                return Err(usage());
            }

            (Some(next.into()), output.into())
        }
        None => (None, next.into()),
    };

    Ok(Args {
        input: input.into(),
        options,
        output,
    })
}

fn usage() -> String {
    "Usage: d2-replay-anonymizer <input.dem> [options.json] <output.dem>".to_string()
}
