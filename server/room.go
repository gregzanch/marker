package main

import (
	"log"
)

// Room maintains the set of active clients and broadcasts messages to the
// clients.
type Room struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client

	appState *AppState
	name string
	id string
}

func (room *Room) run() {
	// loops on client open / close / message
	for {
		select {
		// registered case
		case client := <-room.register:
			log.Println("Registered new client")
			room.clients[client] = true

		// unregistered case
		case client := <-room.unregister:
			log.Println("Unregistered client")
			if _, ok := room.clients[client]; ok {
				delete(room.clients, client)
				close(client.send)
				if len(room.clients) == 0 {
					room.appState.removeRoom(room.id)
				}
			}

		// on message
		case message := <-room.broadcast:
			log.Printf("Message received '%s'", message)
			for client := range room.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(room.clients, client)
				}
			}
		}
	}
}
