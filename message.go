package main

import (
	"github.com/asticode/go-astilectron"
	"log"
)

type Message struct {
	Type         string
	ID           string
	Name         string
	PreviewImage string
}

func NewMessage(name, path string) {
	Window.SendMessage(Message{"message", "42", name, ImageToBase64(path)}, func(m *astilectron.EventMessage) {
		//Window.SendMessage("test_stuff/never_gonna_give_you_up.jpg", func(m *astilectron.EventMessage) {
		// Unmarshal
		var s string
		m.Unmarshal(&s)

		// Process message
		log.Printf("received %s\n", s)

		OpenWindow()
	})
}
