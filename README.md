# DeepSeek Deployment Stack

This repository contains the deployment stack for the DeepSeek model using the Ollama platform and Open Web UI.

## Installation

```sh
make start
```

Check containers

```sh
make ps
```

Install model(s): Please check the model at <https://ollama.com/search>.

```sh
make install-models
```

## Usage

Run the DeepSeek-R1 model using the Ollama CLI

```sh
make run-cli
```

Open open-webui <http://localhost:15000> in your browser, and you are done!

```sh
# macOS
open -a "Google Chrome" http://localhost:15000
```

```sh
# Linux
google-chrome http://localhost:3000
```

```sh
# Windows
start chrome http://localhost:3000
```

Checkout: [Open chat.html](chat.html)

## Stop

```sh
make stop
```
