package main

type Point struct {
	X float64 `json:"x"`;
	Y float64 `json:"y"`;
}

type Project struct {
	Points []Point `json:"points"`
	Name string `json:"name"`
	ID string `json:"id"`
	Room *Room `json:"-"`
}

type AppState struct {
	Projects map[string]*Project `json:"projects"`
}