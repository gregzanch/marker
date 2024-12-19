package main


type Point struct {
	X float64 `json:"x"`;
	Y float64 `json:"y"`;
}

type AppState struct {
	rooms map[string]*Room `json:"rooms"`
}

func (appState *AppState) removeRoom(id string) {
	delete(appState.rooms, id)
}