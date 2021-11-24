pip install .
pyinstaller --onefile --collect-all "orangeshare" --add-data "orangeshare/logo/gray.png;orangeshare/logo" --noconsole --name=orangeshare --icon=orangeshare/logo/white.ico main.py
"D:\Program Files (x86)\Inno Setup 6\Compil32.exe" /cc windows_installer.iss