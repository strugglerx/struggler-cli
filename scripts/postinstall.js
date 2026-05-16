#!/usr/bin/env node
// Skip in CI environments.
const isCI = process.env.CI || process.env.CONTINUOUS_INTEGRATION;

if (isCI) process.exit(0);

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
