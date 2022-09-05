package main

import (
	"github.com/asticode/go-astilectron"
	"time"
)

type Message struct {
	Type         string
	ID           string
	Name         string
	Timestamp    int64
	PreviewImage string
}

func NewMessage(name, path string) {
	Window.SendMessage(Message{"message", "42", name, time.Now().UnixMilli(), ImageToBase64(path)}, func(m *astilectron.EventMessage) {
		//// Unmarshal
		//var s string
		//m.Unmarshal(&s)
		//
		//// Process message
		//log.Printf("received %s\n", s)

		OpenWindow()
	})
}
