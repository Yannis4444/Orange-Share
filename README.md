# Orange Share
A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS.

## How it works
Orange Share consists of a webserver that should be able to run on any Unix or Windows Computer and a few Shortcuts
that allow the user to open and save content from an iPhone or iPad on a computer.

The shortcuts will show up in the share sheet of files, links etc. and allow you to share whatever the content is with
the computer it is set up with.

Apple does not allow hosting shortcuts anywhere other than iCloud, which is why providing them as files would not work.
Therefore, all the following shortcuts are links to iCloud.

When adding the shortcut to your device, you will be asked to configure the IP/hostname as well as the port of the server
(7616 by default).

## Functions
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