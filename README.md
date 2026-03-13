# struggler-cli

`struggler-cli` is a small deployment CLI for front-end build assets on Qiniu Cloud. It can generate versioned paths, upload build output, refresh CDN URLs, and now supports `dry-run`, concurrent uploads, ignore rules, manifest export, JSON output, and a one-shot `deploy` command.

## Install

```bash
pnpm install
```

For local command usage:

```bash
pnpm link --global
```

## Config Files

The CLI expects two files in the same directory:

- `qiniu.json`: Qiniu credentials and bucket metadata
- `config.json`: generated deploy prefix metadata used by upload/refresh

Example `qiniu.json`:

```json
{
  "path": "your-project",
  "accessKey": "",
  "secretKey": "",
  "Bucket": "",
  "zone": "Zone_z1",
  "domain": "https://cdn.example.com/"
}
```

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
node ./index.js --config ./command/qiniu.json --dir ./dist init
```

Preview upload work without changing files or calling Qiniu:

```bash
node ./index.js --config ./command/qiniu.json --dir ./dist --dry-run upload
```

Upload with concurrency:

```bash
node ./index.js --config ./command/qiniu.json --dir ./dist --concurrency 8 upload
```

Upload with ignore patterns and a manifest:

```bash
node ./index.js --config ./command/qiniu.json --dir ./dist --exclude ".DS_Store,*.map" --manifest ./artifacts/upload-manifest.json upload
```

Refresh CDN for generated URLs:

```bash
node ./index.js --config ./command/qiniu.json --dir ./dist refresh
```

Run the full flow:

```bash
node ./index.js --config ./command/qiniu.json --dir ./dist --concurrency 8 deploy
```

Skip parts of deploy:

```bash
node ./index.js --config ./command/qiniu.json --dir ./dist --skip-refresh deploy
```

Machine-readable output:

```bash
node ./index.js --config ./command/qiniu.json --dir ./dist --json --dry-run deploy
```

Version bump script:

```bash
pnpm add-version
```

## Makefile Shortcuts

```bash
make init
make upload
make refresh
make deploy
make upload DIR=./test/dist3 CONFIG=./test/command/qiniu.json DRY_RUN=--dry-run
make deploy MANIFEST=./artifacts/deploy.json JSON=--json SKIP_REFRESH=--skip-refresh
```

## Test

```bash
pnpm test
```

The automated tests cover config path resolution, init dry-run behavior, upload ignore handling, manifest generation, and deploy JSON summaries.
