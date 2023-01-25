package main

import (
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"net/http"
)

func toBase64(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}

func ImageToBase64(path string) string {
	// Read the entire file into a byte slice
	bytes, err := ioutil.ReadFile(path)
	if err != nil {
		L.Println(fmt.Errorf("Failed to read file: %w", err))
		return ""
	}

	var base64Encoding string

	mimeType := http.DetectContentType(bytes)

	switch mimeType {
	case "image/jpeg":
		base64Encoding += "data:image/jpeg;base64,"
		break
	case "image/png":
		base64Encoding += "data:image/png;base64,"
		break
	default:
		return ""
	}

	// Append the base64 encoded output
	base64Encoding += toBase64(bytes)

	// Print the full base64 representation of the image
	return base64Encoding
}
