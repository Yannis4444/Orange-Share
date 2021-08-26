const Main = imports.ui.main;
const MessageTray = imports.ui.main.MessageTray;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Util = imports.misc.util;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;

// TODO: different python interpreters
let active = false;
let orangeSharePid = null;
let orangeShareProcess = null;
let PORT = 7616;
let DISABLED_ICON = "orangeshare/logo/gray.svg"
let ENABLED_ICON = "orangeshare/logo/white.svg"
let installedVersion = null;

let orangeShare;

const OrangeShare = GObject.registerClass(
    class OrangeShare extends PanelMenu.Button {

        _init() {

            super._init(0);

            this._notifSource == null;

            this.icon = new St.Icon({
                style_class: 'system-status-icon',
            });

            this.setIcon(active);

            this.add_child(this.icon);

            this.connect('button-press-event', Lang.bind(this, function (display, action, deviceId, timestamp) {
                // Main.notify('Accelerator Activated: [display={}, action={}, deviceId={}, timestamp={}]');
                // log("Action:");
                // log("    Type:", action.type());
                // log("    State:", action.get_state());
                // log("    Stage:", action.get_stage());
                // log("    Flags:", action.get_flags());
                // log("    Button:", action.get_button());
                // log("    Click Count:", action.get_click_count(), typeof action.get_click_count());

                if (installedVersion == null) {
                    log("Orange Share is not yet installed");
                    this.showNotification("Orange Share is not installed", "Install", this.installOrangeShare)
                    return;
                }

                if (action.get_button() === 1) {
                    if (action.get_click_count() === 1) {
                        this.toggle();
                    } else if (action.get_click_count() === 2) {
                        // TODO: do not take as both single and double click
                        this.openSettings();
                        this.enable();
                    }
                }

                // let x = Mainloop.timeout_add(1000, () => {
                //     notify('Hello There', "General Kenobi", "/home/yannis/git/Orange-Share/orangeshare/logo/white.svg");
                // });
                // log(x);
                // Mainloop.timeout_remove(x);
            }));
        }

        toggle() {
            if (active) {
                this.disable();
            } else {
                this.enable();
            }
        }

        enable() {
            log("enabling Orange Share");

            try {
                if (orangeShareProcess == null) {
                    orangeShareProcess = Gio.Subprocess.new(
                        ["orangeshare", "-p", PORT.toString()],
                        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
                    );
                }
            } catch (e) {
                logError(e);
                this.showNotification("Starting failed");
                return;
            }

            active = true;

            this.setIcon(true);

            this.showNotification("Started Orange Share", "Settings", function () {
                this.openSettings()
            });
        }

        disable() {
            log("disabling Orange Share");

            try {
                if (orangeShareProcess != null) {
                    orangeShareProcess.force_kill();
                    orangeShareProcess = null;
                }
            } catch (e) {
                logError(e);
            }

            active = false;
            this.setIcon(false);

            this.showNotification("Stopped Orange Share");
        }

        setIcon(active) {
            this.icon.gicon = Gio.icon_new_for_string(Me.dir.get_path() + "/" + (active ? ENABLED_ICON : DISABLED_ICON));
        }

        openSettings() {
            log("Opening Settings");
            Util.spawn(["python", "-m", "webbrowser", "http://localhost:" + PORT]);
        }

        showNotification(message, actionText = null, action = function () {}) {
            // https://gitlab.manjaro.org/applications/pamac/-/blob/master/data/gnome-shell/pamac-updates%40manjaro.org/extension.js
            if (this._notifSource == null) {
                // We have to prepare this only once
                this._notifSource = new MessageTray.SystemNotificationSource();
                this._notifSource.createIcon = function () {
                    // return new St.Icon({ icon_name: "system-software-install-symbolic" });
                    return new St.Icon({
                        gicon: Gio.icon_new_for_string(Me.dir.get_path() + "/" + ENABLED_ICON)
                    });
                };
                // Take care of note leaving unneeded sources
                this._notifSource.connect('destroy', Lang.bind(this, function () {
                    this._notifSource = null;
                }));
                Main.messageTray.add(this._notifSource);
            }
            let notification = null;
            // We do not want to have multiple notifications stacked
            // instead we will update previous
            if (this._notifSource.notifications.length === 0) {
                notification = new MessageTray.Notification(this._notifSource, _("Orange Share"), message);

            } else {
                notification = this._notifSource.notifications[0];
                notification.update(_("Orange Share"), message, {clear: true});
            }
            if (actionText != null) {
                notification.addAction(_(actionText), Lang.bind(this, action));
            }
            notification.setTransient(false);
            this._notifSource.showNotification(notification);
        }

        installOrangeShare() {
            // opens a terminal to install orangeshare
            // GLib.spawn_command_line_sync("gnome-terminal -- pip install " + Me.dir.get_path())

            Gio.Subprocess.new(
                ["gnome-terminal", "--", "pip", "install", Me.dir.get_path()],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );

            // The exact version is not needed
            installedVersion = "x.x.x";
        }

    });

function init() {
    // check that the correct version of Orange Share is installed
    try {
        installedVersion = GLib.spawn_command_line_sync("orangeshare --version")[1].toString();
        log("Version " + installedVersion + " of Orange Share is installed");
    } catch (e) {
        // not installed
        log("Orange Share is not installed");
    }
}

function enable() {
    orangeShare = new OrangeShare();
    Main.panel.addToStatusArea('OrangeShare', orangeShare, 2);
}

function disable() {
    orangeShare.disable()
    orangeShare.destroy();
}