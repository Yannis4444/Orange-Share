pyinstaller --onefile --collect-all "orangeshare" --name=orangeshare --icon=orangeshare/logo/white.ico main.py
pyinstaller --onefile --collect-all "orangeshare" --noconsole --name=orangeshare-noconsole --icon=orangeshare/logo/white.ico main.py
pyinstaller --onefile --collect-all "orangeshare" --noconsole --name=orangeshare-tray-icon --icon=orangeshare/logo/white.ico tray_icon.py
