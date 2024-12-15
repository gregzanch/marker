# Marker

Marker is a simple sharable white board application using websockets written in Go. The frontend is written in Svelte.

## Roadmap

- [x] Implement basic app in svelte
- [ ] Implement drawing
  - [ ] Create drawing board
  - [ ] Create the data structure for sending/receiving
  - [ ] implement using websockets
- [ ] Preserve drawings option (maybe use redis for in memory storage)
- [ ] Add "rooms" feature
  - [ ] Backend handling of rooms with IDs 
  - [ ] Frontend for creating rooms

## Design

Follow the [design](https://www.figma.com/design/HUzjefdAllJMLkFTIRFzzC/Marker) on Figma