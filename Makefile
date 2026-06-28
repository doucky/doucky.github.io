# ─── doucky.github.io — Jekyll dev shortcuts ────────────────
# Usage: make <target>   (run `make` or `make help` to list targets)

BUNDLE = bundle exec
JEKYLL = $(BUNDLE) jekyll
PORT   ?= 4000
# Force file polling so saves are detected reliably on Windows / network drives
POLL   = --force_polling

.DEFAULT_GOAL := help
.PHONY: help install update serve dev incremental drafts build clean rebuild

help: ## Show this help
	@echo "doucky.github.io — available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install Ruby gem dependencies (first-time setup)
	bundle install

update: ## Update gems to their latest allowed versions
	bundle update

serve: ## Serve locally with live reload (auto-refresh on save)
	$(JEKYLL) serve --livereload $(POLL) --port $(PORT)

dev: ## Full dev mode: live reload + drafts + incremental builds
	$(JEKYLL) serve --livereload --drafts --incremental $(POLL) --port $(PORT)

incremental: ## Serve with live reload + faster incremental rebuilds
	$(JEKYLL) serve --livereload --incremental $(POLL) --port $(PORT)

drafts: ## Serve with live reload, including posts in _drafts/
	$(JEKYLL) serve --livereload --drafts $(POLL) --port $(PORT)

build: ## Build the production site into _site/
	JEKYLL_ENV=production $(JEKYLL) build

clean: ## Remove _site/ and Jekyll caches
	$(JEKYLL) clean

rebuild: clean build ## Clean then build from scratch
