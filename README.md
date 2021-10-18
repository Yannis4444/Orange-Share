# Orange Share
A small python server that accepts requests from an Apple shortcut to allow sharing all sorts of media from iOS with any desktop OS.
It allows sending content right from the share sheet - similar to AirDrop between Apple Devices

## How it works
Orange Share consists of a webserver that should be able to run on any Unix or Windows Computer and a few Shortcuts
that allow the user to open, save and copy content from an iPhone or iPad to a computer.

The shortcuts will show up in the share sheet of files, links etc. and allow you to share whatever the content is with
the computer it is set up with.

By default, you can access the UI with settings for Orange Share on [localhost:7616](http://localhost:7616).
Here you can also find the shortcuts and establish connections to the devices.
The UI is only accessible from the host.

The API which is used by the mobile devices is opened on port 7615 by default.
It is accessible from devices in the network and secured with Basic Auth.
This means that only connected devices are able to send data to the computer.
Note that due to the http protocol, connection data will be sent over unencrypted connections.
Orange Share never sends out any data from the computer without a confirmation on the computer,
even if the correct credentials are known.
Everything that is sent to the computer is either copied to the clipboard, saved to a temporary directory or will require user input.

## Shortcuts

Orange Share uses several [shortcuts](https://support.apple.com/guide/shortcuts/welcome/ios) for different parts of its functionality.
These shortcuts have to be installed on the device from which content shall be shared.

The shortcuts can be found in the UI of the application or below.

#### Untrusted Shortcuts

To import the needed shortcuts, you will have to enable `Allow Untrusted Shortcuts` in your devices settings.
This option can be found in `Settings > Shortcuts`.

If you have never before used Shortcuts, chances are, that `Allow Untrusted Shortcuts` is grayed out.
If this is the case, you have to run a shortcut first.
To do this, open the Shortcuts App and choose any of the available shortcuts or create one yourself.
Once you ran a shortcut, the option to enable untrusted shortcuts should become available.

#### How to use the Shortcuts

Once the shortcuts are installed, they are shown in the Shortcuts App.
Here you can start or edit them.
Apart from the Connection Manager, starting the shortcuts from the app won't do anything as they need some input to share.

You can find all shortcuts other than the Connection manager in the share sheets of the device.
This means that whenever you click `share` on the device you can find these shortcuts in the list.
At the bottom of this list you can find an option to edit the shown entries.
Here you can add the Orange Share shortcuts to your favorites if you want them to always be at the top.

### Connection Manager

This shortcut is always needed to manage the connections to the host computer running Orange Share.
It is the only shortcut that needs to be run directly from the Shortcuts App or added to the home screen and run from there.

The device is able to save multiple connections while only one can be active at a time.
In order to do so, some files will be created on your iCloud (`/Shortcuts/orangeshare/`).

[Download](https://www.icloud.com/shortcuts/871ca1ca24d84d00bd2ac9c02df55962)

### Open

The open shortcut will open content in its respective application on the computer.

For URLs, it will open the website in the default browser, any other files will be opened in their default applications.
To make this work, files are saved in a temporary folder.

[Download](https://www.icloud.com/shortcuts/970a193be8cc453fa51fb68a9104c4b5)

### Save

The save shortcut will open a save-file-dialog on the computer with which shared content can be saved anywhere on the computer.

[Download](https://www.icloud.com/shortcuts/e4f3008d12334f26858851066172e40c)

### Clipboard

The clipboard shortcut will copy any text to the clipboard of the computer.
Once copied, it can be pasted anywhere.

Copying files will come soon.

[Download](https://www.icloud.com/shortcuts/46539bc5d8f64faab67289044b205342)

### Get Data

This shortcut can be used to get data from the computer.
It will open a window on the computer where either a file or the current clipboard content can be sent to the phone.

[Download](https://www.icloud.com/shortcuts/f1e9e2f318f447508ab956884936c614)

## Installation

### Using PIP

Orange Share can be installed by running `pip install orangeshare`.

After that, it can be run using the command `python -m orangeshare` or just `orangeshare`.

### Windows

You can find some working `.exe` files of Orange Share in the [releases](https://github.com/Yannis4444/Orange-Share/releases).

There are multiple options
- `orangeshare.exe` will start Orange Share in a new console window
- `orangeshare-noconsole.exe` will start Orange Share without any further output
- `orangeshare-tray-icon.exe` will create a tray icon from which Orange Share can be started and stopped.

Instructions for Windows autostart can be found [here](https://github.com/Yannis4444/Orange-Share#windows-1)

You can also create your own executables using [`pyinstaller`](https://github.com/pyinstaller/pyinstaller) as shown in `create_exe.bat`.

### Gnome Shell Extension

[comment]: <> (#### Gnome Extension)

[comment]: <> (The Gnome Extension is available [here]&#40;https://extensions.gnome.org/extension/4469/orange-share/&#41;.)

#### Manual

Installing Orange Share as a gnome shell extension can be done by copying the `gnome-shell-extension` directory
into your local gnome-shell extensions directory (usually `~/.local/share/gnome-shell/extensions/`):

```
$ git clone https://github.com/Yannis4444/Orange-Share.git
$ cp -r Orange-Share/gnome-shell-extension/ ~/.local/share/gnome-shell/extensions/orange-share@Yannis4444.github.com
```

Once cloned, you may need to restart the shell (Alt+F2 and insert 'r' in the prompt or logging out for Wayland)
for the extension to be listed in the extension settings.

#### How it works

When first enabling Orange Share by clicking the icon in the top bar, you will be prompted to install the python package.

Once everything is running, you can enable and disable Orange Share by clicking on the icon.
Double-clicking the icon will open the settings in your browser.

## Run Options

Argument | Description
---------|------------
-h, --help | print a help message
--version | print the current version
-p \<port\>, --api-port \<port\> | Port number of the api server (default: 7615)
-u \<port\>, --ui-port \<port\> | Port number of the UI server (default: 7616)
-o, --open-ui | Open the server controls in the browser on start
-t, --tray-icon | Run with tray icon (only available on windows, see [Gnome Shell Extension](#gnome-shell-extension) for Linux with Gnome)
-v, --verbose | enable Verbose output


## Autostart
### Linux

To run Orange Share at system startup you can copy the `orange-share.desktop` to the `~/.config/autostart` directory.

## Windows

You can add one of the `.exe` files from the [releases](https://github.com/Yannis4444/Orange-Share/releases) to your Windows startup folder (press `Win + R`, type `shell:startup`, select `OK`).

In most cases, the `orangeshare-tray-icon.exe` will be the best option for this.
Once added, this will show an icon in the system tray (lower right corner).
There you can start and stop Orange Share by right-clicking.

## Configuration

A configuration file can be found in the user's config directory.
On Linux for example this would be `~/.config/orangeshare/config.ini`.