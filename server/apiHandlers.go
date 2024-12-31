package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// Creates a new room
func New(appState *AppState) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var d struct {
			RoomName string `json:"roomName"`
			UserName string `json:"userName"`
		}
		// Try to decode the request body into the struct. If there is an error,
		// respond to the client with the error message and a 400 status code.
		err := json.NewDecoder(r.Body).Decode(&d)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		pid := uuid.New().String()
		appState.rooms[pid] = &Room{
			id:         pid,
			name:       d.RoomName,
			appState:   appState,
			clients:    make(map[string]*Client),
			broadcast:  make(chan []byte),
			register:   make(chan *Client),
			unregister: make(chan *Client),
			lastEmpty:  time.Now().UnixMilli(),
			lines: 			make(map[string]*Line),
		}
		var responseMessage struct {
			ID       string `json:"id"`
			UserName string `json:"userName"`
		}

		responseMessage.ID = pid
		responseMessage.UserName = d.UserName

		json.NewEncoder(w).Encode(responseMessage)

	}
}

// Gets the room name for a specific room id
func GetRoomName(appState *AppState) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var d struct {
			ID string `json:"id"`
		}

		err := json.NewDecoder(r.Body).Decode(&d)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		var responseMessage struct {
			Name string `json:"name"`
		}

		if val, ok := appState.rooms[d.ID]; ok {
			responseMessage.Name = val.name
			json.NewEncoder(w).Encode(responseMessage)
		} else {
			http.NotFound(w, r)
		}

	}
}

// Gets all the clients for a specific room given an ID
func GetClients(appState *AppState) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var d struct {
			ID string `json:"id"`
		}

		err := json.NewDecoder(r.Body).Decode(&d)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		var responseMessage struct {
			Clients []*Client `json:"clients"`
		}

		if val, ok := appState.rooms[d.ID]; ok {
			responseMessage.Clients = make([]*Client, len(val.clients))
			i := 0
			for _, client := range val.clients {
				responseMessage.Clients[i] = client
				i += 1
			}
			json.NewEncoder(w).Encode(responseMessage)
		} else {
			http.NotFound(w, r)
		}
	}
}

// Handle incoming web socket requests
func HandleWebSocket(appState *AppState) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		room := appState.rooms[vars["id"]]
		name := vars["name"]
		userId := vars["userId"]
		if room != nil {
			go room.run()
			serveWs(room, name, userId, w, r)
		} else {
			w.WriteHeader(404)
			w.Write([]byte("Could not find room"))
		}
	}
}
