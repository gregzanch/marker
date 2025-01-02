package main

import (
	"bytes"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
	
	// Maximum message size allowed from peer.
	maxMessageSize = 16384
)


var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Client is a middleman between the websocket connection and the room.
type Client struct {
	room *Room
	// The websocket connection.
	conn *websocket.Conn
	// Buffered channel of outbound messages.
	send chan []byte
	// mutex lock
	lock sync.Mutex
	// When the client was initialized
	JoinedAt time.Time `json:"-"`
	// IP of the client
	IPAddress string `json:"-"`
	// user defined name
	UserName string `json:"name,omitempty"`
	// Color defined for the user
	Color string `json:"color,omitempty"`
	// users id
	ID string `json:"id"`
	// position of cursor
	Position Point `json:"position"`
	// is the client on the page
	Visible bool `json:"visible"`
}


// readPump pumps messages from the websocket connection to the room.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (client *Client) readPump() {
	defer func() {
		client.room.unregister <- client
		client.conn.Close()
	}()
	client.conn.SetReadLimit(maxMessageSize)
	client.conn.SetReadDeadline(time.Now().Add(pongWait))
	client.conn.SetPongHandler(func(string) error { client.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		messages := bytes.Split(message, newline)
		for _, v := range messages {
			v = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
			client.room.broadcast <- v
		}
	}
}

// writePump pumps messages from the room to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (client *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		client.conn.Close()
	}()
	for {
		select {
		case message, ok := <-client.send:
			client.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The room closed the channel.
				client.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			writer, err := client.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			writer.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(client.send)
			for i := 0; i < n; i++ {
				writer.Write(newline)
				val := <-client.send

				writer.Write(val)
			}

			if err := writer.Close(); err != nil {
				return
			}
		case <-ticker.C:
			client.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := client.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// serveWs handles websocket requests from the peer.
func serveWs(room *Room, name string, userId string, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{
		room: room,
		conn: conn,
		send: make(chan []byte, 256),
		IPAddress: r.RemoteAddr,
		UserName: name,
		Color: GetRandomColor(),
		JoinedAt: time.Now(),
		ID: userId,
		Position: Point{X: 0, Y:0},
		Visible: true,
	}
	// Register this client, triggering the select case in Room->run()
	client.room.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}
