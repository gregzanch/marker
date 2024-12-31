package main

import (
	"log"
	"time"
)

var cleanupPeriod = (time.Duration(1) * time.Minute);

type AppState struct {
	rooms map[string]*Room `json:"rooms"`
}

func (appState *AppState) removeRoom(id string) {
	delete(appState.rooms, id)
}

func (appState *AppState) cleanup() {
	currentTime := time.Now().UnixMilli();
	for _, room := range appState.rooms {
		if len(room.clients) == 0 {
			if currentTime - room.lastEmpty >= cleanupPeriod.Milliseconds() {
				log.Printf("removed room '%s' [%s]\n", room.name, room.id)
				room.appState.removeRoom(room.id)
			}
		}
	}
	time.AfterFunc(cleanupPeriod, appState.cleanup)
}