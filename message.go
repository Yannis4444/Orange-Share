package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/asticode/go-astilectron"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"time"
)

type Message struct {
	Type         string
	ID           string
	Name         string
	Timestamp    int64
	PreviewImage string
}

func NewMessage(name, path string) {
	Window.SendMessage(Message{"message", "42", name, time.Now().UnixMilli(), ImageToBase64(path)}, func(m *astilectron.EventMessage) {
		//// Unmarshal
		//var s string
		//m.Unmarshal(&s)
		//
		//// Process message
		//log.Printf("received %s\n", s)

		OpenWindow()
	})
}

func ReceiveFile(w http.ResponseWriter, r *http.Request) {
	// TODO: multiple with same name
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fmt.Println("failed to receive file: ", err)
		return
	} // limit your max input length!

	// in your case file would be fileupload
	file, header, err := r.FormFile("file")
	if err != nil {
		fmt.Println("failed to receive file: ", err)
		return
	}
	defer file.Close()

	path := TempPath + "/" + header.Filename

	// copy example
	f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, 0666)
	defer f.Close()
	io.Copy(f, file)

	NewMessage(header.Filename, path)
}

func SendFile(filename string, targetUrl string) error {
	bodyBuf := &bytes.Buffer{}
	bodyWriter := multipart.NewWriter(bodyBuf)

	// this step is very important
	fileWriter, err := bodyWriter.CreateFormFile("file", filename)
	if err != nil {
		fmt.Println("error writing to buffer")
		return err
	}

	// open file handle
	fh, err := os.Open(filename)
	if err != nil {
		fmt.Println("error opening file")
		return err
	}
	defer fh.Close()

	//iocopy
	_, err = io.Copy(fileWriter, fh)
	if err != nil {
		return err
	}

	contentType := bodyWriter.FormDataContentType()
	bodyWriter.Close()

	resp, err := http.Post(targetUrl, contentType, bodyBuf)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	resp_body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	fmt.Println(resp.Status)
	fmt.Println(string(resp_body))
	return nil
}

type frontendSendFile struct {
	Path string
	Host string
}

func SendFileFromFrontend(command string) interface{} {
	fmt.Println(command)

	var message frontendSendFile
	json.Unmarshal([]byte(command), &message)

	fmt.Println(message.Path)
	fmt.Println(message.Host)

	SendFile(message.Path, "http://"+message.Host+":8000/file")

	return nil
}
