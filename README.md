# Orange-Share
A small python server that accepts requests from an apple shortcut to allow sharing all sorts of media from iOS with any desktop OS

## Autostart
To run Orange Share at system startup you can copy the `orange-share.desktop` to the `~/.config/autostart` directory.
You will have to change the path in `Exec=/bin/python3 /path/to/Orange-Share/main.py` to the correct location of the
`main.py`.