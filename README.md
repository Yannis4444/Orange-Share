# Orange Share
A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS.

## How it works
Orange Share consists of a webserver that should be able to run on any Unix or Windows Computer and a few Shortcuts
that allow the user to open and save content from an iPhone or iPad on a computer.

The shortcuts will show up in the share sheet of files, links etc. and allow you to share whatever the content is with
the computer it is set up with.

By default, you can access the UI with settings for Orange Share on [localhost:7616](http://localhost:7616).
The UI is only accessible from the host.

The API which is used by the mobile devices is opened on port 7615 by default.
It is accessible from devices in the network and secured with Basic Auth.
Note that due to the http protocol, connection data will be sent over unencrypted connections.

## Shortcuts

Shortcuts have to be installed on the iPhone/iPad. In order to do that, the following download links must be
opened on the respective device.

Apple does not allow hosting shortcuts anywhere other than iCloud, which is why providing them as files would not work.
Therefore, all the following shortcuts are links to iCloud.

TODO: This will be changed

When adding the shortcut to your device, you will be asked to configure the IP/hostname as well as the port of the server
(7615 by default).

### Open
The open shortcut will send the content to the computer and open it in the respective application. For URLs, it will open
the website in the default browser, any other files will be opened in their default applications. To make this work, the
files are saved in a temporary folder.

**[Download the Shortcut](https://www.icloud.com/shortcuts/6b62b82bba344323917aeefbc90eb8c8)**

### Save
The save shortcut will open a save-file-dialog with which the selected file can be saved anywhere on the computer.

**[Download the Shortcut](https://www.icloud.com/shortcuts/471a93dd19374c609bd1c37f62c61fc4)**

### Clipboard
The clipboard shortcut will copy any text to the clipboard of the computer. Once copied, it can be pasted anywhere.

**[Download the Shortcut](https://www.icloud.com/shortcuts/af1a507a945f4226990c3a94e54d04d3)**

## Installation
### Gnome Shell Extension

Installing Orange Share as a gnome shell extension can be done by cloning the repo into your local gnome-shell
extensions directory (usually ~/.local/share/gnome-shell/extensions/):

```
$ git clone https://github.com/Yannis4444/Orange-Share.git <extensions-dir>/orange-share@Yannis4444.github.com
```

Once cloned, you may need to restart the shell (Alt+F2 and insert 'r' in the prompt) for the extension to be listed in the extension settings.
There you can enable the extension.
When first enabling Orange Share by clicking the icon in the top bar, you will be prompted to install the package.

Once everything is running, you can enable and disable Orange Share by clicking on the icon.
Double-clicking the icon will open the settings in your browser.

### Using PIP

You can install Orange-Share using `pip` by running `pip install .` in the base directory of this project.

After that, it can be run using the command `python -m orangeshare` or just `orangeshare`.

### Manual

To run Orange-Share you will need to install the following packages.

```shell
pip install flask
pip install flask_restful
pip install pyperclip
pip install notify-py
pip install validators
pip install wxpython
```

To start the server just run `python main.py`.

## Autostart
### Linux

To run Orange Share at system startup you can copy the `orange-share.desktop` to the `~/.config/autostart` directory.

### Windows
Coming soon.

## Configuration

A configuration file can be found in the user's config directory.
On Linux for example this would be `~/.config/orangeshare/config.ini`.