const path = require('path');
const { listFiles } = require('./files');
const { createIgnoreMatcher } = require('./ignore');
const { printMessage, writeManifest, shouldUseJson, printJson } = require('./output');

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
    printMessage(options, `[dry-run] ${action} plan (${items.length} files)`);
    items.forEach((item) => {
        printMessage(options, `- ${item.localFile} -> ${item.target}`);
    });
}

function logSummary(summary, options) {
    const mode = summary.dryRun ? 'dry-run' : 'live';
    printMessage(options, `[summary] ${summary.action} mode=${mode} total=${summary.total} succeeded=${summary.succeededCount} failed=${summary.failedCount} duration=${summary.durationMs}ms`);
    if (summary.failedCount > 0) {
        summary.failed.forEach((item) => {
            printMessage(options, `[failed] ${item.localFile}: ${item.error}`);
        });
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
            printMessage(options, `[manifest] ${finalSummary.manifestPath}`);
        }
    }

    return finalSummary;
}

function ensureRequiredConfig(config, requiredFields) {
    const missingFields = requiredFields.filter((field) => !config[field]);
    if (missingFields.length > 0) {
        throw new Error(`Missing required config: ${missingFields.join(', ')}`);
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
