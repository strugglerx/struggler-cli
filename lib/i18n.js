const LANGUAGES = {
    zh: {
        appDescription: '用于将前端打包产物上传到七牛云 OSS 的命令行工具。',
        messages: {
            initTemplateCreated: '七牛配置不存在，已生成模版，请填写必要信息：',
            initConfigUpdated: '配置已更新：',
            initDryRunCreate: (p) => `[预览] 将创建配置模版：${p}`,
            initDryRunWrite: (p) => `[预览] 将写入配置：${p}`,
            uploadRetrying: (file, attempt) => `${file} 上传失败，正在进行第 ${attempt} 次重试`,
            uploadDone: '上传完成',
            uploadLabel: '上传',
            uploadSkippedLabel: '跳过',
            uploadFailedLabel: '失败',
            uploadTotalLabel: '合计',
            uploadCacheHint: '缓存命中，无变更',
            uploadLinksTitle: '已上传文件链接',
            uploadFileUnit: '个文件',
            uploadFailed: (n) => `上传完成，${n} 个失败`,
            refreshDone: '刷新完成',
            refreshSucceededLabel: '成功',
            refreshFailedLabel: '失败',
            refreshTotalLabel: '合计',
            refreshUnit: '个',
            refreshFailed: (n) => `刷新完成，${n} 个失败`,
            deployDone: '部署完成',
            deploySkipRefresh: '刷新步骤已跳过 (--skip-refresh)',
            deployUploadLabel: '上传',
            deployRefreshLabel: '刷新',
            deployFileUnit: '个文件',
            deployUnit: '个',
            errorTitle: '出错了',
            errorMissingConfig: '配置不完整，以下字段缺失或为空：',
            errorMissingConfigHint: '请检查七牛配置（~/.struggler-cli/profiles，Windows 为 %USERPROFILE%\\.struggler-cli\\profiles）或 command/qiniu.json，以及 command/config.json；也可先运行 struggler-cli init。',
            profileListEmpty: '尚无 profile，请先执行：struggler-cli profile add <name>',
            profileListTitle: '可用 profile：',
            profileListCurrentHint: '（* 为当前激活）',
            profileUseDone: (name) => `已切换 profile：${name}`,
            profileNoCurrent: '未设置当前 profile。可执行：struggler-cli profile use <name>',
            profileCurrentLabel: '当前 profile：',
            profileAddDone: (name) => `已创建 profile：${name}`,
            profileImportDone: (name) => `已导入 profile：${name}`,
            profileEditHint: '请编辑该文件，填写 accessKey、secretKey、Bucket、zone、domain 等字段。',
            dryRunLabel: '预览',
            dryRunPlan: (action, n) => `[预览] ${action} 计划 (${n} 个文件)`,
            manifestWritten: '清单已写入：',
        },
        options: {
            version: '显示版本号。',
            config: '七牛配置：profile 名（如 prod）、文件路径（如 ./command/qiniu.json）；不传则优先用 ~/.struggler-cli/current（Windows 为 %USERPROFILE%\\.struggler-cli\\current），否则回退 ./command/qiniu.json。',
            configDir: '指定 config.json、upload-cache.json 所在目录；不传时固定为 ./command（与旧版一致）；可写 --config-dir ./command。',
            dir: '指定要上传的目录。',
            dryRun: '仅预览执行计划，不写文件也不调用七牛接口。',
            concurrency: '设置上传并发数。',
            exclude: '排除文件匹配规则，支持逗号分隔多个模式。',
            ignoreFile: '指定自定义忽略文件。',
            manifest: '将命令执行结果写入 manifest JSON 文件。',
            json: '输出机器可读的 JSON 结果。',
            skipInit: '在 deploy 时跳过 init 步骤。',
            skipRefresh: '在 deploy 时跳过 refresh 步骤。',
            noCache: '禁用上传缓存，强制重新上传所有文件。',
            lang: '切换菜单语言，可选 zh / en。',
            help: '显示帮助信息。',
        },
        commands: {
            init: '为指定路径生成上传配置。',
            upload: '将指定目录下文件上传到七牛云。',
            refresh: '刷新七牛云 CDN 文件。',
            deploy: '一次执行 init、upload 和 refresh。',
            profile: '管理多套七牛配置（profile）。',
            profileList: '列出所有 profile',
            profileUse: '切换当前 profile',
            profileCurrent: '显示当前 profile',
            profileAdd: '从模版新建 profile',
            profileImport: '从已有文件导入 profile',
        },
        help: {
            helpCommandDescription: '显示指定命令的帮助信息',
            commandUsage: '用法：',
            commandDescription: '说明：',
            commandOptions: '参数：',
            commandCommands: '命令：',
            subcommandTerm: '命令',
            optionTerm: '参数',
            argumentTerm: '参数',
            usage: '用法',
            options: '参数',
            commands: '命令',
            arguments: '参数',
        },
    },
    en: {
        appDescription: 'CLI to upload front-end build files to Qiniu Cloud OSS.',
        messages: {
            initTemplateCreated: 'Qiniu config not found, template created. Please fill in the required fields:',
            initConfigUpdated: 'Config updated:',
            initDryRunCreate: (p) => `[dry-run] would create template: ${p}`,
            initDryRunWrite: (p) => `[dry-run] would write config: ${p}`,
            uploadRetrying: (file, attempt) => `${file} upload failed, retrying (attempt ${attempt})`,
            uploadDone: 'Upload complete',
            uploadLabel: 'Uploaded',
            uploadSkippedLabel: 'Skipped',
            uploadFailedLabel: 'Failed',
            uploadTotalLabel: 'Total',
            uploadCacheHint: 'cached, no changes',
            uploadLinksTitle: 'Uploaded file links',
            uploadFileUnit: 'files',
            uploadFailed: (n) => `Upload finished with ${n} failures`,
            refreshDone: 'Refresh complete',
            refreshSucceededLabel: 'Succeeded',
            refreshFailedLabel: 'Failed',
            refreshTotalLabel: 'Total',
            refreshUnit: '',
            refreshFailed: (n) => `Refresh finished with ${n} failures`,
            deployDone: 'Deploy complete',
            deploySkipRefresh: 'Refresh step skipped (--skip-refresh)',
            deployUploadLabel: 'Upload',
            deployRefreshLabel: 'Refresh',
            deployFileUnit: 'files',
            deployUnit: '',
            errorTitle: 'Error',
            errorMissingConfig: 'Incomplete config, the following fields are missing or empty:',
            errorMissingConfigHint: 'Check Qiniu config (~/.struggler-cli/profiles, Windows: %USERPROFILE%\\.struggler-cli\\profiles) or command/qiniu.json, plus command/config.json; you can also run struggler-cli init first.',
            profileListEmpty: 'No profiles yet. Run: struggler-cli profile add <name>',
            profileListTitle: 'Profiles:',
            profileListCurrentHint: '(* = active)',
            profileUseDone: (name) => `Active profile: ${name}`,
            profileNoCurrent: 'No active profile. Run: struggler-cli profile use <name>',
            profileCurrentLabel: 'Active profile:',
            profileAddDone: (name) => `Created profile: ${name}`,
            profileImportDone: (name) => `Imported profile: ${name}`,
            profileEditHint: 'Edit the file and fill accessKey, secretKey, Bucket, zone, domain.',
            dryRunLabel: 'dry-run',
            dryRunPlan: (action, n) => `[dry-run] ${action} plan (${n} files)`,
            manifestWritten: 'Manifest written:',
        },
        options: {
            version: 'Display the version number.',
            config: 'Qiniu config: profile name (e.g. prod) or file path (e.g. ./command/qiniu.json); when omitted, use ~/.struggler-cli/current first (Windows: %USERPROFILE%\\.struggler-cli\\current), then fallback to ./command/qiniu.json.',
            configDir: 'Directory for config.json and upload-cache.json; defaults to ./command when omitted (legacy behavior).',
            dir: 'Specify the directory to upload.',
            dryRun: 'Preview actions without writing files or calling Qiniu APIs.',
            concurrency: 'Set upload concurrency.',
            exclude: 'Exclude file glob patterns, supports comma-separated values.',
            ignoreFile: 'Specify a custom ignore file.',
            manifest: 'Write the command summary to a manifest JSON file.',
            json: 'Print machine-readable JSON output.',
            skipInit: 'Skip init during deploy.',
            skipRefresh: 'Skip refresh during deploy.',
            noCache: 'Disable upload cache and force re-upload all files.',
            lang: 'Switch menu language, supported values: zh / en.',
            help: 'Display help information.',
        },
        commands: {
            init: 'Create upload configuration for the specified path.',
            upload: 'Upload files under the specified directory to Qiniu Cloud.',
            refresh: 'Refresh Qiniu Cloud CDN files.',
            deploy: 'Run init, upload, and refresh in one command.',
            profile: 'Manage multiple Qiniu configs (profiles).',
            profileList: 'List profiles',
            profileUse: 'Set active profile',
            profileCurrent: 'Show active profile',
            profileAdd: 'Create profile from template',
            profileImport: 'Import profile from file',
        },
        help: {
            helpCommandDescription: 'display help for command',
            commandUsage: 'Usage:',
            commandDescription: 'Description:',
            commandOptions: 'Options:',
            commandCommands: 'Commands:',
            subcommandTerm: 'command',
            optionTerm: 'option',
            argumentTerm: 'argument',
            usage: 'Usage',
            options: 'Options',
            commands: 'Commands',
            arguments: 'Arguments',
        },
    },
};

