#!/usr/bin/env node
// Only print the hint during global installs; skip in CI / local dev installs.
const isGlobal = process.env.npm_config_global === 'true';
const isCI = process.env.CI || process.env.CONTINUOUS_INTEGRATION;

if (!isGlobal || isCI) process.exit(0);

const shell = (process.env.SHELL || '').split('/').pop();
const supported = shell === 'zsh' || shell === 'bash';

console.log('');
console.log('  \u2728  struggler-cli installed!');
if (supported) {
    console.log('  \u2192  Enable tab completion (one-time setup):');
    console.log('       struggler-cli completion install');
} else {
    console.log('  \u2192  Enable tab completion: struggler-cli completion <zsh|bash|install>');
}
console.log('');
