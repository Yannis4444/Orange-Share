package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/asticode/go-astilectron"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"time"
)

type TextMessage struct {
	Text string
}

// UITextMessage the message as sent to the frontend
type UITextMessage struct {
	UICommand string
	Timestamp int64
	Text      string
}

// UIFilesMessage the message as sent to the frontend
type UIFilesMessage struct {
	UICommand    string
	Timestamp    int64
	Filename     string
	PreviewImage string
}

func ReceiveText(w http.ResponseWriter, r *http.Request) {
	var message TextMessage
	err := json.NewDecoder(r.Body).Decode(&message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Println(message)
	// TODO: also show origin

	Window.SendMessage(
		UITextMessage{
			"textMessage",
			time.Now().UnixMilli(),
			message.Text,
		}, func(m *astilectron.EventMessage) {
			OpenWindow()
		},
	)
}

func ReceiveFiles(w http.ResponseWriter, r *http.Request) {
	// TODO: multiple with same name
	// TODO: give it an ID so that the frontend can tell the backend which files to handle
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		L.Println(fmt.Errorf("failed to receive file: ", err))
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		L.Println(fmt.Errorf("failed to receive file: ", err))
	}
	defer file.Close()

	path := TempPath + "/" + header.Filename

	fmt.Printf(path)

	// copy example
	// TODO: sensible permissions
	f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, 0666)
	defer f.Close()
	io.Copy(f, file)

	Window.SendMessage(
		UIFilesMessage{
			"filesMessage",
			time.Now().UnixMilli(),
			header.Filename,
			ImageToBase64(path),
		}, func(m *astilectron.EventMessage) {
			OpenWindow()
		})
}

func SendText(host, text string) {
	m := TextMessage{
		Text: text,
	}

	data, err := json.Marshal(m)
	if err != nil {
		L.Fatal("Failed to marshal message")
	}

	// TODO: handle status and body
	HTTPSPostJson(("https://" + host + ":7616/data/text"), data)
}

func SendFiles(host, fileListStr string) {
	bodyBuf := &bytes.Buffer{}
	bodyWriter := multipart.NewWriter(bodyBuf)

	var filenames []string
	err := json.Unmarshal([]byte(fileListStr), &filenames)
	if err != nil {
		L.Println(fmt.Errorf("error unmarshaling filelist"))
		return
	}

	// TODO: not just send first file
	filenameSplit := strings.Split(filenames[0], "/")

	fileWriter, err := bodyWriter.CreateFormFile("file", filenameSplit[len(filenameSplit)-1])
	if err != nil {
		L.Println(fmt.Errorf("error writing to buffer: %w", err))
		// TODO: let frontend know about failure (not just here)
		return
	}

	// open file handle
	fh, err := os.Open(filenameSplit[len(filenameSplit)-1])
	if err != nil {
		L.Println(fmt.Errorf("error opening file: %w", err))
		return
	}
	defer fh.Close()

	//iocopy
	_, err = io.Copy(fileWriter, fh)
	if err != nil {
		L.Println(fmt.Errorf("error copying file: %w", err))
		return
	}

	contentType := bodyWriter.FormDataContentType()
	bodyWriter.Close()

	status, body := HTTPSPost("https://"+host+":7616/data/files", contentType, bodyBuf)

	fmt.Println(status)
	fmt.Println(string(body))
}
