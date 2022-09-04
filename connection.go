package main

type Connection struct {
	Type       string
	ID         string
	Name       string
	DeviceType string
}

func NewConnection(name, deviceType string) {
	Window.SendMessage(Connection{"connection", "42", name, deviceType})
}
