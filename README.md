<p align="center">
  <img width="600" src="images/banner.png" alt="Orange Share">
</p>

A small python server that accepts requests from an Apple shortcut to allow sharing all sorts of media from iOS with any desktop OS.
It allows sending content right from the share sheet - similar to AirDrop between Apple Devices

## 📲 Quick Start

A quick start guide can be found [here](https://github.com/Yannis4444/Orange-Share/blob/master/QuickStart.md).

## ℹ How it works
Orange Share consists of a webserver that should be able to run on any computer operating system and a few Shortcuts
that allow the user to open, save and copy content from an iPhone or iPad to a computer as well as request data from the computer.

The shortcuts will show up in the share sheet of files, links etc. and allow you to share whatever the content is with
the computer it is set up with.

<img alt="share_sheet" src="images/share_sheet.png" title="share_sheet" width="400"/>

By default, you can access the UI with settings for Orange Share on [localhost:7616](http://localhost:7616).
Here you can also find the shortcuts and establish connections to the devices.
The UI is only accessible from the host.

The API which is used by the mobile devices is opened on port 7615 by default.
It is accessible from devices in the network and secured with Basic Auth.
This means that only connected devices are able to send data to the computer.
Note that due to the http protocol, connection data will be sent over unencrypted connections.
Orange Share never sends out any data from the computer without a confirmation on the computer,
even if the correct credentials are set.

## ⬆️ Updating

Once a new version of Orange Share is available, you will be notified.
You can of cause ignore this if you wish to - I will not force you to update.

The Windows and GNOME Shell Extension versions can be updated right from the user interface.
Instructions on how to do so will be shown there as well.

The pip version can be updated just like any pip package by running `pip install --upgrade orangeshare`.

### New Shortcuts

Some versions will come with new shortcuts.
These will also be marked on the update page. 
Often the old shortcuts will still work, but it is advised that you download the new ones once available.
When there are newer shortcuts available, you will be notified after running shortcuts.

To get the updated shortcuts just scan the QR codes on the Shortcuts page in the user interface
where you first downloaded them.

## 🔗 Shortcuts

Orange Share uses several [shortcuts](https://support.apple.com/guide/shortcuts/welcome/ios) for different parts of its functionality.
These shortcuts have to be installed on the device from which content shall be shared.

The shortcuts can be found in the UI of the application or below.

#### Untrusted Shortcuts

To import the needed shortcuts, you might need to enable `Allow Untrusted Shortcuts` in your devices settings.
This option can be found in `Settings > Shortcuts`.

If you have never before used Shortcuts, chances are, that `Allow Untrusted Shortcuts` is grayed out.
If this is the case, you have to run a shortcut first.
To do this, open the Shortcuts App and choose any of the available shortcuts or create one yourself.
Once you ran a shortcut, the option to enable untrusted shortcuts should become available.

#### How to use the Shortcuts

Once the shortcuts are installed, they are shown in the Shortcuts App.
Here you can start or edit them.
When you run a shortcut that sends data to the computer here, it will send the contents of your clipboard.

You can find most shortcuts in the share sheets of the device.
This means that whenever you click `share` on the device you can find these shortcuts in the list.
At the bottom of this list you can find an option to edit the shown entries.
Here you can add the Orange Share shortcuts to your favorites if you want them to always be at the top.

### Connection Manager

This shortcut is always needed to manage the connections to the host computer running Orange Share.
It has to be run directly from the Shortcuts App or added to the home screen and run from there.
It is also possible to add this as a back tap action for easier access.

The device is able to save multiple connections while only one can be active at a time.
In order to do so, some files will be created on your iCloud (`/Shortcuts/orangeshare/`).

[Download](https://www.icloud.com/shortcuts/c80782d8c8954b1f96de6784441fb9a6)

### Open

The open shortcut will open content in its respective application on the computer.

For URLs, it will open the website in the default browser, any other files will be opened in their default applications.
To make this work, files are saved in a temporary folder.

[Download](https://www.icloud.com/shortcuts/ebc4cd8ec7954ac68f723d79fdf30276)

### Save

The save shortcut will open a save-file-dialog on the computer with which shared content can be saved anywhere on the computer.

[Download](https://www.icloud.com/shortcuts/ca1d351c41e14806b40c21c995a8f4f0)

### Clipboard

The clipboard shortcut will copy any text to the clipboard of the computer.
Once copied, it can be pasted anywhere.

Copying files will be coming soon.

[Download](https://www.icloud.com/shortcuts/7f10334354f9479aaf156139383f3a73)

### Get Data

This shortcut can be used to get data from the computer.
It will open a window on the computer where either a file or the current clipboard content can be sent to the phone.

[Download](https://www.icloud.com/shortcuts/f1e9e2f318f447508ab956884936c614)

## 🛠️ Advanced Options

### Run Options

Argument | Description
---------|------------
-h, --help | print a help message
--version | print the current version
-p \<port\>, --api-port \<port\> | Port number of the api server (default: 7615)
-u \<port\>, --ui-port \<port\> | Port number of the UI server (default: 7616)
-o, --open-ui | Open the server controls in the browser on start
-t, --tray-icon | Run with tray icon (only available on windows, see [Gnome Shell Extension](#gnome-shell-extension) for Linux with Gnome)
-v, --verbose | enable Verbose output

## ⚙ Configuration

A configuration file can be found in the user's config directory.
On Linux for example this would be `~/.config/orangeshare/config.ini`.
The file location will also be shown in the web UI.

Once changed you will have to restart Orange Share.