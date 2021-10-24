const Main = imports.ui.main;
const MessageTray = imports.ui.main.MessageTray;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Util = imports.misc.util;
const Mainloop = imports.mainloop;

// TODO: get from github api
let newestVersion = "1.6.1"
let newestVersionInstalled = null;

let active = false;
let orangeShareProcess = null;
let DISABLED_ICON = "icons/gray.svg"
let ENABLED_ICON = "icons/white.svg"
let installedVersion = null;
let lastDoubleClick = 0;

let orangeShare;

function getVersion() {
    /*
    Gets the version and writes it to installedVersion
    the version will not be available instantly
    also sets newestVersionInstalled
     */
    try {
        let proc = Gio.Subprocess.new(
            ["orangeshare", "--version"],
            Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
        );

        // TODO: suggested changes from review

        proc.communicate_utf8_async(null, null, (proc, res) => {
            try {
                let [, stdout, stderr] = proc.communicate_utf8_finish(res);

                if (proc.get_successful()) {
                    installedVersion = stdout.toString().replace(/^\s+|\s+$/g, '');
                    log("Version " + installedVersion + " of Orange Share is installed")

                    newestVersionInstalled = !olderThan(installedVersion, newestVersion);
                } else {
                    throw new Error(stderr);
                }
            } catch (e) {
                logError(e);
                log("Orange Share is not installed (0)");
                installedVersion = null;
                newestVersionInstalled = false;
            }
        });
    } catch (e) {
        // not installed
        logError(e);
        log("Orange Share is not installed (1)");
        installedVersion = null;
        newestVersionInstalled = false;
    }
}

function olderThan(a, b) {
    let splitA = a.split(".");
    let splitB = b.split(".");
    return splitA[0] < splitB[0] || (splitA[0] === splitB[0] && splitA[1] < splitB[1] || (splitA[0] === splitB[0] && splitA[1] === splitB[1] && splitA[2] < splitB[2]))
}

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

            this.connect('button-press-event', function (display, action, deviceId, timestamp) {
                if (installedVersion == null) {
                    log("Orange Share is not yet installed");
                    this.showNotification("Orange Share is not installed", "Install", this.installOrangeShare)
                    return;
                }

                if (action.get_button() === 1) {
                    if (action.get_click_count() === 1) {
                        // this.toggle();
                        // set the icon now and maybe revert the change again
                        this.setIcon(!active);
                        Mainloop.timeout_add(250, () => {
                            if (Date.now() > lastDoubleClick + 250) {
                                this.toggle();
                            }
                        });
                    } else if (action.get_click_count() === 2) {
                        lastDoubleClick = Date.now();
                        this.openSettings();
                        this.enable();
                    }
                }
            }.bind(this));
        }

        toggle() {
            if (active) {
                this.disable();
            } else {
                this.enable();
            }
        }

        enable() {
            if (active) {
                log("Orange Share was already running");
                this.setIcon(true);
                return;
            }

            log("enabling Orange Share");

            try {
                if (orangeShareProcess == null) {
                    orangeShareProcess = Gio.Subprocess.new(
                        ["orangeshare"],
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

            if (!newestVersionInstalled) {
                log("There is a newer Version of Orange Share available");
                this.showNotification("There is a newer Version available", "Update", this.updateOrangeShare);
            } else {
                this.showNotification("Started Orange Share", "Settings", function () {
                    this.openSettings();
                });
            }
        }

        disable() {
            if (!active) {
                log("Orange Share was not running");
                this.setIcon(false);
                return;
            }

            log("disabling Orange Share");

            try {
                if (orangeShareProcess != null) {
                    orangeShareProcess.force_exit();
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
            Util.spawn(["python", "-m", "webbrowser", "http://localhost:7616"]);
        }

        showNotification(message, actionText = null, action = function () {
        }) {
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
                this._notifSource.connect('destroy', function () {
                    this._notifSource = null;
                }.bind(this));
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
                notification.addAction(_(actionText), action.bind(this));
            }
            notification.setTransient(false);
            this._notifSource.showNotification(notification);
        }

        installOrangeShare() {
            // opens a terminal to install orangeshare, gets version afterwards
            Gio.Subprocess.new(
                ["sh", "-c", "chmod +x " + Me.dir.get_path() + "/install.sh; gnome-terminal -- " + Me.dir.get_path() + "/install.sh"],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );

            // exact version not needed if known that newest is installed
            installedVersion = "x.x.x";
            newestVersionInstalled = true;
        }

        updateOrangeShare() {
            this.disable();
            this.installOrangeShare();
        }

    });

function init() {
}

function enable() {
    // check that the correct version of Orange Share is installed
    installedVersion = getVersion();

    // run the extension
    orangeShare = new OrangeShare();
    Main.panel.addToStatusArea('OrangeShare', orangeShare, 2);
}

function disable() {
    orangeShare.disable()
    orangeShare.destroy();
    orangeShare = null;
}