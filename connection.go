package main

type Connection struct {
	Type       string
	ID         string
	Name       string
	Host       string
	DeviceType string
}

func NewConnection(name, host, deviceType string) {
	Window.SendMessage(Connection{"connection", "42", name, host, deviceType})
}
