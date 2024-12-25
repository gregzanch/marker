package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type AppHandler struct {
	staticPath string
	indexPath  string
	appState   *AppState
}

func (appHandler AppHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Join internally call path.Clean to prevent directory traversal
	path := filepath.Join(appHandler.staticPath, r.URL.Path)

	queriedPath := r.URL.Path[1:]
	_, ok := uuid.Parse(queriedPath)
	if ok == nil && appHandler.appState.rooms[queriedPath] == nil {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	// check whether a file exists or is a directory at the given path
	fi, err := os.Stat(path)
	if os.IsNotExist(err) || fi.IsDir() {
		// file does not exist or path is a directory, serve index.html
		http.ServeFile(w, r, filepath.Join(appHandler.staticPath, appHandler.indexPath))
		return
	}

	if err != nil {
		// if we got an error (that wasn't that the file doesn't exist) stating the
		// file, return a 500 internal server error and stop
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// otherwise, use http.FileServer to serve the static file
	http.FileServer(http.Dir(appHandler.staticPath)).ServeHTTP(w, r)
}

func main() {

	appState := &AppState{
		rooms: make(map[string]*Room),
	}

	// create the server router to handle different paths
	router := mux.NewRouter()

	router.HandleFunc("/new", func(w http.ResponseWriter, r *http.Request) {
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
			clients:    make(map[*Client]bool),
			broadcast:  make(chan []byte),
			register:   make(chan *Client),
			unregister: make(chan *Client),
		}
		var responseMessage struct {
			ID string `json:"id"`
			UserName string `json:"userName"`
		}

		responseMessage.ID = pid
		responseMessage.UserName = d.UserName

		json.NewEncoder(w).Encode(responseMessage)

	}).HeadersRegexp("Content-Type", "application/json").Methods("POST")

	// handle the websocket route before the "catch all" handler
	router.HandleFunc("/ws/{id}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		room := appState.rooms[vars["id"]]
		if room != nil {
			go room.run()
			serveWs(room, w, r)
		} else {
			w.WriteHeader(404)
			w.Write([]byte("Could not find room"))
		}
	})

	router.HandleFunc("/has/{id}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		room := appState.rooms[vars["id"]]
		if room == nil {
			w.WriteHeader(404)
			w.Write([]byte("Could not find id"))
		} else {
			w.WriteHeader(200)

		}
	})

	// point the main app to the dist directory created by svelte
	app := AppHandler{staticPath: "../app/dist", indexPath: "index.html", appState: appState}
	router.PathPrefix("/").Handler(app)

	// create the server itself
	srv := &http.Server{
		Handler:      router,
		Addr:         "127.0.0.1:8000",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Fatal(srv.ListenAndServe())
}
