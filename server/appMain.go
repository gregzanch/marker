package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

func main() {

	appState := &AppState{
		rooms: make(map[string]*Room),
	}

	// create the server router to handle different paths
	router := mux.NewRouter()

	router.HandleFunc("/new", New(appState)).
		HeadersRegexp("Content-Type", "application/json").
		Methods("POST")

	router.HandleFunc("/getRoomName", GetRoomName(appState)).
		HeadersRegexp("Content-Type", "application/json").
		Methods("POST", "GET")

	router.HandleFunc("/getClients", GetClients(appState)).
		HeadersRegexp("Content-Type", "application/json").
		Methods("POST", "GET")

	router.HandleFunc("/getCurrentBoardState", GetCurrentBoardState(appState)).
		HeadersRegexp("Content-Type", "application/json").
		Methods("POST", "GET")

	router.HandleFunc("/ws/{id}/{name}/{userId}", HandleWebSocket(appState))

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

	appState.cleanup()

	log.Fatal(srv.ListenAndServe())
}
