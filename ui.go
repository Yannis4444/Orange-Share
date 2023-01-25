package main

import (
	"encoding/json"
	"fmt"
	"github.com/asticode/go-astikit"
	"github.com/asticode/go-astilectron"
	"log"
	"os/exec"
	"runtime"
)

// TODO: Button for this
const devTools = false

var a *astilectron.Astilectron
var Window *astilectron.Window

var primaryDisplay *astilectron.Display

var AutoCloseWindow = true

type GenericCommandForUI struct {
	UICommand string
	Data      string
}

type GenericCommandFromUI struct {
	UICommand string
	Host      string
	Data      string
}

func SendUICommand(command string) {
	Window.SendMessage(GenericCommandForUI{"cmd", command})
}

func receiveUICommand(m *astilectron.EventMessage) interface{} {
	// Unmarshal
	var s string
	m.Unmarshal(&s)

	L.Println("received command: " + s)

	var command GenericCommandFromUI
	json.Unmarshal([]byte(s), &command)

	switch command.UICommand {
	case "sendText":
		SendText(command.Host, command.Data)
		break
	case "sendFiles":
		SendFiles(command.Host, command.Data)
		break
	case "enableAutoClose":
		AutoCloseWindow = true
		break
	case "disableAutoClose":
		AutoCloseWindow = false
		break
	case "openURL":
		OpenBrowser(command.Data)
		break
	default:
		L.Println("unknown command from UI: " + s)
	}

	return nil
}

func OpenWindow() {
	L.Printf("Opening Window")
	if !Window.IsShown() {
		if err := Window.Show(); err != nil {
			L.Fatal(fmt.Errorf("showing window failed: %w", err))
		}
	}

	moveWindowToCorner()

	_ = Window.Focus()
}

func CloseWindow() {
	L.Printf("Closing Window")
	if err := Window.Hide(); err != nil {
		L.Fatal(fmt.Errorf("hiding window failed: %w", err))
	}

	SendUICommand("home")
}

func onBlur(astilectron.Event) bool {
	fmt.Printf("AutoCloseWindow: %s\n", AutoCloseWindow)
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

func moveWindowToCorner() {
	// moves the window to the corner closest to the given coordinates
	// will assume that the display is the primary display
	// TODO: not always assume primary display

	windowBounds, err := Window.Bounds()
	if err != nil {
		L.Fatal(fmt.Errorf("getting window bounds failed: %w", err))
		return
	}

	windowX := 0
	if primaryDisplay.Bounds().X == primaryDisplay.WorkArea().X {
		// right side
		windowX = primaryDisplay.WorkArea().Width - windowBounds.Width
	}

	windowY := 0
	if primaryDisplay.Bounds().Y == primaryDisplay.WorkArea().Y {
		// bottom
		windowY = primaryDisplay.WorkArea().Height - windowBounds.Height
	}

	if err = Window.MoveInDisplay(primaryDisplay, windowX, windowY); err != nil {
		L.Fatal(fmt.Errorf("moving window failed: %w", err))
	}
}

func InitUI() {
	// Create astilectron
	Astilectron, err := astilectron.New(L, astilectron.Options{
		AppName:           "Orange Share",
		BaseDirectoryPath: "frontend",
		ElectronSwitches:  []string{"in-process-gpu"},
	})
	if err != nil {
		L.Fatal(fmt.Errorf("creating astilectron failed: %w", err))
	}
	// TODO: defer a.Close()

	// Handle signals
	Astilectron.HandleSignals()

	// Start
	if err = Astilectron.Start(); err != nil {
		L.Fatal(fmt.Errorf("starting astilectron failed: %w", err))
	}

	title := "Orange Share"

	windowWidth := 420
	if devTools {
		windowWidth += 500
	}

	// New window
	if Window, err = Astilectron.NewWindow("frontend/index.html", &astilectron.WindowOptions{
		AlwaysOnTop: astikit.BoolPtr(true),
		Center:      astikit.BoolPtr(false),
		Height:      astikit.IntPtr(666),
		Width:       &windowWidth,
		Frame:       astikit.BoolPtr(false),
		Resizable:   astikit.BoolPtr(false),
		Show:        astikit.BoolPtr(false),
		SkipTaskbar: astikit.BoolPtr(true),
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
	Window.OnMessage(receiveUICommand)

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
		err := Window.OpenDevTools()
		if err != nil {
			L.Fatal(fmt.Errorf("opening dev tools failed: %w", err))
		}
	}

	// somehow only works here on linux
	primaryDisplay = Astilectron.PrimaryDisplay()
}

func ShowNotification(title, body string) {
	// Create the notification
	var n = a.NewNotification(&astilectron.NotificationOptions{
		Body:  body,
		Icon:  "logo/white.png",
		Title: title,
	})

	// Add listeners
	n.On(astilectron.EventNameNotificationEventClicked, func(e astilectron.Event) (deleteListener bool) {
		OpenWindow()
		return
	})

	// Create notification
	n.Create()

	// Show notification
	n.Show()
}

func OpenBrowser(url string) {
	var err error

	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("unsupported platform")
	}
	if err != nil {
		log.Fatal(err)
	}
}
