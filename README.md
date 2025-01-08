<h1 align="center">
  <img alt="Marker Logo" src="app/public/full-logo.svg">
</h1>

<img id="version" src="https://img.shields.io/badge/version-1.1.0-blue" alt="version 1.1.0" />

Marker is a simple sharable white board application using websockets written in Go. The frontend is written in Svelte.

## Developing

To build the server, run the following in your terminal. This runs the `build` script in the `Makefile`

```sh
make build
```

To run the server, call the `run.sh` script:

```sh
./run.sh
```

To build the backend, run the following in your terminal. This runs the `build-app` script in the `Makefile`

```sh
make build-app
```

### My Workflow

My general workflow involves [watching](https://github.com/gregzanch/watch) to front end for changes, and executing `make build-app` when a file is saved. My [watch](https://github.com/gregzanch/watch) program make this pretty simple. I run something like the following in one terminal window. This watches all the files in `app/src/*` for changes.

```sh
find app/src/* | watch --poll-rate 250 "make build-app"
```

In another terminal window I run `make build` whenever I make changes to the server.

> NOTE: I don't watch the changes for the server due to limitations of my [watch](https://github.com/gregzanch/watch) program.


## Roadmap

- [x] Implement basic app in svelte
- [x] Implement drawing
  - [x] Create drawing board
  - [x] Create the data structure for sending/receiving
  - [x] implement using websockets
- [x] Preserve drawings option (maybe use redis for in memory storage)
- [x] Add "rooms" feature
  - [x] Backend handling of rooms with IDs 
  - [x] Frontend for creating rooms

## Design

Follow the [design](https://www.figma.com/design/HUzjefdAllJMLkFTIRFzzC/Marker) on Figma

## Contributing

Here are some basic contibuting rules

### Upgrading Version

When upgrading a version run the following make commands:
- For a major upgrade, run `make major`
- For a minor upgrade, run `make minor`
- For a patch upgrade, run `make patch`
- For a specific version, run `make version v=<version>`


