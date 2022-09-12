package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/asticode/go-astikit"
	"github.com/asticode/go-astilectron"
	"github.com/gorilla/mux"
	"github.com/satori/go.uuid"
	"log"
	"net/http"
	"os"
)

// Button for this
const devTools = false

var L *log.Logger

var Astilectron *astilectron.Astilectron
var Window *astilectron.Window
var ClientID string

type InstanceInfo struct {
	ID         string
	Name       string
	DeviceType string
}

var OwnInstanceInfo InstanceInfo

var TempPath string

type GenericCommand struct {
	Command string
	Data    string
}

func SendCommand(command string) {
	Window.SendMessage(GenericCommand{"cmd", command})
}

func receiveCommand(m *astilectron.EventMessage) interface{} {
	// Unmarshal
	var s string
	m.Unmarshal(&s)

	fmt.Println("received command: " + s)

	var command GenericCommand
	json.Unmarshal([]byte(s), &command)

	switch command.Command {
	case "sendFile":
		SendFileFromFrontend(command.Data)
		break
	case "enableAutoClose":
		AutoCloseWindow = true
		break
	case "disableAutoClose":
		AutoCloseWindow = false
		break
	}

	return nil
}

func OpenWindow() {
	if !Window.IsShown() {
		if err := Window.Show(); err != nil {
			L.Fatal(fmt.Errorf("showing window failed: %w", err))
		}
	}

	// TODO: get the correct corner
	//moveWindowToCorner(*event.Bounds.X+(*event.Bounds.Width/2), *event.Bounds.Y+(*event.Bounds.Height/2))
	moveWindowToCorner(10000, 10000)

	_ = Window.Focus()
}

func CloseWindow() {
	if err := Window.Hide(); err != nil {
		L.Fatal(fmt.Errorf("hiding window failed: %w", err))
	}

	SendCommand("home")
}

var AutoCloseWindow = true

func onBlur(astilectron.Event) bool {
	// TODO: back in
	if AutoCloseWindow {
		CloseWindow()
	}

	return false
}

func onTrayClick(event astilectron.Event) bool {
	// TODO: hide when already shown

	OpenWindow()

	return false
}

func moveWindowToCorner(x int, y int) {
	// moves the window to the corner closest to the given coordinates
	// will assume that the display is the primary display
	// TODO: not always assume primary display

	primaryDisplay := Astilectron.PrimaryDisplay()
	windowBounds, err := Window.Bounds()
	if err != nil {
		L.Fatal(fmt.Errorf("getting window bounds failed: %w", err))
		return
	}

	windowX := 0
	if x > primaryDisplay.Bounds().Width/2 {
		// right side
		windowX = primaryDisplay.WorkArea().X + primaryDisplay.WorkArea().Width - windowBounds.Width
	}

	windowY := 0
	if y > primaryDisplay.Bounds().Height/2 {
		// bottom
		windowY = primaryDisplay.WorkArea().Y + primaryDisplay.WorkArea().Height - windowBounds.Height
	}

	if err = Window.MoveInDisplay(primaryDisplay, windowX, windowY); err != nil {
		L.Fatal(fmt.Errorf("moving window failed: %w", err))
	}
}

func handleRequests() {
	myRouter := mux.NewRouter().StrictSlash(true)
	myRouter.HandleFunc("/file", ReceiveFile).Methods("POST")
	// TODO: other port
	log.Fatal(http.ListenAndServe(":8000", myRouter))
}

var Hostname string

func main() {
	// Set logger
	L = log.New(log.Writer(), log.Prefix(), log.Flags())

	var err error
	Hostname, err = os.Hostname()
	if err != nil {
		L.Fatal(fmt.Errorf("getting hostname failed: %w", err))
		return
	}

	OwnInstanceInfo = InstanceInfo{
		uuid.NewV4().String(),
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

	// Create astilectron
	Astilectron, err = astilectron.New(L, astilectron.Options{
		AppName:           "Test",
		BaseDirectoryPath: "example",
	})
	if err != nil {
		L.Fatal(fmt.Errorf("creating astilectron failed: %w", err))
	}
	defer Astilectron.Close()

	// Handle signals
	Astilectron.HandleSignals()

	// Start
	if err = Astilectron.Start(); err != nil {
		L.Fatal(fmt.Errorf("starting astilectron failed: %w", err))
	}

	t := true
	f := false
	title := "Orange Share"

	windowWidth := 420
	if devTools {
		windowWidth += 500
	}

	// New window
	if Window, err = Astilectron.NewWindow("frontend/index.html", &astilectron.WindowOptions{
		AlwaysOnTop: &t,
		Center:      astikit.BoolPtr(true),
		Height:      astikit.IntPtr(666),
		Width:       astikit.IntPtr(windowWidth),
		Frame:       &f,
		Resizable:   &f,
		Show:        &f,
		SkipTaskbar: &t,
		Title:       &title,
	}); err != nil {
		L.Fatal(fmt.Errorf("new window failed: %w", err))
	}

	// Create windows
	if err = Window.Create(); err != nil {
		L.Fatal(fmt.Errorf("creating window failed: %w", err))
	}

	Window.On("window.event.blur", onBlur)

	// This will listen to messages sent by Javascript
	Window.OnMessage(receiveCommand)

	// Tray Icon
	// TODO: black on light mode
	icon := "logo/white.png"
	tooltip := "Open Orange Share"
	tray := Astilectron.NewTray(&astilectron.TrayOptions{
		Image:   &icon,
		Tooltip: &tooltip,
	})

	if err := tray.Create(); err != nil {
		L.Fatal(fmt.Errorf("creating tray icon failed: %w", err))
	}

	tray.On("tray.event.clicked", onTrayClick)
	tray.On("tray.event.double.clicked", onTrayClick)
	tray.On("tray.event.right.clicked", onTrayClick)

	if devTools {
		Window.OpenDevTools()
	}

	go handleRequests()

	InitConnectionUDP()
	Announce()
	go ListenForInstances()

	Astilectron.Wait()
}
