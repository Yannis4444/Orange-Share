# Quick Start

## Installation

Choose one of the following methods of installation depending on the system you want to install on.

### Windows

Go to the [releases](https://github.com/Yannis4444/Orange-Share/releases),
download the newest Orange Share executable (`orangeshare-x.y.z.exe`)
and run the installer.

This Version of Orange Share will show an icon in the system tray (lower right corner; may be hidden behind the up arrow).
The Tray Icon offers a right click menu to start, stop and exit Orange Share.

It also allows you to add Orange Share to Windows startup when installing.
If you enable this option Orange Share will start as inactive and can be activated from the tray.

### GNOME Shell Extension

A GNOME Shell Extension is available [here](https://extensions.gnome.org/extension/4469/orange-share/).

When first enabling Orange Share by clicking the icon in the top bar, you will be prompted to install the python package.
I was not allowed to host the python part on the GNOME Shell Extension page which is why installing and updating will be taken care of using pip.

Once everything is installed, you can enable and disable Orange Share by clicking on an icon in the top bar.
Right-click will open a short menu with some options and double-clicking the icon will open the settings in your browser.

### Using PIP

Orange Share can be installed by running `pip install orangeshare`.

After that, it can be run using the command `python -m orangeshare` or just `orangeshare` on Linux.

## Downloading the Shortcuts

To use Orange Share you will need a few Shortcuts.
These can be downloaded right from the user interface by scanning the QR codes with the camera app on your iPhone/iPad.

There are different Shortcuts with different functions.
Here I will only go over the basics you need to know to get started.
You can find a more in depth description in the user interface and [below](https://github.com/Yannis4444/Orange-Share#shortcuts.

If you run into problems with "untrusted shortcuts" take a look at [this](https://github.com/Yannis4444/Orange-Share#untrusted-shortcuts).
This is a security mechanism from Apple to make sure users do not just run any shortcut.

## Connecting a Device to the Computer

All the communication between the shortcuts and the computer use Basic Auth to avoid unauthorised requests.
Therefore, you need to create a new connection under Connected Devices in the settings.

There you can set the name of your computer which is only relevant for display purposes on the devices and the IP address of your computer.
The IP will be saved in combination with your WiFi name.
This means that you can set different IPs for different Networks.
If you are unsure which IP is the right one just go through them until one works.

To add a connection click ADD and then enter a name for the connection.
Click ADD again and scan the resulting QR code using the Connection Manager Shortcut (Scan QR Code).
This will establish and test the connection.

You can manage connected devices from this shortcut as well.
To connect to a computer you can also simply scan the QR code again.

If you wish to synchronise your connection between your devices you can set to do so using iCloud here too.

<p align="center">
    <img alt="add_connection" src="images/add_connection.png" title="add_connection" width="400"/>
</p>

## Sharing Data

Once everything is set up, you can choose any content you wish to share on your iPhone/iPad (like a photo) and click share.
There you should find the different Orange Share options.

If you wish to have Orange Share always appear on top you can use `Edit Actions...` at the bottom of this list.

## Requesting Data from the Computer

There is also the `Get Data` Shortcut which allows you to request data from the computer.

<p align="center">
    <img alt="Get Data Dialog" src="images/get_data.png" width="400"/>
</p>

You have now completed the basic steps to set up Orange Share and should be able to share content between you devices.
If you encounter any problems please let me know by
[creating an issue](https://github.com/Yannis4444/Orange-Share/issues).
