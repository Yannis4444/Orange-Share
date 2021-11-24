import sys

from flask import render_template, send_from_directory

import orangeshare
from orangeshare import Config
from orangeshare.updater import Updater


def favicon():
    return send_from_directory("logo", "white.ico")


def index():
    updater = Updater.get_updater()
    return render_template("index.html", version=orangeshare.__version__, newer_version_available=updater.newer_version_available, newer_version=updater.newer_version)


def devices():
    return render_template("devices.html")


def shortcuts():
    return render_template("shortcuts.html")


def settings():
    return render_template("settings.html", conf_file=Config.get_config().file)


def update():
    updater = Updater.get_updater()
    return render_template(
        "update.html",
        newer_version_available=updater.newer_version_available,
        newer_version=updater.newer_version,
        windows_installation="--windows-installation" in sys.argv,
        gnome_extension="--gnome-extension" in sys.argv,
        python_executable=sys.executable
    )
