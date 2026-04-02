const path = require('path');
const chalk = require('chalk');
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

function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

function logSummary(summary, options) {
    const allOk = summary.failedCount === 0;
    const isDryRun = summary.dryRun;
    const skipped = summary.skippedCount || 0;
    const uploaded = summary.succeededCount - skipped;

    const statusIcon = allOk ? chalk.green('✓') : chalk.red('✗');
    const actionLabel = summary.action === 'upload' ? '上传' : summary.action === 'refresh' ? '刷新' : summary.action;
    const modeTag = isDryRun ? chalk.yellow(' [dry-run]') : '';

    printMessage(options, '');
    printMessage(options, `  ${statusIcon}  ${chalk.bold(actionLabel + '完成')}${modeTag}  ${chalk.dim(formatDuration(summary.durationMs))}`);
    printMessage(options, '');

    const rows = [];
    if (summary.action === 'upload') {
        rows.push([chalk.dim('上传'), chalk.green(`${uploaded} 个文件`)]);
        if (skipped > 0) {
            rows.push([chalk.dim('跳过'), chalk.cyan(`${skipped} 个文件`) + chalk.dim('  (缓存命中，无变更)')]);
        }
        if (summary.failedCount > 0) {
            rows.push([chalk.dim('失败'), chalk.red(`${summary.failedCount} 个文件`)]);
        }
        rows.push([chalk.dim('合计'), chalk.white(`${summary.total} 个文件`)]);
    } else {
        rows.push([chalk.dim('成功'), chalk.green(`${summary.succeededCount} 个`)]);
        if (summary.failedCount > 0) {
            rows.push([chalk.dim('失败'), chalk.red(`${summary.failedCount} 个`)]);
        }
        rows.push([chalk.dim('合计'), chalk.white(`${summary.total} 个`)]);
    }

    const labelWidth = 4;
    rows.forEach(([label, value]) => {
        printMessage(options, `     ${label.padEnd ? label : label}  ${value}`);
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
        printMessage(options, `  ${chalk.dim('─── 已上传文件链接 ───')}`);
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
