package main

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"net/http"
)

func printHeader(r *http.Request) {
	L.Print(">>>>>>>>>>>>>>>> Header <<<<<<<<<<<<<<<<")
	// Loop over header names
	for name, values := range r.Header {
		// Loop over all values for the name.
		for _, value := range values {
			L.Printf("%v:%v", name, value)
		}
	}
}

func printConnState(state *tls.ConnectionState) {
	L.Print(">>>>>>>>>>>>>>>> State <<<<<<<<<<<<<<<<")

	L.Printf("Version: %x", state.Version)
	L.Printf("HandshakeComplete: %t", state.HandshakeComplete)
	L.Printf("DidResume: %t", state.DidResume)
	L.Printf("CipherSuite: %x", state.CipherSuite)
	L.Printf("NegotiatedProtocol: %s", state.NegotiatedProtocol)
	L.Printf("NegotiatedProtocolIsMutual: %t", state.NegotiatedProtocolIsMutual)

	L.Print("Certificate chain:")
	for i, cert := range state.PeerCertificates {
		subject := cert.Subject
		issuer := cert.Issuer
		L.Printf(" %d s:/C=%v/ST=%v/L=%v/O=%v/OU=%v/CN=%s", i, subject.Country, subject.Province, subject.Locality, subject.Organization, subject.OrganizationalUnit, subject.CommonName)
		L.Printf("   i:/C=%v/ST=%v/L=%v/O=%v/OU=%v/CN=%s", issuer.Country, issuer.Province, issuer.Locality, issuer.Organization, issuer.OrganizationalUnit, issuer.CommonName)
	}
}

func ReceiveTextHandler(w http.ResponseWriter, r *http.Request) {
	printHeader(r)
	if r.TLS != nil {
		printConnState(r.TLS)
	}
	L.Print(">>>>>>>>>>>>>>>>> End <<<<<<<<<<<<<<<<<<")
	fmt.Println("")

	// TODO: ask if accept

	// Write "Hello, world!" to the response body
	//io.WriteString(w, "Hello, world!\n")

	ReceiveText(w, r)
}

func ReceiveFilesHandler(w http.ResponseWriter, r *http.Request) {
	printHeader(r)
	if r.TLS != nil {
		printConnState(r.TLS)
	}
	L.Print(">>>>>>>>>>>>>>>>> End <<<<<<<<<<<<<<<<<<")
	fmt.Println("")

	// TODO: ask if accept

	// Write "Hello, world!" to the response body
	//io.WriteString(w, "Hello, world!\n")

	ReceiveFiles(w, r)
}

func StartServer(port int) {
	// Set up a /hello resource handler
	handler := http.NewServeMux()
	handler.HandleFunc("/data/text", ReceiveTextHandler)
	handler.HandleFunc("/data/files", ReceiveFilesHandler)

	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(CA)

	// Create the TLS Config with the CA pool and enable Client certificate validation
	tlsConfig := &tls.Config{
		ClientCAs:          caCertPool,
		ClientAuth:         tls.RequireAndVerifyClientCert,
		InsecureSkipVerify: true, // TODO: This should be used only for testing or in combination with VerifyConnection or VerifyPeerCertificate
		MinVersion:         tls.VersionTLS12,
		CurvePreferences:   []tls.CurveID{tls.CurveP521, tls.CurveP384, tls.CurveP256},
		CipherSuites: []uint16{
			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,
			tls.TLS_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_RSA_WITH_AES_256_CBC_SHA,
			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
			tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
		},
	}
	tlsConfig.BuildNameToCertificate()

	// serve on port 7616 of local host
	server := http.Server{
		Addr:      fmt.Sprintf(":%d", port),
		Handler:   handler,
		TLSConfig: tlsConfig,
	}

	fmt.Printf("(HTTPS) Listen on :%d\n", port)
	if err := server.ListenAndServeTLS("./certs/client.crt", "./certs/client.key"); err != nil {
		L.Fatalf("(HTTPS) error listening to port: %v", err)
	}

}
