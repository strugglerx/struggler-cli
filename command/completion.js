const fs = require('fs');
const os = require('os');
const path = require('path');
const { listProfiles } = require('../lib/profile');

// Completion scripts are built from string arrays to avoid
// conflicts between JS template literals and shell variable syntax like ${(f)...}.

function zshScript() {
    const lines = [
        '#compdef struggler-cli',
        '',
        '_struggler_cli() {',
        '  local context state line',
        '  typeset -A opt_args',
        '',
        '  _arguments -C \\',
        "    '(-v --version)'{-v,--version}'[show version]' \\",
        "    '(-h --help)'{-h,--help}'[show help]' \\",
        "    '(-c --config)'{-c,--config}'[qiniu config: profile name or file path]:config:' \\",
        "    '--config-dir[meta config directory]:dir:_files -/' \\",
        "    '(-d --dir)'{-d,--dir}'[upload source directory]:dir:_files -/' \\",
        "    '--dry-run[preview without writing or calling qiniu]' \\",
        "    '--concurrency[upload concurrency]:number:(1 2 3 4 5 8 10)' \\",
        "    '--exclude[exclude glob pattern]:pattern:' \\",
        "    '--ignore-file[custom ignore file]:file:_files' \\",
        "    '--manifest[write result to manifest json]:file:_files' \\",
        "    '--json[machine-readable json output]' \\",
        "    '--skip-init[skip init step in deploy]' \\",
        "    '--skip-refresh[skip refresh step in deploy]' \\",
        "    '--no-cache[force re-upload all files]' \\",
        "    '--lang[ui language]:lang:(zh en)' \\",
        "    '1: :_struggler_cli_cmds' \\",
        "    '*::arg:->args'",
        '',
        '  case $state in',
        '    args)',
        '      case $line[1] in',
        '        profile)',
        '          _struggler_cli_profile',
        '          ;;',
        '        completion)',
        "          _arguments '1:shell:(zsh bash)'",
        '          ;;',
        '        init|upload|refresh|deploy)',
        "          _message 'no more subcommands'",
        '          ;;',
        '      esac',
        '      ;;',
        '  esac',
        '}',
        '',
        '_struggler_cli_cmds() {',
        '  local cmds',
        '  cmds=(',
        "    'init:generate versioned upload config'",
        "    'upload:upload build files to qiniu'",
        "    'refresh:refresh qiniu cdn urls'",
        "    'deploy:run init + upload + refresh'",
        "    'profile:manage qiniu credential profiles'",
        "    'completion:output shell completion script'",
        '  )',
        "  _describe 'command' cmds",
        '}',
        '',
        '_struggler_cli_profile() {',
        '  local subcmds',
        '  subcmds=(',
        "    'list:list all profiles'",
        "    'use:set active profile'",
        "    'current:show active profile'",
        "    'add:create profile from template'",
        "    'import:import profile from file'",
        '  )',
        '',
        '  if (( CURRENT == 2 )); then',
        "    _describe 'profile subcommand' subcmds",
        '    return',
        '  fi',
        '',
        '  case $words[2] in',
        '    use)',
        // Use a dedicated CLI helper to list profiles, avoiding nested quote hell
        '      local profiles',
        '      profiles=($(struggler-cli completion --list-profiles 2>/dev/null))',
        '      if [[ ${#profiles[@]} -gt 0 ]]; then',
        "        _describe 'profile' profiles",
        '      else',
        "        _message 'profile name'",
        '      fi',
        '      ;;',
        '    import)',
        "      (( CURRENT == 3 )) && _message 'profile name'",
        '      (( CURRENT == 4 )) && _files',
        '      ;;',
        '  esac',
        '}',
        '',
        '_struggler_cli',
        '',
    ];
    return lines.join('\n');
}

