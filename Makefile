SHELL := /bin/zsh

NODE ?= node
PNPM ?= pnpm
CLI_ENTRY ?= ./index.js
CONFIG ?= ./command/qiniu.json
DIR ?= ./dist
DRY_RUN ?=
CONCURRENCY ?= 5
EXCLUDE ?=
MANIFEST ?=
JSON ?=
SKIP_INIT ?=
SKIP_REFRESH ?=

.PHONY: help install reinstall link unlink init upload refresh deploy add-version example-upload test

help:
	@echo "Available targets:"
	@echo "  make install                    Install dependencies"
	@echo "  make reinstall                  Reinstall dependencies from scratch"
	@echo "  make link                       Link the CLI globally for local usage"
	@echo "  make unlink                     Remove the global link"
	@echo "  make init                       Generate/update upload config metadata"
	@echo "  make upload                     Upload files from DIR using CONFIG"
	@echo "  make refresh                    Refresh CDN for files from DIR using CONFIG"
	@echo "  make deploy                     Run init, upload, and refresh in one go"
	@echo "  make add-version                Run the package version bump script"
	@echo "  make example-upload             Upload the sample test/dist3 directory"
	@echo "  make test                       Run the automated test suite"
	@echo ""
	@echo "Variables:"
	@echo "  CONFIG=$(CONFIG)"
	@echo "  DIR=$(DIR)"
	@echo "  CLI_ENTRY=$(CLI_ENTRY)"
	@echo "  CONCURRENCY=$(CONCURRENCY)"
	@echo "  DRY_RUN=$(DRY_RUN)"
	@echo "  EXCLUDE=$(EXCLUDE)"
	@echo "  MANIFEST=$(MANIFEST)"
	@echo "  JSON=$(JSON)"
	@echo ""
	@echo "Example:"
	@echo "  make upload DIR=./test/dist3 CONFIG=./test/command/qiniu.json DRY_RUN=--dry-run EXCLUDE=.DS_Store"

install:
	$(PNPM) install

reinstall:
	rm -rf node_modules
	$(PNPM) install

link:
	@if ! $(PNPM) bin --global >/dev/null 2>&1; then \
		echo "pnpm global bin not configured, running 'pnpm setup' first..."; \
		$(PNPM) setup; \
	fi
	@$(PNPM) link --global

unlink:
	@$(PNPM) unlink --global @struggler/cli

init:
	$(NODE) $(CLI_ENTRY) --config $(CONFIG) --dir $(DIR) $(DRY_RUN) $(JSON) init

upload:
	$(NODE) $(CLI_ENTRY) --config $(CONFIG) --dir $(DIR) --concurrency $(CONCURRENCY) $(DRY_RUN) $(if $(EXCLUDE),--exclude $(EXCLUDE),) $(if $(MANIFEST),--manifest $(MANIFEST),) $(JSON) upload

refresh:
	$(NODE) $(CLI_ENTRY) --config $(CONFIG) --dir $(DIR) $(DRY_RUN) $(if $(EXCLUDE),--exclude $(EXCLUDE),) $(if $(MANIFEST),--manifest $(MANIFEST),) $(JSON) refresh

deploy:
	$(NODE) $(CLI_ENTRY) --config $(CONFIG) --dir $(DIR) --concurrency $(CONCURRENCY) $(DRY_RUN) $(if $(EXCLUDE),--exclude $(EXCLUDE),) $(if $(MANIFEST),--manifest $(MANIFEST),) $(JSON) $(SKIP_INIT) $(SKIP_REFRESH) deploy

add-version:
	$(PNPM) add-version

example-upload:
	$(NODE) $(CLI_ENTRY) --config ./test/command/qiniu.json --dir ./test/dist3 --concurrency $(CONCURRENCY) $(DRY_RUN) $(if $(EXCLUDE),--exclude $(EXCLUDE),) $(if $(MANIFEST),--manifest $(MANIFEST),) $(JSON) upload

test:
	$(PNPM) test
