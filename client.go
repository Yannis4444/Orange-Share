package main

import (
	"OrangeShare/message"
	"bytes"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

var client http.Client

func InitHttpsClient() {
	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(CA)

	client = http.Client{
		Timeout: time.Minute * 3,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true, // TODO: This should be used only for testing or in combination with VerifyConnection or VerifyPeerCertificate
				RootCAs:            caCertPool,
				Certificates:       []tls.Certificate{CERT},
			},
		},
	}
}

func HTTPSGet(url string) []byte {
	r, err := client.Get(url)
	if err != nil {
		log.Fatalf("error making get request: %v", err)
	}

	defer r.Body.Close()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Fatalf("error reading response: %v", err)
	}

	fmt.Printf("HTTPS GET Response: %s\n", body)

	return body
}

func HTTPSPostJson(url string, body []byte) []byte {
	r, err := client.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		log.Fatalf("error making post request: %v", err)
	}

	defer r.Body.Close()
	rBody, err := io.ReadAll(r.Body)
	if err != nil {
		log.Fatalf("error reading response: %v", err)
	}

	fmt.Printf("HTTPS POST Response: %s\n", rBody)

	return rBody
}

func HTTPSSendMessage(connection Connection, message message.Message) []byte {
	data, err := json.Marshal(message)
	if err != nil {
		L.Fatal("Failed to marshal message")
	}
	return HTTPSPostJson(("https://" + connection.Host + ":7616/message"), data)
}
