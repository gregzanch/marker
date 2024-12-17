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
}

func newRoom() *Room {
	return &Room{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Room) run() {
	// loops on client open / close / message
	for {
		select {
		// registered case
		case client := <-h.register:
			log.Println("Registered new client")
			h.clients[client] = true

		// unregistered case
		case client := <-h.unregister:
			log.Println("Unregistered client")
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}

		// on message
		case message := <-h.broadcast:
			log.Printf("Message received '%s'", message)
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}
