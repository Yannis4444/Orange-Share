package message

import (
	"encoding/json"
	"fmt"
	"net/http"
)

var TempPath string

type Message struct {
	Type string
	Data string
}

// UIdMessage the message as sent to the frontend
type UIdMessage struct {
	Type         string
	ID           string
	Name         string
	Timestamp    int64
	PreviewImage string
}

// NewMessage Sends the message to the UI
func NewMessage(name, path, id string) {
	//Window.SendMessage(UIdMessage{"message", id, name, time.Now().UnixMilli(), ImageToBase64(path)}, func(m *astilectron.EventMessage) {
	//	//// Unmarshal
	//	//var s string
	//	//m.Unmarshal(&s)
	//	//
	//	//// Process message
	//	//log.Printf("received %s\n", s)
	//
	//	OpenWindow()
	//})
}

func ReceiveText(w http.ResponseWriter, r *http.Request) {
	var message Message
	err := json.NewDecoder(r.Body).Decode(&message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Println(message)

	// TODO: NewMessage(header.Filename, path, uuid.NewV4().String())
}

func SendMessage(message Message) {

}
