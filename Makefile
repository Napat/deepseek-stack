PROJECTNAME := $(shell basename "$(PWD)")
# OS := $(shell uname -s | awk '{print tolower($$0)}')
# GOARCH := amd64

## start: start deepseek-r1 stack
.PHONY: start
start:
	@docker compose up -d

## ps: show process
.PHONY: ps
ps:
	@docker compose ps

## stop: stop deepseek-r1 stack
.PHONY: stop
stop:
	@docker compose down

## install-models: install deepseek-r1 model(s)
.PHONY: install-models
install-models:
	@docker exec -it deepseek-ollama-service-1 ollama pull deepseek-r1:1.5b
	# @docker exec -it deepseek-ollama-service-1 ollama pull deepseek-r1:7b

## run-cli: run deepseek-r1 stack command line
.PHONY: run-cli
run-cli:
	@docker exec -it deepseek-ollama-service-1 ollama run deepseek-r1:1.5b

## run-web: run deepseek-r1 open-webui
.PHONY: run-web
run-web:
	@open -a "Google Chrome" http://localhost:15000

## setup-env: setup python virtual environment and install dependencies
.PHONY: setup-env
setup-env:
	@python -m venv .venv
	@echo "Virtual environment created. Activate it with:"
	@echo "source .venv/bin/activate  # On Linux/Mac"
	@echo ".venv\\Scripts\\activate    # On Windows"
	@echo "Then run: pip install -r requirements.txt"

## help: helper
.PHONY: help
all: help
help: Makefile
	@echo
	@echo " Project: ["$(PROJECTNAME)"]"
	@echo " Please choose a command"
	@echo
	@sed -n 's/^##//p' $< | column -t -s ':' |  sed -e 's/^/ /'
	@echo