function normalizeLocaleTag(value) {
    if (!value) {
        return '';
    }

    return value.toLowerCase().replace('.', '_');
}

function detectLangFromLocale(localeValue) {
    const normalized = normalizeLocaleTag(localeValue);
    if (!normalized) {
        return null;
    }

    if (normalized.startsWith('en')) {
        return 'en';
    }

    if (normalized.startsWith('zh')) {
        return 'zh';
    }

    return null;
}

function detectLangFromVSLang(value) {
    if (!value) {
        return null;
    }

    const normalized = String(value).trim();
    const englishCodes = new Set(['1033', '2057', '4105', '5129', '6153']);
    const chineseCodes = new Set(['2052', '1028', '3076', '4100']);

    if (englishCodes.has(normalized)) {
        return 'en';
    }

    if (chineseCodes.has(normalized)) {
        return 'zh';
    }

    return null;
}

function detectLangFromWindowsValue(value) {
    return detectLangFromLocale(value);
}

function detectSystemLang(env = process.env) {
    const localeCandidates = [
        env.LC_ALL,
        env.LC_MESSAGES,
        env.LANG,
        env.PreferredUILanguages,
        env.UILANG,
        env.Culture,
        env.UserLanguage,
    ];

    for (const candidate of localeCandidates) {
        const detected = detectLangFromLocale(candidate);
        if (detected) {
            return detected;
        }
    }

    const windowsSpecificCandidates = [
        env.VSLANG,
        env.PREFERRED_UI_LANGUAGES,
        env.UI_LANG,
    ];

    for (const candidate of windowsSpecificCandidates) {
        const detected = detectLangFromVSLang(candidate) || detectLangFromWindowsValue(candidate);
        if (detected) {
            return detected;
        }
    }

    return 'zh';
}

function resolveLang(argv) {
    const langFlagIndex = argv.findIndex((item) => item === '--lang');
    if (langFlagIndex >= 0 && argv[langFlagIndex + 1] && LANGUAGES[argv[langFlagIndex + 1]]) {
        return argv[langFlagIndex + 1];
    }

    const inlineFlag = argv.find((item) => item.startsWith('--lang='));
    if (inlineFlag) {
        const [, value] = inlineFlag.split('=');
        if (LANGUAGES[value]) {
            return value;
        }
    }

    return detectSystemLang();
}

function getLocale(lang) {
    return LANGUAGES[lang] || LANGUAGES.zh;
}

module.exports = {
    LANGUAGES,
    detectSystemLang,
    resolveLang,
    getLocale,
};
