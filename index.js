#! /usr/bin/env node
const { magentaBright } = require("chalk")
const figlet = require("figlet")
const clear = require("clear")
const { program } = require("commander")
const command = require("./command")
const packageJson = require("./package.json")
const { shouldUseJson, printError, printJson } = require("./lib/output")
const { resolveLang, getLocale } = require("./lib/i18n")

const lang = resolveLang(process.argv)
const locale = getLocale(lang)
const isJsonMode = process.argv.includes("--json")

// 清除命令行
if (!shouldUseJson({ json: isJsonMode })) {
	clear()
}

// 输出Logo
if (!isJsonMode) {
	console.log(magentaBright(figlet.textSync("struggler-cli", { horizontalLayout: "full" })), "\n\n")
}

function formatItems(items, getLeft, getRight) {
	if (items.length === 0) {
		return []
	}

	const width = items.reduce((max, item) => Math.max(max, getLeft(item).length), 0)
	return items.map((item) => `  ${getLeft(item).padEnd(width)}  ${getRight(item)}`.trimEnd())
}

program.configureHelp({
	formatHelp: (cmd, helper) => {
		const lines = []
		lines.push(`${locale.help.usage}: ${helper.commandUsage(cmd)}`)

		const description = helper.commandDescription(cmd)
		if (description) {
			lines.push("")
			lines.push(`${locale.help.commandDescription} ${description}`)
		}

		const options = helper.visibleOptions(cmd)
		if (options.length > 0) {
			lines.push("")
			lines.push(`${locale.help.options}:`)
			lines.push(...formatItems(options, (option) => helper.optionTerm(option), (option) => option.description))
		}

		const commands = helper.visibleCommands(cmd)
		if (commands.length > 0) {
			lines.push("")
			lines.push(`${locale.help.commands}:`)
			lines.push(...formatItems(commands, (subcommand) => helper.subcommandTerm(subcommand), (subcommand) => subcommand.description()))
		}

		return lines.join("\n")
	},
})

program.name("struggler-cli").description(locale.appDescription).version(packageJson.version, "-v, --version", locale.options.version).helpOption("-h, --help", locale.options.help).option("-c, --config <path>", locale.options.config, "./command/qiniu.json").option("-d, --dir <path>", locale.options.dir, "./dist").option("--dry-run", locale.options.dryRun).option("--concurrency <number>", locale.options.concurrency, "5").option("--exclude <pattern>", locale.options.exclude).option("--ignore-file <path>", locale.options.ignoreFile, ".strugglerignore").option("--manifest <path>", locale.options.manifest).option("--json", locale.options.json).option("--skip-init", locale.options.skipInit).option("--skip-refresh", locale.options.skipRefresh).option("--no-cache", locale.options.noCache).option("--lang <lang>", locale.options.lang, lang)

program
	.command("init")
	.description(locale.commands.init)
	.action(async () => {
		await command.init(program.opts())
	})

program
	.command("upload")
	.description(locale.commands.upload)
	.action(async () => {
		await command.upload(program.opts())
	})

program
	.command("refresh")
	.description(locale.commands.refresh)
	.action(async () => {
		await command.refresh(program.opts())
	})

program
	.command("deploy")
	.description(locale.commands.deploy)
	.action(async () => {
		await command.deploy(program.opts())
	})

program.addHelpCommand(true, locale.help.helpCommandDescription)

program.parseAsync().catch(error => {
	if (isJsonMode) {
		printJson({ ok: false, error: error.message || String(error) })
		return
	}
	printError({}, error.message || error)
	process.exitCode = 1
})
