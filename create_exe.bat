pyinstaller --onefile --collect-all "orangeshare" --add-data "orangeshare/logo/gray.png;orangeshare/logo" --name=orangeshare --icon=orangeshare/logo/white.ico main.py
pyinstaller --onefile --collect-all "orangeshare" --add-data "orangeshare/logo/gray.png;orangeshare/logo" --noconsole --name=orangeshare-noconsole --icon=orangeshare/logo/white.ico main.py
pyinstaller --onefile --collect-all "orangeshare" --add-data "orangeshare/logo/gray.png;orangeshare/logo" --noconsole --name=orangeshare-tray-icon --icon=orangeshare/logo/white.ico tray_icon.py
