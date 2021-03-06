; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Orange Share"
#define MyAppVersion "1.7.0"
#define MyAppPublisher "Yannis Vierkoetter"
#define MyAppURL "https://github.com/Yannis4444/Orange-Share"
#define MyAppExeName "orangeshare.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{6E747061-53D3-44CA-BC5B-6D5155452045}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DisableDirPage=no
DisableProgramGroupPage=yes
OutputBaseFilename=orangeshare-{#MyAppVersion}
SetupIconFile=orangeshare\logo\white.ico
Compression=lzma
SolidCompression=yes
CloseApplications=force
WizardStyle=modern  
WizardImageFile=windows_installer_data/wizard.bmp
WizardImageStretch=yes
WizardSmallImageFile=orangeshare/logo/black.bmp
LicenseFile=LICENSE

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "StartMenuEntry" ; Description: "Run Orange Share in Tray on Windows Startup" ; GroupDescription: "Windows Startup";

[Files]
Source: "dist\orangeshare.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "orangeshare\logo\white.ico"; DestDir: "{app}\logo"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Parameters: "--windows-installation -t"; IconFilename: "{app}\logo\white.ico"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Parameters: "--windows-installation -t"; IconFilename: "{app}\logo\white.ico"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Parameters: "--windows-installation -t -i"; IconFilename: "{app}\logo\white.ico"; Tasks:StartMenuEntry

[Run]
Filename: "{app}\{#MyAppExeName}"; Parameters: "--windows-installation -t"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall