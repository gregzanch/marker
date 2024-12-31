package main

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/google/uuid"
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
