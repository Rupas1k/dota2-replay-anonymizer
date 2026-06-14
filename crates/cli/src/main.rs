use std::{
    env,
    ffi::OsStr,
    fs,
    fs::File,
    io::{BufReader, BufWriter},
    path::{Path, PathBuf},
    process, thread,
};

use anyhow::{anyhow, bail, Context, Result};
use d2_replay_anonymizer::{anonymize_replay_with_options, AnonymizeOptions};

struct ReplayJob {
    input: PathBuf,
    output: PathBuf,
}

struct Args {
    input: PathBuf,
    options: Option<PathBuf>,
    output: PathBuf,
    jobs: usize,
}

fn main() {
    if let Err(error) = run() {
        eprintln!("{error:#}");
        process::exit(1);
    }
}

fn run() -> Result<()> {
    let args = parse_args()?;
    let options = read_options(args.options.as_deref())?;
    let jobs = build_jobs(&args.input, &args.output)?;

    run_jobs(jobs, options, args.jobs)
}

fn read_options(path: Option<&Path>) -> Result<AnonymizeOptions> {
    match path {
        Some(path) => {
            let bytes = fs::read(path)
                .with_context(|| format!("failed to read options {}", path.display()))?;
            serde_json::from_slice(&bytes)
                .with_context(|| format!("failed to parse options {}", path.display()))
        }
        None => Ok(AnonymizeOptions::default()),
    }
}

fn build_jobs(input: &Path, output: &Path) -> Result<Vec<ReplayJob>> {
    if input.is_dir() {
        if output.exists() && !output.is_dir() {
            bail!(
                "output must be a directory when input is a directory: {}",
                output.display()
            );
        }

        let inputs = collect_replays(input)?;
        return inputs
            .into_iter()
            .map(|replay| {
                let relative = replay
                    .strip_prefix(input)
                    .with_context(|| format!("failed to resolve replay path {}", replay.display()))?
                    .to_path_buf();

                Ok(ReplayJob {
                    input: replay,
                    output: output.join(relative),
                })
            })
            .collect();
    }

    if input.is_file() {
        return Ok(vec![ReplayJob {
            input: input.to_path_buf(),
            output: output.to_path_buf(),
        }]);
    }

    bail!("input does not exist: {}", input.display())
}

fn collect_replays(root: &Path) -> Result<Vec<PathBuf>> {
    let mut replays = Vec::new();
    let mut pending = vec![root.to_path_buf()];

    while let Some(dir) = pending.pop() {
        for entry in
            fs::read_dir(&dir).with_context(|| format!("failed to read {}", dir.display()))?
        {
            let path = entry
                .with_context(|| format!("failed to read {} entry", dir.display()))?
                .path();

            if path.is_dir() {
                pending.push(path);
            } else if is_replay_file(&path) {
                replays.push(path);
            }
        }
    }

    replays.sort();
    Ok(replays)
}

fn is_replay_file(path: &Path) -> bool {
    path.extension()
        .is_some_and(|extension| extension.eq_ignore_ascii_case("dem"))
}

fn run_jobs(replay_jobs: Vec<ReplayJob>, options: AnonymizeOptions, jobs: usize) -> Result<()> {
    if replay_jobs.is_empty() {
        return Ok(());
    }

    if jobs <= 1 || replay_jobs.len() == 1 {
        for job in replay_jobs {
            run_job(job, &options)?;
        }

        return Ok(());
    }

    let worker_count = jobs.min(replay_jobs.len());
    let mut worker_jobs = (0..worker_count).map(|_| Vec::new()).collect::<Vec<_>>();

    for (index, job) in replay_jobs.into_iter().enumerate() {
        worker_jobs[index % worker_count].push(job);
    }

    let mut errors = Vec::new();

    thread::scope(|scope| {
        let handles = worker_jobs
            .into_iter()
            .map(|jobs| {
                let options = &options;

                scope.spawn(move || {
                    let mut errors = Vec::new();

                    for job in jobs {
                        if let Err(error) = run_job(job, options) {
                            errors.push(error);
                        }
                    }

                    errors
                })
            })
            .collect::<Vec<_>>();

        for handle in handles {
            errors.extend(handle.join().unwrap());
        }
    });

    if errors.is_empty() {
        Ok(())
    } else {
        let errors = errors
            .into_iter()
            .map(|error| format!("{error:#}"))
            .collect::<Vec<_>>()
            .join("\n");

        Err(anyhow!(errors))
    }
}

fn run_job(job: ReplayJob, options: &AnonymizeOptions) -> Result<()> {
    if let Some(parent) = job
        .output
        .parent()
        .filter(|path| !path.as_os_str().is_empty())
    {
        fs::create_dir_all(parent)
            .with_context(|| format!("failed to create {}", parent.display()))?;
    }

    let input = File::open(&job.input)
        .with_context(|| format!("failed to open {}", job.input.display()))?;
    let output = File::create(&job.output)
        .with_context(|| format!("failed to create {}", job.output.display()))?;

    anonymize_replay_with_options(
        BufReader::new(input),
        options.clone(),
        BufWriter::new(output),
    )
    .with_context(|| format!("failed to anonymize {}", job.input.display()))?;

    Ok(())
}

fn parse_args() -> Result<Args> {
    let mut positionals = Vec::new();
    let mut jobs = 1;
    let mut args = env::args_os().skip(1);

    while let Some(arg) = args.next() {
        if arg == "--jobs" {
            let Some(value) = args.next() else {
                bail!(usage());
            };

            jobs = parse_jobs(&value)?;
            continue;
        }

        if let Some(value) = arg.to_str().and_then(|arg| arg.strip_prefix("--jobs=")) {
            jobs = parse_jobs(OsStr::new(value))?;
            continue;
        }

        positionals.push(arg);
    }

    let (input, options, output) = match positionals.as_slice() {
        [input, output] => (input.into(), None, output.into()),
        [input, options, output] => (input.into(), Some(options.into()), output.into()),
        _ => bail!(usage()),
    };

    Ok(Args {
        input,
        options,
        output,
        jobs,
    })
}

fn parse_jobs(value: &OsStr) -> Result<usize> {
    let value = value.to_string_lossy();
    let jobs = value.parse().map_err(|_| anyhow!(usage()))?;

    if jobs == 0 {
        bail!("--jobs must be greater than 0");
    }

    Ok(jobs)
}

fn usage() -> String {
    [
        "Usage:",
        "  d2-replay-anonymizer <input.dem> [options.json] <output.dem> [--jobs N]",
        "  d2-replay-anonymizer <input_dir> [options.json] <output_dir> [--jobs N]",
    ]
    .join("\n")
}
