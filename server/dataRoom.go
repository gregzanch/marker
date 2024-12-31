package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

// Room maintains the set of active clients and broadcasts messages to the clients.
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
	// lines in the drawing
	lines map[string]*Line
}

func (room *Room) createNewLine(data CreateNewLineData, from From) {
	client, ok := room.clients[from.ID]
	if !ok {
		log.Printf("Could not find client with id '%s'", from.ID)
		return
	}

	room.lines[data.ID] = &Line{
		Vertices: data.Vertices,
		Color: data.Color,
		ID: data.ID,
		User: client,
	}
}

func (room *Room) addPointToLine(data AddPointToLineData) {
	line, ok := room.lines[data.ID]
	if !ok {
		log.Printf("Could not find line with id '%s'", data.ID)
	}
	line.Vertices = append(line.Vertices, Point{ X: data.X, Y: data.Y })
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
					room.lastEmpty = time.Now().UnixMilli()
				}
			}

		// on message
		case message := <-room.broadcast:
			
			var obj Message
			if err := json.Unmarshal(message, &obj); err != nil {
				log.Println("Error unmarshaling message:", err)
				continue
			}
			switch obj.Type {
			case "user-joined":
				var data UserJoinedData
				if err := json.Unmarshal(obj.Data, &data); err != nil {
					log.Println("Error unmarshaling user joined data:", err)
					continue
				}
				// handle user joined

			case "cursor-change":
				var data CursorChangeData
				if err := json.Unmarshal(obj.Data, &data); err != nil {
					log.Println("Error unmarshaling cursor change data:", err)
					continue
				}
				// handle cursor change

			case "draw-ellipse":
				var data DrawEllipseData
				if err := json.Unmarshal(obj.Data, &data); err != nil {
					log.Println("Error unmarshaling draw ellipse data:", err)
					continue
				}
				// handle draw ellipse

			case "create-new-line":
				var data CreateNewLineData
				if err := json.Unmarshal(obj.Data, &data); err != nil {
					log.Println("Error unmarshaling create new line:", err)
					continue
				}
				room.createNewLine(data, obj.From)

			case "add-point-to-line":
				var data AddPointToLineData
				if err := json.Unmarshal(obj.Data, &data); err != nil {
					log.Println("Error unmarshaling add point to line:", err)
					continue
				}
				room.addPointToLine(data)


			default:
				log.Println("Unknown message type:", obj.Type)
			}

			fmt.Println(obj)
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