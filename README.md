# struggler-cli

`struggler-cli` is a small deployment CLI for front-end build assets on Qiniu Cloud. It supports versioned paths, upload, CDN refresh, upload cache, profiles for multiple Qiniu accounts, `dry-run`, concurrency, ignore rules, manifest export, JSON output, and a one-shot `deploy` command.

Works on **macOS, Linux, and Windows** (Node.js `path` / `fs` APIs are cross-platform).

## Install

**Most users** — global install from npm:

```bash
npm install -g @struggler/cli
```

Use a semver without a leading `v` (for example `1.0.17`, not `v1.0.17`).

After install, run `struggler-cli` once with no arguments: if shell completion is not set up yet, you will see a short tip pointing at `struggler-cli completion install`.

**Contributors / local development** — clone the repo and:

```bash
pnpm install
make link          # global link + runs completion install for your shell (see Makefile)
```

## First-time setup (recommended: profiles)

Use **profiles** to store Qiniu credentials under your user home: `~/.struggler-cli/` (Windows: `%USERPROFILE%\.struggler-cli\`). This folder is created automatically; it is **not** shipped with the npm package.

```text
~/.struggler-cli/          # created on first profile add/import (Windows/macOS/Linux)
  profiles/
    prod.json              # Qiniu credentials for production
    staging.json
  current                  # one line: active profile name, e.g. prod

your-project/
  command/
    config.json            # deploy prefix (publicPath / base), from init
    upload-cache.json      # upload cache (optional)
  dist/                    # build output to upload (-d)
```

### Step 1 — Create a profile

From your project root:

```bash
struggler-cli profile add prod
```

This creates `~/.struggler-cli/profiles/prod.json` from the built-in template. Open it and fill in:

| Field | Description |
|-------|-------------|
| `path` | CDN path prefix segment for this app |
| `accessKey` | Qiniu access key |
| `secretKey` | Qiniu secret key |
| `Bucket` | Bucket name |
| `zone` | e.g. `Zone_z0`, `Zone_z1`, `Zone_z2` |
| `domain` | CDN domain, e.g. `https://cdn.example.com/` |

### Step 2 — Activate the profile

```bash
struggler-cli profile use prod
```

Or pass the profile name per command: `-c prod`.

### Step 3 — Generate deploy metadata

```bash
struggler-cli init -d ./dist
```

Writes `command/config.json` with a timestamped `publicPath` and `base` URL (always under `./command/`, same as older versions).

### Step 4 — Upload

```bash
struggler-cli upload -d ./dist
```

### More environments

```bash
struggler-cli profile add staging
# edit ~/.struggler-cli/profiles/staging.json

struggler-cli profile import dev ./path/to/existing-qiniu.json

struggler-cli profile list
struggler-cli profile current
struggler-cli profile use staging
struggler-cli init
struggler-cli upload -d ./dist
```

Because profiles are user-level, they are outside your project repo by default.

## Legacy setup (single `command/qiniu.json`)

Still supported for existing projects:

```text
command/
  qiniu.json
  config.json
```

```bash
struggler-cli init -c ./command/qiniu.json -d ./dist
struggler-cli upload -c ./command/qiniu.json -d ./dist
```

If no profile is active and you omit `-c`, the CLI defaults to `./command/qiniu.json`.

## How `-c` resolves config

| You pass | Resolved to |
|----------|-------------|
| *(omit)* | Active profile in `~/.struggler-cli/current`, else `./command/qiniu.json` |
| `-c prod` | `~/.struggler-cli/profiles/prod.json` |
| `-c ./command/qiniu.json` | That file path (legacy) |

`config.json` and upload cache stay in `./command/` unless you pass `--config-dir`.

## Profile commands

```bash
struggler-cli profile list
struggler-cli profile use <name>
struggler-cli profile current
struggler-cli profile add <name>
struggler-cli profile import <name> <file>
```

## Other config files

Optional ignore file:

```text
.strugglerignore
```

Example:

```text
.DS_Store
*.map
legacy/**
```

## Commands

Initialize versioned config:

```bash
struggler-cli init -d ./dist
```

Preview upload:

```bash
struggler-cli --dry-run upload -d ./dist
```

Upload with concurrency:

```bash
struggler-cli upload -d ./dist --concurrency 8
```

Full deploy:

```bash
struggler-cli deploy -d ./dist --concurrency 8
```

Machine-readable output:

```bash
struggler-cli deploy -d ./dist --json --dry-run
```

## Windows notes

- The folder name `.struggler-cli` is valid on Windows; Node resolves paths with `\` automatically.
- User-level profile root on Windows is `%USERPROFILE%\.struggler-cli\`.
- In **Cmd** or **PowerShell**, run the same commands as on Unix.
- Avoid spaces in profile names; use `prod`, `staging`, `dev`.
- When scripting, quote paths: `--config-dir "./command"`.

## Shell completion

Tab completion covers subcommands, global flags, and profile names (for example `profile use <TAB>`).

**Recommended** — auto-detect shell from `$SHELL` and install files + rc snippets (idempotent):

```bash
struggler-cli completion install
# then reload your shell config (zsh: ~/.zshrc, bash: ~/.bash_profile — see below)
source ~/.zshrc          # zsh
# or
source ~/.bash_profile   # bash (what `completion install` patches today)
```

What this does:

- **zsh**: writes `~/.zsh/completions/_struggler-cli` and appends `fpath` + `compinit` to `~/.zshrc` if missing.
- **bash**: writes `~/.bash_completion.d/struggler-cli` and appends a `source` line to `~/.bash_profile` if missing.

If `$SHELL` is not zsh or bash, use **Manual zsh** or **Manual bash** below (see also `struggler-cli completion -h`).

**From this repo only** — same zsh layout via Make:

```bash
make completion-install
source ~/.zshrc
```

**Manual zsh** (equivalent to the above):

```bash
mkdir -p ~/.zsh/completions
struggler-cli completion zsh > ~/.zsh/completions/_struggler-cli
# add to ~/.zshrc if not already present:
echo 'fpath=(~/.zsh/completions $fpath)' >> ~/.zshrc
echo 'autoload -Uz compinit && compinit' >> ~/.zshrc
source ~/.zshrc
```

**Manual bash** — do **not** append the script to `~/.bash_profile`; save it as a file and source it (matches `completion install`):

```bash
mkdir -p ~/.bash_completion.d
struggler-cli completion bash > ~/.bash_completion.d/struggler-cli
grep -q 'bash_completion.d/struggler-cli' ~/.bash_profile 2>/dev/null || \
  echo '[ -f ~/.bash_completion.d/struggler-cli ] && source ~/.bash_completion.d/struggler-cli' >> ~/.bash_profile
source ~/.bash_profile
```

On some Linux setups only `~/.bashrc` is loaded for interactive shells; if completion does not load, add the same `source` line there instead.

**Note:** `npm` may hide `postinstall` script output during install; relying on the first-run tip or `completion install` is intentional.

## Makefile shortcuts

These targets assume you are in the **cloned repository** (they call `./index.js` with repo defaults).

```bash
make init
make upload
make refresh
make deploy
```

Override paths when needed, for example:

```bash
make upload CONFIG=./test/command/qiniu.json DIR=./test/dist3 DRY_RUN=--dry-run
```

## Test

```bash
pnpm test
```

Tests cover profile resolution, config paths, init, upload, and deploy.
