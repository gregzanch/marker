package main

import (
	"log"
	"time"
)

// Room maintains the set of active clients and broadcasts messages to the
// clients.
type Room struct {
	// Registered clients.
	clients map[string]*Client

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client

	// access to app state
	appState *AppState

	// name of the room
	name string

	// id of the room
	id string

	// the last time this room was empty, used for cleanup
	lastEmpty int64
}

func (room *Room) run() {

	// loops on client open / close / message
	for {
		select {
		// registered case
		case client := <-room.register:
			log.Println("Registered new client")
			room.clients[client.ID] = client

		// unregistered case
		case client := <-room.unregister:
			log.Println("Unregistered client")
			if _, ok := room.clients[client.ID]; ok {
				delete(room.clients, client.ID)
				close(client.send)
				if len(room.clients) == 0 {
					room.lastEmpty = time.Now().UnixMilli();
				}
			}

		// on message
		case message := <-room.broadcast:
			log.Printf("Message received '%s'", message)
			for _, client := range room.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(room.clients, client.ID)
				}
			}
		}
	}
}
