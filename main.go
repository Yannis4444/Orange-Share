package main

import (
	"OrangeShare/message"
	"bufio"
	"crypto/tls"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"log"
	"os"
	"strings"
)

var TempPath string

var L *log.Logger

var CA []byte
var CERT tls.Certificate

var OwnInstanceInfo InstanceInfo

// LoadCertificates loads the certificate of the Certificate Authority (orangeshare.de) and the own one
func LoadCertificates() ([]byte, tls.Certificate) {
	ca, err := os.ReadFile("./certs/ca.crt")
	if err != nil {
		log.Fatalf("error reading CA certificate: %v", err)
	}

	log.Println("Load key pairs - ", "./certs/client.crt", "./certs/client.key")
	cert, err := tls.LoadX509KeyPair("./certs/client.crt", "./certs/client.key")
	if err != nil {
		log.Fatalf("could not load certificate: %v", err)
	}

	return ca, cert
}

func main() {
	// Set logger
	L = log.New(log.Writer(), log.Prefix(), log.Flags())

	var err error
	Hostname, err := os.Hostname()
	if err != nil {
		L.Fatal(fmt.Errorf("getting hostname failed: %w", err))
		return
	}

	// TODO: permanent identifier
	OwnInstanceInfo = InstanceInfo{
		uuid.New().String(),
		Hostname,
		"linux/amd64",
	}

	// Temp folder
	TempPath = os.TempDir() + "/orangeshare"
	if _, err := os.Stat(TempPath); errors.Is(err, os.ErrNotExist) {
		if err := os.Mkdir(TempPath, os.ModePerm); err != nil {
			L.Fatal(fmt.Errorf("creating temporary directory failed: %w", err))
		}
	}

	// The certificates
	CA, CERT = LoadCertificates()

	message.TempPath = TempPath

	// stuff for announcements
	InitConnectionUDP()
	Announce()
	go ListenForInstances()

	// the client
	InitHttpsClient()

	// actual server
	go StartServer(7616)

	// The UI
	InitUI()

	var reader = bufio.NewReader(os.Stdin)
	for {
		fmt.Printf("Current Connections: %s\n", Connections)
		clientID, _ := reader.ReadString('\n')
		if connection, found := Connections[strings.Replace(clientID, "\n", "", -1)]; found {
			fmt.Println(HTTPSSendMessage(connection, message.Message{"text", "Hello There!"}))
		} else {
			fmt.Println("Unknown Client ID")
		}

	}
}