function bashScript() {
    const lines = [
        '# bash completion for struggler-cli',
        '# source this file or put in ~/.bash_completion.d/struggler-cli',
        '',
        '_struggler_cli_completion() {',
        '  local cur prev words cword',
        '  _init_completion 2>/dev/null || {',
        '    COMPREPLY=()',
        '    cur="${COMP_WORDS[COMP_CWORD]}"',
        '    prev="${COMP_WORDS[COMP_CWORD-1]}"',
        '  }',
        '',
        '  local cmds="init upload refresh deploy profile completion"',
        '  local profile_cmds="list use current add import"',
        '  local global_opts="-v --version -h --help -c --config --config-dir -d --dir --dry-run --concurrency --exclude --ignore-file --manifest --json --skip-init --skip-refresh --no-cache --lang"',
        '',
        '  if [[ ${COMP_CWORD} -eq 1 ]]; then',
        '    COMPREPLY=($(compgen -W "${cmds}" -- "${cur}"))',
        '    return',
        '  fi',
        '',
        '  case "${COMP_WORDS[1]}" in',
        '    profile)',
        '      if [[ ${COMP_CWORD} -eq 2 ]]; then',
        '        COMPREPLY=($(compgen -W "${profile_cmds}" -- "${cur}"))',
        '        return',
        '      fi',
        '      if [[ "${COMP_WORDS[2]}" == "use" && ${COMP_CWORD} -eq 3 ]]; then',
        '        local profiles',
        '        profiles=$(struggler-cli completion --list-profiles 2>/dev/null)',
        '        COMPREPLY=($(compgen -W "${profiles}" -- "${cur}"))',
        '        return',
        '      fi',
        '      ;;',
        '    completion)',
        '      if [[ ${COMP_CWORD} -eq 2 ]]; then',
        '        COMPREPLY=($(compgen -W "zsh bash" -- "${cur}"))',
        '        return',
        '      fi',
        '      ;;',
        '    init|upload|refresh|deploy)',
        '      COMPREPLY=($(compgen -W "${global_opts}" -- "${cur}"))',
        '      return',
        '      ;;',
        '  esac',
        '}',
        '',
        'complete -F _struggler_cli_completion struggler-cli',
        '',
    ];
    return lines.join('\n');
}

function detectShell() {
    const shellBin = process.env.SHELL || '';
    if (shellBin.endsWith('zsh')) return 'zsh';
    if (shellBin.endsWith('bash')) return 'bash';
    return null;
}

function installZsh(script) {
    const dir = path.join(os.homedir(), '.zsh', 'completions');
    const file = path.join(dir, '_struggler-cli');
    const rcFile = path.join(os.homedir(), '.zshrc');

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, script, 'utf8');
    console.log('  \u2713  zsh completion installed: ' + file);

    let rc = '';
    try { rc = fs.readFileSync(rcFile, 'utf8'); } catch { /* new file */ }

    const fpathLine = 'fpath=(' + dir + ' $fpath)';
    const compLine = 'autoload -Uz compinit && compinit';
    const marker = '# struggler-cli completion';

    if (!rc.includes(marker)) {
        const addition = '\n' + marker + '\n' + fpathLine + '\n' + compLine + '\n';
        fs.appendFileSync(rcFile, addition, 'utf8');
        console.log('  \u2713  added fpath + compinit to ~/.zshrc');
    } else {
        console.log('  \u00b7  ~/.zshrc already configured, skipped');
    }
    console.log('  \u2192  run: source ~/.zshrc');
}

function installBash(script) {
    const dir = path.join(os.homedir(), '.bash_completion.d');
    const file = path.join(dir, 'struggler-cli');
    const rcFile = path.join(os.homedir(), '.bash_profile');

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, script, 'utf8');
    console.log('  \u2713  bash completion installed: ' + file);

    let rc = '';
    try { rc = fs.readFileSync(rcFile, 'utf8'); } catch { /* new file */ }

    const marker = '# struggler-cli completion';
    if (!rc.includes(marker)) {
        const addition = '\n' + marker + '\n[ -f ' + file + ' ] && source ' + file + '\n';
        fs.appendFileSync(rcFile, addition, 'utf8');
        console.log('  \u2713  added source line to ~/.bash_profile');
    } else {
        console.log('  \u00b7  ~/.bash_profile already configured, skipped');
    }
    console.log('  \u2192  run: source ~/.bash_profile');
}

function installAction(_options) {
    const shell = detectShell();
    if (!shell) {
        process.stderr.write('Cannot detect shell from $SHELL. Run manually:\n');
        process.stderr.write('  struggler-cli completion zsh  > ~/.zsh/completions/_struggler-cli\n');
        process.stderr.write('  struggler-cli completion bash > ~/.bash_completion.d/struggler-cli\n');
        process.exitCode = 1;
        return;
    }
    console.log('  detected shell: ' + shell);
    if (shell === 'zsh') {
        installZsh(zshScript());
    } else {
        installBash(bashScript());
    }
}

function completionAction(shell, options) {
    // Internal helper: list profile names for shell completion scripts
    if (options && options.listProfiles) {
        try {
            listProfiles().forEach((name) => process.stdout.write(name + '\n'));
        } catch {
            // silently fail; completion scripts handle empty output
        }
        return;
    }

    // Auto-install to current shell
    if (shell === 'install' || (options && options.install)) {
        installAction(options);
        return;
    }

    const s = (shell || '').toLowerCase();
    if (s === 'zsh') {
        process.stdout.write(zshScript());
    } else if (s === 'bash') {
        process.stdout.write(bashScript());
    } else {
        process.stderr.write('Usage: struggler-cli completion <zsh|bash|install>\n');
        process.exitCode = 1;
    }
}

module.exports = completionAction;
