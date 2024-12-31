package main

import "encoding/json"

type From struct {
	Name string `json:"name"`
	ID string `json:"id"`
}

type Message struct {
	From From`json:"from"`
	Type string `json:"type"`
	Data json.RawMessage `json:"data"`
}

type DataType interface {
	UserJoinedData | CursorChangeData | DrawEllipseData | CreateNewLineData | AddPointToLineData
}

type UserJoinedData struct {}

type CursorChangeData Point

type DrawEllipseData struct {
	ID string `json:"id"`
	X float64 `json:"x"`
	Y float64 `json:"y"`
	RX float64 `json:"rx"`
	RY float64 `json:"ry"`
	Color string `json:"color"`
}

type CreateNewLineData struct {
	ID string `json:"id"`
	Color string `json:"color"`
	Vertices []Point `json:"vertices"`
}

type AddPointToLineData struct {
	ID string `json:"id"`
	X float64 `json:"x"`
	Y float64 `json:"y"`
}