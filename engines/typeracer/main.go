package main

import (
	"encoding/json"
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

type GameState struct {
	Text          string
	StartTime     time.Time
	CurrentIndex  int
	Errors        int
	TotalTyped    int
	CorrectTyped  int
	IsActive      bool
	mu            sync.Mutex
}

type Message struct {
	Type      string `json:"type"`
	Progress  int    `json:"progress,omitempty"`
	Errors    int    `json:"errors,omitempty"`
	Text      string `json:"text,omitempty"`
	TimeLimit int    `json:"timeLimit,omitempty"`
	WPM       float64 `json:"wpm,omitempty"`
	Accuracy  float64 `json:"accuracy,omitempty"`
}

type SampleTexts struct {
	Texts []string `json:"texts"`
}

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

func handleWebSocket(w http.ResponseWriter, r *http.Request, texts []string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	game := &GameState{}
	text := texts[rand.Intn(len(texts))]

	game.Text = text
	game.StartTime = time.Now()
	game.IsActive = true

	msg := Message{
		Type:      "gameStart",
		Text:      text,
		TimeLimit: 60,
	}
	if err := conn.WriteJSON(msg); err != nil {
		log.Println("Write error:", err)
		return
	}

	for {
		var msg Message
		if err := conn.ReadJSON(&msg); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		switch msg.Type {
		case "typing":
			processTyping(conn, game, msg.Progress, msg.Errors)
		case "finish":
			sendResults(conn, game)
			return
		}
	}
}

func processTyping(conn *websocket.Conn, game *GameState, progress int, errors int) {
	game.mu.Lock()
	game.CurrentIndex = progress
	game.Errors = errors
	game.TotalTyped = progress + errors
	game.CorrectTyped = progress
	game.mu.Unlock()
}

func sendResults(conn *websocket.Conn, game *GameState) {
	game.mu.Lock()
	defer game.mu.Unlock()

	elapsed := time.Since(game.StartTime).Seconds()
	if elapsed < 1 {
		elapsed = 1
	}

	characters := float64(game.CorrectTyped)
	minutes := elapsed / 60.0
	wpm := (characters / 5.0) / minutes

	var accuracy float64 = 100.0
	if game.TotalTyped > 0 {
		accuracy = math.Round((float64(game.CorrectTyped) / float64(game.TotalTyped)) * 10000) / 100
	}

	msg := Message{
		Type:     "gameEnd",
		WPM:      math.Round(wpm*100) / 100,
		Accuracy: accuracy,
	}

	if err := conn.WriteJSON(msg); err != nil {
		log.Println("Write error:", err)
	}
}
