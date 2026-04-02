const chalk = require('chalk');

const BAR_WIDTH = 30;

function buildBar(completed, total) {
    const ratio = total === 0 ? 1 : completed / total;
    const filled = Math.round(BAR_WIDTH * ratio);
    const empty = BAR_WIDTH - filled;
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

function truncateFilename(filename, maxLen) {
    if (!filename || filename.length <= maxLen) {
        return (filename || '').padEnd(maxLen);
    }
    return '...' + filename.slice(-(maxLen - 3));
}

function createProgressBar(total, options = {}) {
    if (options.json || options.suppressOutput || total === 0) {
        return { tick: () => {}, finish: () => {} };
    }

    let completed = 0;
    let failed = 0;
    let skipped = 0;
    let lastLine = '';

    const isTTY = process.stdout.isTTY;

    function render(currentFile, status) {
        const bar = buildBar(completed, total);
        const pct = total === 0 ? 100 : Math.round((completed / total) * 100);
        const cols = (process.stdout.columns || 80) - BAR_WIDTH - 30;
        const nameWidth = Math.max(10, Math.min(40, cols));
        const name = truncateFilename(currentFile, nameWidth);

        let statusIcon;
        if (status === 'skipped') {
            statusIcon = chalk.cyan('↩');
        } else if (status === 'failed') {
            statusIcon = chalk.red('✗');
        } else {
            statusIcon = chalk.green('✓');
        }

        const countStr = chalk.white(`${completed}/${total}`);
        const pctStr = chalk.yellow(`${pct}%`);
        const line = `  ${bar} ${countStr} ${pctStr}  ${statusIcon} ${chalk.dim(name)}`;

        if (isTTY) {
            process.stdout.write('\r' + line.padEnd(lastLine.length));
        } else {
            console.log(line);
        }
        lastLine = line;
    }

    function tick({ filename = '', skipped: isSkipped = false, failed: isFailed = false } = {}) {
        completed += 1;
        if (isSkipped) skipped += 1;
        if (isFailed) failed += 1;
        render(filename, isSkipped ? 'skipped' : isFailed ? 'failed' : 'uploaded');
    }

    function finish() {
        if (!isTTY) return;
        const bar = buildBar(total, total);
        const parts = [
            `  ${bar}`,
            chalk.white(`${total}/${total}`),
            chalk.green('100%'),
        ];
        if (skipped > 0) parts.push(chalk.cyan(`${skipped} skipped`));
        if (failed > 0) parts.push(chalk.red(`${failed} failed`));
        process.stdout.write('\r' + parts.join('  ').padEnd(lastLine.length) + '\n');
    }

    return { tick, finish };
}

module.exports = { createProgressBar };
