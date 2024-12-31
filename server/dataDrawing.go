package main

// Describes a point in 2d space
type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// Describes a line drawing
type Line struct {
	Vertices []Point `json:"vertices"`
	Color string `json:"color"`
	User *Client `json:"client"`
	ID string `json:"id"`
}
