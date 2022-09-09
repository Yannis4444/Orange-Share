package main

import (
	"encoding/json"
	"fmt"
	"net"
	"strings"
)

type InstanceAnnouncement struct {
	ResponseRequest bool
	Instance        InstanceInfo
}

type Connection struct {
	Instance InstanceInfo
	Host     string
}

var Connections map[string]Connection = make(map[string]Connection)

type ConnectionMessage struct {
	Type       string
	Connection Connection
}

var PC net.PacketConn

func SendConnectionToUI(connection Connection) {
	Window.SendMessage(ConnectionMessage{
		"connection",
		connection,
	})
}

func InitConnectionUDP() {
	var err error
	PC, err = net.ListenPacket("udp4", ":7615")
	if err != nil {
		L.Fatal(fmt.Errorf("listening to udp4 failed: %w", err))
	}
}

func sendAnnouncement(address string, responseRequest bool) {
	addr, err := net.ResolveUDPAddr("udp4", address)
	if err != nil {
		L.Fatal(fmt.Errorf("resolving udp address failed: %w", err))
		return
	}

	//_, err = PC.WriteTo([]byte(Hostname), addr)
	j, _ := json.Marshal(InstanceAnnouncement{
		responseRequest,
		OwnInstanceInfo,
	})
	_, err = PC.WriteTo(j, addr)
	if err != nil {
		L.Fatal(fmt.Errorf("transmitting data failed: %w", err))
		return
	}
}

// Announce this connection to others
func Announce() {
	// TODO: get the address somehow
	sendAnnouncement("192.168.178.255:7615", true)
}

// Sends an udp broadcast to all broadcast addresses
// Announce needs to be called first
// TODO: change to multicast
func ListenForInstances() {
	for true {
		buf := make([]byte, 1024)
		n, addr, err := PC.ReadFrom(buf)
		if err != nil {
			// TODO: not fatal
			L.Fatal(fmt.Errorf("receiving udp packet failed: %w", err))
			continue
		}

		if addr.Network() != "udp" {
			continue
		}

		var instance InstanceAnnouncement
		if err := json.Unmarshal(buf[:n], &instance); err != nil {
			continue
		}

		// TODO: move back into if
		connection, ok := Connections[instance.Instance.ID]

		if !ok {
			connection = Connection{}
			connection.Host = strings.Split(addr.String(), ":")[0]
			connection.Instance = instance.Instance
			Connections[instance.Instance.ID] = connection
		}

		SendConnectionToUI(connection)
		if instance.Instance.ID != OwnInstanceInfo.ID {

			if instance.ResponseRequest {
				sendAnnouncement(addr.String(), false)
			}
		}
	}
}
