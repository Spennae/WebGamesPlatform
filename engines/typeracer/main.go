package main

import (
	"encoding/json"
	"errors"
	"log"
	"math"
	"math/rand"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Player struct {
	Username   string
	Conn       *websocket.Conn
	Ready      bool
	Progress   int
	Errors     int
	Finished   bool
	FinishTime time.Time
}

type Room struct {
	Code      string
	Players   map[string]*Player
	Text      string
	State     string
	Countdown int
	CreatedAt time.Time
	mu        sync.Mutex
}

type Message struct {
	Type      string   `json:"type"`
	RoomCode  string   `json:"roomCode,omitempty"`
	Username  string   `json:"username,omitempty"`
	Players   []string `json:"players,omitempty"`
	Progress  int      `json:"progress,omitempty"`
	Errors    int      `json:"errors,omitempty"`
	Text      string   `json:"text,omitempty"`
	TimeLimit int      `json:"timeLimit,omitempty"`
	WPM       float64  `json:"wpm,omitempty"`
	Accuracy  float64  `json:"accuracy,omitempty"`
	Count     int      `json:"count,omitempty"`
}

type SampleTexts struct {
	Texts []string `json:"texts"`
}

var (
	rooms   = make(map[string]*Room)
	roomsMu sync.RWMutex
)

var validChars = []rune("ABCDEFGHJKMNPQRSTUVWXYZ23456789")

func main() {
	texts, err := loadTexts("texts/samples.json")
	if err != nil {
		log.Fatal("Failed to load texts:", err)
	}

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleWebSocket(w, r, texts)
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	})

	go func() {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8081"
		}
		log.Printf("TypeRacer engine starting on port %s", port)
		if err := http.ListenAndServe(":"+port, nil); err != nil {
			log.Fatal(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")
}

func loadTexts(path string) ([]string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var samples SampleTexts
	if err := json.Unmarshal(data, &samples); err != nil {
		return nil, err
	}

	return samples.Texts, nil
}

func generateRoomCode() (string, error) {
	for attempts := 0; attempts < 10; attempts++ {
		code := make([]rune, 4)
		for i := range code {
			code[i] = validChars[rand.Intn(len(validChars))]
		}
		codeStr := string(code)

		roomsMu.RLock()
		_, exists := rooms[codeStr]
		roomsMu.RUnlock()

		if !exists {
			return codeStr, nil
		}
	}
	return "", errors.New("failed to generate unique room code")
}

func createRoom() (*Room, string, error) {
	code, err := generateRoomCode()
	if err != nil {
		return nil, "", err
	}

	room := &Room{
		Code:      code,
		Players:   make(map[string]*Player),
		State:     "waiting",
		CreatedAt: time.Now(),
	}

	roomsMu.Lock()
	rooms[code] = room
	roomsMu.Unlock()

	return room, code, nil
}

func joinRoom(code, username string, conn *websocket.Conn) (*Room, error) {
	roomsMu.RLock()
	room, exists := rooms[code]
	roomsMu.RUnlock()

	if !exists {
		return nil, errors.New("room not found")
	}

	room.mu.Lock()
	defer room.mu.Unlock()

	if len(room.Players) >= 4 {
		return nil, errors.New("room is full")
	}

	if _, taken := room.Players[username]; taken {
		return nil, errors.New("username already taken")
	}

	room.Players[username] = &Player{
		Username: username,
		Conn:     conn,
		Ready:    false,
	}

	return room, nil
}

func leaveRoom(room *Room, username string) {
	room.mu.Lock()
	delete(room.Players, username)
	playerCount := len(room.Players)

	if room.State == "countdown" {
		room.State = "waiting"
		room.Countdown = 0
	}
	room.mu.Unlock()

	broadcastToRoom(room, username, Message{
		Type:     "playerLeft",
		Username: username,
	}, true)

	if playerCount == 0 {
		go expireRoom(room.Code)
	}
}

func expireRoom(code string) {
	time.Sleep(90 * time.Second)

	roomsMu.Lock()
	room, exists := rooms[code]
	if exists && len(room.Players) == 0 {
		delete(rooms, code)
		log.Printf("Room %s expired", code)
	}
	roomsMu.Unlock()
}

func getRoom(code string) (*Room, bool) {
	roomsMu.RLock()
	room, exists := rooms[code]
	roomsMu.RUnlock()

	return room, exists
}

func allPlayersReady(room *Room) bool {
	for _, player := range room.Players {
		if !player.Ready {
			return false
		}
	}
	return true
}

func getPlayerList(room *Room) []string {
	players := make([]string, 0, len(room.Players))
	for username := range room.Players {
		players = append(players, username)
	}
	return players
}

func broadcastToRoom(room *Room, excludeUsername string, msg Message, excludeSender bool) {
	room.mu.Lock()
	defer room.mu.Unlock()

	for username, player := range room.Players {
		if excludeSender && username == excludeUsername {
			continue
		}

		if err := player.Conn.WriteJSON(msg); err != nil {
			log.Printf("Failed to send to %s: %v", username, err)
			delete(room.Players, username)
		}
	}
}

func handleWebSocket(w http.ResponseWriter, r *http.Request, texts []string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	roomCode := r.URL.Query().Get("room")
	username := r.URL.Query().Get("username")

	var room *Room
	var actualUsername string

	if roomCode == "" {
		if username == "" {
			username = "Player"
		}
		actualUsername = username + "-" + randomSuffix()

		room, roomCode, err = createRoom()
		if err != nil {
			log.Println("Failed to create room:", err)
			return
		}

		room.mu.Lock()
		room.Players[actualUsername] = &Player{
			Username: actualUsername,
			Conn:     conn,
			Ready:    false,
		}
		room.mu.Unlock()

		conn.WriteJSON(Message{
			Type:     "roomCreated",
			RoomCode: roomCode,
		})
		log.Printf("Room %s created by %s", roomCode, actualUsername)
	} else {
		if username == "" {
			username = "Player"
		}
		actualUsername = username + "-" + randomSuffix()

		room, err = joinRoom(roomCode, actualUsername, conn)
		if err != nil {
			log.Printf("Failed to join room %s: %v", roomCode, err)
			conn.WriteJSON(Message{
				Type: "error",
				Text: err.Error(),
			})
			return
		}

		broadcastToRoom(room, actualUsername, Message{
			Type:     "playerJoined",
			Username: actualUsername,
		}, true)

		conn.WriteJSON(Message{
			Type:     "roomJoined",
			RoomCode: roomCode,
			Players:  getPlayerList(room),
		})
		log.Printf("%s joined room %s", actualUsername, roomCode)
	}

	for {
		var msg Message
		if err := conn.ReadJSON(&msg); err != nil {
			log.Printf("WebSocket error for %s: %v", actualUsername, err)
			handleDisconnect(room, actualUsername)
			break
		}

		handleMessage(room, actualUsername, msg, texts)
	}
}

func randomSuffix() string {
	b := make([]rune, 4)
	for i := range b {
		b[i] = validChars[rand.Intn(len(validChars))]
	}
	return string(b)
}

func handleMessage(room *Room, username string, msg Message, texts []string) {
	switch msg.Type {
	case "ready":
		handleReady(room, username, texts)
	case "notReady":
		handleNotReady(room, username)
	case "typing":
		handleTyping(room, username, msg.Progress, msg.Errors)
	case "finish":
		handleFinish(room, username, msg.Progress, msg.Errors)
	}
}

func handleReady(room *Room, username string, texts []string) {
	room.mu.Lock()
	player := room.Players[username]
	player.Ready = true
	playerCount := len(room.Players)
	allReady := allPlayersReady(room)
	room.mu.Unlock()

	broadcastToRoom(room, username, Message{
		Type:     "playerReady",
		Username: username,
	}, false)

	if playerCount >= 2 && allReady {
		room.mu.Lock()
		if room.State == "waiting" {
			room.State = "countdown"
			room.Countdown = 3
		}
		room.mu.Unlock()

		broadcastToRoom(room, "", Message{
			Type:  "allReady",
			Count: 3,
		}, false)

		go startCountdown(room, texts)
	}
}

func handleNotReady(room *Room, username string) {
	room.mu.Lock()
	player := room.Players[username]
	player.Ready = false
	room.mu.Unlock()

	broadcastToRoom(room, username, Message{
		Type:     "playerNotReady",
		Username: username,
	}, false)
}

func startCountdown(room *Room, texts []string) {
	for {
		time.Sleep(1 * time.Second)

		room.mu.Lock()
		if !allPlayersReady(room) {
			room.State = "waiting"
			room.Countdown = 0
			room.mu.Unlock()
			broadcastToRoom(room, "", Message{
				Type: "countdownCancelled",
			}, false)
			return
		}

		room.Countdown--
		count := room.Countdown
		room.mu.Unlock()

		if count <= 0 {
			startRace(room, texts)
			return
		}

		broadcastToRoom(room, "", Message{
			Type:  "countdown",
			Count: count,
		}, false)
	}
}

func startRace(room *Room, texts []string) {
	room.mu.Lock()
	room.State = "racing"
	room.Text = texts[rand.Intn(len(texts))]
	players := room.Players

	for _, player := range players {
		player.Progress = 0
		player.Errors = 0
		player.Finished = false
		player.FinishTime = time.Time{}
	}

	text := room.Text
	room.mu.Unlock()

	broadcastToRoom(room, "", Message{
		Type:      "gameStart",
		Text:      text,
		TimeLimit: 60,
	}, false)
}

func handleTyping(room *Room, username string, progress, errors int) {
	room.mu.Lock()
	player := room.Players[username]
	player.Progress = progress
	player.Errors = errors
	room.mu.Unlock()

	broadcastToRoom(room, username, Message{
		Type:     "opponentProgress",
		Username: username,
		Progress: progress,
	}, true)
}

func handleFinish(room *Room, username string, progress, errors int) {
	room.mu.Lock()
	player := room.Players[username]
	player.Finished = true
	player.FinishTime = time.Now()
	player.Progress = progress
	player.Errors = errors

	elapsed := time.Since(room.CreatedAt).Seconds()
	if elapsed < 1 {
		elapsed = 1
	}

	characters := float64(progress)
	minutes := elapsed / 60.0
	wpm := (characters / 5.0) / minutes

	totalTyped := progress + errors
	var accuracy float64 = 100.0
	if totalTyped > 0 {
		accuracy = math.Round((float64(progress)/float64(totalTyped))*10000) / 100
	}

	placement := calculatePlacement(room, username)
	playerConn := player.Conn
	room.mu.Unlock()

	playerConn.WriteJSON(Message{
		Type:     "gameEnd",
		WPM:      math.Round(wpm*100) / 100,
		Accuracy: accuracy,
		Count:    placement,
	})
}

func calculatePlacement(room *Room, username string) int {
	room.mu.Lock()
	defer room.mu.Unlock()

	players := make([]string, 0, len(room.Players))
	for name := range room.Players {
		if name != username {
			players = append(players, name)
		}
	}

	placement := 1
	for _, name := range players {
		p := room.Players[name]
		if p.Finished && p.FinishTime.Before(room.Players[username].FinishTime) {
			placement++
		}
	}

	return placement
}

func handleDisconnect(room *Room, username string) {
	room.mu.Lock()
	delete(room.Players, username)
	playerCount := len(room.Players)

	if room.State == "countdown" {
		room.State = "waiting"
		room.Countdown = 0
	}
	room.mu.Unlock()

	if playerCount > 0 {
		broadcastToRoom(room, username, Message{
			Type:     "playerLeft",
			Username: username,
		}, true)
	}

	if playerCount == 0 {
		go expireRoom(room.Code)
	}
}
