const Main = imports.ui.main;
const MessageTray = imports.ui.main.MessageTray;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Util = imports.misc.util;
const Mainloop = imports.mainloop;

let active = false;
let orangeShareProcess = null;
let DISABLED_ICON = "icons/gray.svg"
let ENABLED_ICON = "icons/white.svg"
let installedVersion = null;
let lastDoubleClick = 0;

let orangeShare;

// TODO: check functionality in GNOME 41

function getVersion(callback = function (version) {}) {
    /*
    Gets the version and writes it to installedVersion
    the version will not be available instantly
    A callback can be supplied to be called with the version (null if not installed)
     */
    try {
        let proc = Gio.Subprocess.new(
            ["orangeshare", "--version"],
            Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
        );

        proc.communicate_utf8_async(null, null, (proc, res) => {
            try {
                let [, stdout, stderr] = proc.communicate_utf8_finish(res);

                if (proc.get_successful()) {
                    installedVersion = stdout.toString().replace(/^\s+|\s+$/g, '');
                    log("Version " + installedVersion + " of Orange Share is installed")
                    callback(installedVersion);
                } else {
                    throw new Error(stderr);
                }
            } catch (e) {
                logError(e);
                log("Orange Share is not installed (0)");
                installedVersion = null;
                callback(installedVersion);
            }
        });
    } catch (e) {
        // not installed
        logError(e);
        log("Orange Share is not installed (1)");
        installedVersion = null;
        callback(installedVersion);
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


            // add (right click) menu
            this.addRegularMenu();

            this.setIcon(active);

            this.add_child(this.icon);

            // set actions for click
            this.connect('button-press-event', (display, action, deviceId, timestamp) => {
                let that = this;
                if (installedVersion == null) {
                    // check that there is really no installed version
                    getVersion(function (version) {
                        if (version == null) {
                            log("Orange Share is not yet installed");
                            that.showNotification("Orange Share is not installed", "Install", that.installOrangeShare)
                            that.addInstallMenu();
                        } else {
                            // is installed
                            that.handleClick(action);
                        }
                    })
                } else {
                    this.handleClick(action);
                }
            });
        }

        handleClick(action) {
            // add (right click) menu
            this.addRegularMenu();

            if (action.get_button() === 1) {
                // left click

                // close menu right away when left clicking
                this.menu.close();

                if (action.get_click_count() === 1) {
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
        }

        addRegularMenu() {
            this.menu.removeAll();

            this.pmActiveItem = new PopupMenu.PopupSwitchMenuItem(_("Active"), active, {reactive: true});
            this.menu.addMenuItem(this.pmActiveItem);
            this.pmActiveItem.connect('toggled', () => {
                this.toggle();
            });

            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

            let pmOpenSettingsItem = new PopupMenu.PopupMenuItem('Open Settings');
            this.menu.addMenuItem(pmOpenSettingsItem);
            pmOpenSettingsItem.connect('activate', () => {
                this.openSettings();
            });

            // add update menu if this is a pre 1.7.0 version
            if (installedVersion != null && installedVersion !== "x.x.x" && olderThan(installedVersion, "1.7.0")) {
                this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

                let pmUpdateItem = new PopupMenu.PopupMenuItem('Update');
                this.menu.addMenuItem(pmUpdateItem);
                pmUpdateItem.connect('activate', this.updateOrangeShare);
            }
        }

        addInstallMenu() {
            // menu that includes only one install button
            this.menu.removeAll();

            // show install button in menu
            let pmOpenSettingsItem = new PopupMenu.PopupMenuItem('Install');
            this.menu.addMenuItem(pmOpenSettingsItem);
            pmOpenSettingsItem.connect('activate', this.installOrangeShare);
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
                        ["orangeshare", "--gnome-extension"],
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

            // if this is earlier than version 1.7.0 show update popup to allow updates for older versions
            // in newer versions updates are performed from the python script
            if (installedVersion != null && installedVersion !== "x.x.x" && olderThan(installedVersion, "1.7.0")) {
                this.showNotification("Update Available Here", "Update Now", function () {
                    this.updateOrangeShare();
                })
                return;
            }

            this.showNotification("Started Orange Share", "Settings", function () {
                this.openSettings();
            });
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
            // also sets the switch in menu
            this.icon.gicon = Gio.icon_new_for_string(Me.dir.get_path() + "/" + (active ? ENABLED_ICON : DISABLED_ICON));
            this.pmActiveItem.setToggleState(active);
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
                this._notifSource.connect('destroy', () => {
                    this._notifSource = null;
                });
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
            // opens a terminal to install orangeshare, sets dummy version afterwards
            Gio.Subprocess.new(
                ["sh", "-c", "chmod +x " + Me.dir.get_path() + "/install.sh; gnome-terminal -- " + Me.dir.get_path() + "/install.sh"],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );
        }

        updateOrangeShare() {
            // opens a terminal to update orangeshare, sets dummy version afterwards
            Gio.Subprocess.new(
                ["sh", "-c", "chmod +x " + Me.dir.get_path() + "/update.sh; gnome-terminal -- " + Me.dir.get_path() + "/update.sh"],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );

            // prevent from asking for update multiple times
            installedVersion = "x.x.x";
        }
    });

function init() {
}

function enable() {
    // check which version of Orange Share is installed
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