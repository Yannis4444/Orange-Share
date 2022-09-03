package main

import (
	"fmt"
	"github.com/asticode/go-astikit"
	"github.com/asticode/go-astilectron"
	"log"
)

const devTools = false

var L *log.Logger

var Astilectron *astilectron.Astilectron
var Window *astilectron.Window

func onBlur(astilectron.Event) bool {
	if err := Window.Hide(); err != nil {
		L.Fatal(fmt.Errorf("hiding window failed: %w", err))
	}

	return false
}

func onTrayClick(event astilectron.Event) bool {
	// TODO: move window here
	// TODO: hide when already shown
	if !Window.IsShown() {
		if err := Window.Show(); err != nil {
			L.Fatal(fmt.Errorf("showing window failed: %w", err))
		}
	}

	moveWindowToCorner(*event.Bounds.X+(*event.Bounds.Width/2), *event.Bounds.Y+(*event.Bounds.Height/2))

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
		windowX = primaryDisplay.WorkArea().X + primaryDisplay.WorkArea().Width - windowBounds.Width - 0
	}

	windowY := 0
	if y > primaryDisplay.Bounds().Height/2 {
		// bottom
		windowY = primaryDisplay.WorkArea().Y + primaryDisplay.WorkArea().Height - windowBounds.Height - 0
	}

	if err = Window.MoveInDisplay(primaryDisplay, windowX, windowY); err != nil {
		L.Fatal(fmt.Errorf("moving window failed: %w", err))
	}
}

func main() {
	// Set logger
	L = log.New(log.Writer(), log.Prefix(), log.Flags())

	// Create astilectron
	var err error
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
		Center:      astikit.BoolPtr(true),
		Height:      astikit.IntPtr(700),
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

	// Blocking pattern
	Astilectron.Wait()
}
