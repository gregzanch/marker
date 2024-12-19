package main

import (
	"fmt"
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
}

func (h AppHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Join internally call path.Clean to prevent directory traversal
	path := filepath.Join(h.staticPath, r.URL.Path)

	// check whether a file exists or is a directory at the given path
	fi, err := os.Stat(path)
	if os.IsNotExist(err) || fi.IsDir() {
		// file does not exist or path is a directory, serve index.html
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	}

	if err != nil {
		// if we got an error (that wasn't that the file doesn't exist) stating the
		// file, return a 500 internal server error and stop
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// otherwise, use http.FileServer to serve the static file
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}

func main() {

	appState := &AppState{
		Projects: make(map[string]*Project),
	}

	// create the server router to handle different paths
	router := mux.NewRouter()
	
	router.HandleFunc("/new/{name}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		name := vars["name"]
		if name == "" {
			w.WriteHeader(400)
			w.Write([]byte("Could not parse name parameter"))
			return
		}
		pid := uuid.New().String()
		appState.Projects[pid] = &Project {
			Points: make([]Point, 0),
			ID: pid,
			Name: name,
			Room: newRoom(),
		}
		fmt.Println(appState);
		http.Redirect(w, r, fmt.Sprintf("/%s", pid), http.StatusSeeOther)
	})

	// handle the websocket route before the "catch all" handler
	router.HandleFunc("/ws/{pid}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		project := appState.Projects[vars["pid"]]
		if project != nil {
			go project.Room.run()
			serveWs(project.Room, w, r)
		}
	})

	// point the main app to the dist directory created by svelte
	app := AppHandler{staticPath: "../app/dist", indexPath: "index.html"}
	router.PathPrefix("/").Handler(app)

	// create the server itself
	srv := &http.Server{
		Handler: router,
		Addr:    "127.0.0.1:8000",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Fatal(srv.ListenAndServe())
}
