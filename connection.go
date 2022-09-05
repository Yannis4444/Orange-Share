package main

import (
	"fmt"
	"net"
)

type Connection struct {
	Type       string
	ID         string
	Name       string
	Host       string
	DeviceType string
}

var PC net.PacketConn

func NewConnection(name, host, deviceType string) {
	Window.SendMessage(Connection{"connection", "42", name, host, deviceType})
}

func InitConnectionUDP() {
	var err error
	PC, err = net.ListenPacket("udp4", ":7615")
	if err != nil {
		L.Fatal(fmt.Errorf("listening to udp4 failed: %w", err))
	}
}

func sendAnnouncement(address string) {
	addr, err := net.ResolveUDPAddr("udp4", address)
	if err != nil {
		L.Fatal(fmt.Errorf("resolving udp address failed: %w", err))
		return
	}

	_, err = PC.WriteTo([]byte(Hostname), addr)
	if err != nil {
		L.Fatal(fmt.Errorf("transmitting data failed: %w", err))
		return
	}
}

// Announce this connection to others
func Announce() {
	// TODO: get the address somehow
	sendAnnouncement("192.168.178.255:7615")
}

// Sends an udp broadcast to all broadcast addresses
// Announce needs to be called first
// TODO: change to multicast
func ListenForInstances() {
	for true {
		buf := make([]byte, 1024)
		n, addr, err := PC.ReadFrom(buf)
		if err != nil {
			L.Fatal(fmt.Errorf("receiving udp packet failed: %w", err))
			return
		}

		fmt.Printf("%s sent this: %s\n", addr, buf[:n])

		NewConnection(string(buf[:n]), addr.String(), "linux/amd64")

		// TODO: use ID for check
		// TODO: set response flag to not run into loop
		if string(buf[:n]) != Hostname {
			sendAnnouncement(addr.String())
		}
	}
}
