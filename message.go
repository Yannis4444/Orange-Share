package main

import (
	"github.com/asticode/go-astilectron"
	"log"
)

func NewMessage(path string) {
	// This will send a message and execute a callback
	// Callbacks are optional
	Window.SendMessage(ImageToBase64(path), func(m *astilectron.EventMessage) {
		//Window.SendMessage("test_stuff/never_gonna_give_you_up.jpg", func(m *astilectron.EventMessage) {
		// Unmarshal
		var s string
		m.Unmarshal(&s)

		// Process message
		log.Printf("received %s\n", s)
	})
}
