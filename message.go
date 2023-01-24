package main

import (
	"encoding/json"
	"fmt"
	"github.com/asticode/go-astilectron"
	"net/http"
	"time"
)

type TextMessage struct {
	Text string
}

// UIdMessage the message as sent to the frontend
type UITextMessage struct {
	UICommand string
	Timestamp int64
	Text      string
}

func ReceiveText(w http.ResponseWriter, r *http.Request) {
	var message TextMessage
	err := json.NewDecoder(r.Body).Decode(&message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Println(message)
	// TODO: also show origin

	Window.SendMessage(
		UITextMessage{
			"textMessage",
			time.Now().UnixMilli(),
			message.Text,
		}, func(m *astilectron.EventMessage) {
			OpenWindow()
		},
	)
}

func SendText(host, text string) []byte {
	m := TextMessage{
		Text: text,
	}

	data, err := json.Marshal(m)
	if err != nil {
		L.Fatal("Failed to marshal message")
	}

	return HTTPSPostJson(("https://" + host + ":7616/data/text"), data)
}
