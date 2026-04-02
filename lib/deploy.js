const path = require('path');
const chalk = require('chalk');
const { listFiles } = require('./files');
const { createIgnoreMatcher } = require('./ignore');
const { printMessage, writeManifest, shouldUseJson, printJson } = require('./output');
const { getLocale } = require('./i18n');

const DEFAULT_CONCURRENCY = 5;

function normalizeConcurrency(value) {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
        return DEFAULT_CONCURRENCY;
    }

    return parsed;
}

function toRemoteKey(prefix, rootDir, localFile) {
    return `${prefix}${path.relative(rootDir, localFile)}`.replace(/\\/g, '/');
}

async function collectDeployFiles(dir, options = {}) {
    const files = await listFiles(dir);
    const ignoreMatcher = createIgnoreMatcher(dir, options);
    return files
        .filter((filePath) => !filePath.endsWith('.gz'))
        .filter((filePath) => !ignoreMatcher.shouldIgnore(filePath))
        .sort((left, right) => left.localeCompare(right));
}

async function runWithConcurrency(items, concurrency, worker) {
    const normalizedConcurrency = Math.min(normalizeConcurrency(concurrency), Math.max(items.length, 1));
    const results = new Array(items.length);
    let nextIndex = 0;

    async function consume() {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;
            results[currentIndex] = await worker(items[currentIndex], currentIndex);
        }
    }

    const tasks = Array.from({ length: normalizedConcurrency }, () => consume());
    await Promise.all(tasks);
    return results;
}

function createSummary(action, dryRun, results, startedAt, extra = {}) {
    const succeeded = results.filter((item) => item.ok);
    const failed = results.filter((item) => !item.ok);

    return {
        action,
        dryRun,
        total: results.length,
        succeededCount: succeeded.length,
        failedCount: failed.length,
        durationMs: Date.now() - startedAt,
        succeeded,
        failed,
        results,
        ...extra,
    };
}

function logPlan(action, items, options) {
    const { messages } = getLocale(options && options.lang);
    printMessage(options, messages.dryRunPlan(action, items.length));
    items.forEach((item) => {
        printMessage(options, `  ${item.localFile} -> ${item.target}`);
    });
}

function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

function logSummary(summary, options) {
    const { messages } = getLocale(options && options.lang);
    const allOk = summary.failedCount === 0;
    const isDryRun = summary.dryRun;
    const skipped = summary.skippedCount || 0;
    const uploaded = summary.succeededCount - skipped;

    const statusIcon = allOk ? chalk.green('✓') : chalk.red('✗');
    const actionDoneLabel = summary.action === 'upload'
        ? messages.uploadDone
        : summary.action === 'refresh'
            ? messages.refreshDone
            : messages.deployDone;
    const modeTag = isDryRun ? chalk.yellow(` [${messages.dryRunLabel}]`) : '';

    printMessage(options, '');
    printMessage(options, `  ${statusIcon}  ${chalk.bold(actionDoneLabel)}${modeTag}  ${chalk.dim(formatDuration(summary.durationMs))}`);
    printMessage(options, '');

    const rows = [];
    if (summary.action === 'upload') {
        rows.push([chalk.dim(messages.uploadLabel), chalk.green(`${uploaded} ${messages.uploadFileUnit}`)]);
        if (skipped > 0) {
            rows.push([chalk.dim(messages.uploadSkippedLabel), chalk.cyan(`${skipped} ${messages.uploadFileUnit}`) + chalk.dim(`  (${messages.uploadCacheHint})`)]);
        }
        if (summary.failedCount > 0) {
            rows.push([chalk.dim(messages.uploadFailedLabel), chalk.red(`${summary.failedCount} ${messages.uploadFileUnit}`)]);
        }
        rows.push([chalk.dim(messages.uploadTotalLabel), chalk.white(`${summary.total} ${messages.uploadFileUnit}`)]);
    } else {
        rows.push([chalk.dim(messages.refreshSucceededLabel), chalk.green(`${summary.succeededCount} ${messages.refreshUnit}`)]);
        if (summary.failedCount > 0) {
            rows.push([chalk.dim(messages.refreshFailedLabel), chalk.red(`${summary.failedCount} ${messages.refreshUnit}`)]);
        }
        rows.push([chalk.dim(messages.refreshTotalLabel), chalk.white(`${summary.total} ${messages.refreshUnit}`)]);
    }

    rows.forEach(([label, value]) => {
        printMessage(options, `     ${label}  ${value}`);
    });
    printMessage(options, '');

    if (summary.failedCount > 0) {
        summary.failed.forEach((item) => {
            printMessage(options, `  ${chalk.red('✗')}  ${chalk.dim(item.localFile)}`);
            printMessage(options, `     ${chalk.red(item.error)}`);
        });
        printMessage(options, '');
    }

    const uploadedItems = (summary.succeeded || []).filter((item) => !item.skipped && item.target);
    if (uploadedItems.length > 0) {
        printMessage(options, `  ${chalk.dim(`─── ${messages.uploadLinksTitle} ───`)}`);
        printMessage(options, '');
        uploadedItems.forEach((item) => {
            printMessage(options, `  ${chalk.cyan(item.target)}`);
        });
        printMessage(options, '');
    }
}

function maybeWriteManifest(summary, options, extra = {}) {
    if (!options.manifest) {
        return summary;
    }

    const manifestPath = writeManifest(options.manifest, {
        ...summary,
        ...extra,
    });

    return {
        ...summary,
        manifestPath,
    };
}

function finalizeOutput(summary, options, extra = {}) {
    const finalSummary = maybeWriteManifest(summary, options, extra);
    if (shouldUseJson(options)) {
        printJson(finalSummary);
    } else {
        logSummary(finalSummary, options);
        if (finalSummary.manifestPath) {
            const { messages } = getLocale(options && options.lang);
            printMessage(options, `  ${chalk.dim(messages.manifestWritten)} ${finalSummary.manifestPath}`);
        }
    }

    return finalSummary;
}

function ensureRequiredConfig(config, requiredFields, options) {
    const missingFields = requiredFields.filter((field) => !config[field]);
    if (missingFields.length > 0) {
        const { messages } = getLocale(options && options.lang);
        const lines = [
            messages.errorMissingConfig,
            ...missingFields.map((f) => `  · ${f}`),
            '',
            messages.errorMissingConfigHint,
        ];
        throw new Error(lines.join('\n'));
    }
}

module.exports = {
    DEFAULT_CONCURRENCY,
    normalizeConcurrency,
    toRemoteKey,
    collectDeployFiles,
    runWithConcurrency,
    createSummary,
    logPlan,
    logSummary,
    maybeWriteManifest,
    finalizeOutput,
    ensureRequiredConfig,
};
