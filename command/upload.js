var qiniu = require("qiniu");

var qiniuPrefix = require("../lib/prefix")

let { getQiniuConfig, getDir, getCachePath } = require('../lib/config')
let { getJsonData } = require('../lib/files')
const { createIgnoreMatcher } = require('../lib/ignore');
const {
    collectDeployFiles,
    createSummary,
    ensureRequiredConfig,
    finalizeOutput,
    logPlan,
    normalizeConcurrency,
    runWithConcurrency,
    toRemoteKey,
} = require('../lib/deploy');
const { printMessage } = require('../lib/output');
const { computeFileMd5, readCache, writeCache, isCacheHit, updateCacheEntry } = require('../lib/cache');
const { createProgressBar } = require('../lib/progress');

async function main(options, runtime = {}) {
    const qiniuConfig = getJsonData(getQiniuConfig(options))
    const prefix = runtime.prefix || qiniuPrefix.prefix(options);
    let dir = getDir(options)
    const startedAt = Date.now();
    const ignoreMatcher = createIgnoreMatcher(dir, options);
    const excludedPatterns = runtime.excludePatterns || ignoreMatcher.patterns;
    const files = runtime.files || await collectDeployFiles(dir, options);

    const useCache = !options.noCache;
    const cachePath = getCachePath(options);
    const cache = useCache ? readCache(cachePath) : {};

    const plans = [];
    const skippedPlans = [];

    for (const localFile of files) {
        const key = toRemoteKey(prefix, dir, localFile);
        const plan = {
            localFile,
            key,
            target: `${qiniuConfig.domain || ''}${key}`,
        };

        if (useCache && !options.dryRun) {
            const md5 = computeFileMd5(localFile);
            plan.localMd5 = md5;
            if (isCacheHit(cache, key, md5)) {
                skippedPlans.push(plan);
                continue;
            }
        }

        plans.push(plan);
    }

    if (options.dryRun) {
        if (!runtime.suppressOutput) {
            logPlan('upload', [...plans, ...skippedPlans], options);
        }
        const summary = createSummary('upload', true, [...plans, ...skippedPlans].map((plan) => ({
            ok: true,
            localFile: plan.localFile,
            key: plan.key,
            target: plan.target,
        })), startedAt, {
            prefix,
            concurrency: normalizeConcurrency(options.concurrency),
            excludedPatterns,
            skippedCount: 0,
        });
        return runtime.suppressOutput ? summary : finalizeOutput(summary, options, runtime.manifestExtra);
    }

    ensureRequiredConfig(
        { ...qiniuConfig, 'publicPath(config.json)': prefix },
        ['accessKey', 'secretKey', 'Bucket', 'zone', 'domain', 'publicPath(config.json)']
    );

    var accessKey = qiniuConfig.accessKey
    var secretKey = qiniuConfig.secretKey;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var config = new qiniu.conf.Config();
    config.zone = qiniu.zone[qiniuConfig.zone];
    config.useHttpsDomain = true;
    config.useCdnDomain = true;

    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();

    function upload(plan, attempt = 1) {
        var uploadOptions = {
            scope: `${qiniuConfig.Bucket}:${plan.key}`
        };
        var putPolicy = new qiniu.rs.PutPolicy(uploadOptions);
        var uploadToken = putPolicy.uploadToken(mac);

        return new Promise((resolve, reject) => {
            formUploader.putFile(uploadToken, plan.key, plan.localFile, putExtra, async function (respErr, respBody, respInfo) {
                if (respErr || respInfo.statusCode !== 200) {
                    if (attempt < 3) {
                        console.log(`${plan.localFile} 上传失败，正在进行第 ${attempt + 1} 次重试`);
                        try {
                            const retryResult = await upload(plan, attempt + 1);
                            resolve(retryResult);
                        } catch (retryError) {
                            reject(retryError);
                        }
                        return;
                    }

                    const errorMessage = respErr || (respBody && respBody.error) || `statusCode=${respInfo && respInfo.statusCode}`;
                    reject(new Error(errorMessage));
                    return;
                }

                resolve({
                    hash: respBody.hash,
                    key: plan.key,
                    target: plan.target,
                });
            });
        });
    }

    const totalFiles = plans.length + skippedPlans.length;
    const bar = createProgressBar(totalFiles, {
        json: options.json,
        suppressOutput: runtime.suppressOutput,
    });

    for (const plan of skippedPlans) {
        bar.tick({ filename: plan.localFile, skipped: true });
    }

    const results = await runWithConcurrency(plans, normalizeConcurrency(options.concurrency), async (plan) => {
        try {
            const response = await upload(plan);
            bar.tick({ filename: plan.localFile });
            if (useCache && plan.localMd5) {
                updateCacheEntry(cache, plan.key, plan.localMd5, response.hash);
            }
            return {
                ok: true,
                localFile: plan.localFile,
                key: response.key,
                target: response.target,
                hash: response.hash,
            };
        } catch (error) {
            bar.tick({ filename: plan.localFile, failed: true });
            return {
                ok: false,
                localFile: plan.localFile,
                key: plan.key,
                target: plan.target,
                error: error.message,
            };
        }
    });

    bar.finish();

    if (useCache) {
        writeCache(cachePath, cache);
    }

    const skippedResults = skippedPlans.map((plan) => ({
        ok: true,
        skipped: true,
        localFile: plan.localFile,
        key: plan.key,
        target: plan.target,
    }));

    const allResults = [...results, ...skippedResults];

    const summary = createSummary('upload', false, allResults, startedAt, {
        prefix,
        concurrency: normalizeConcurrency(options.concurrency),
        excludedPatterns,
        skippedCount: skippedPlans.length,
    });
    const finalSummary = runtime.suppressOutput ? summary : finalizeOutput(summary, options, runtime.manifestExtra);
    if (finalSummary.failedCount > 0) {
        throw new Error(`Upload finished with ${summary.failedCount} failures`);
    }

    return finalSummary;
}

module.exports = main
