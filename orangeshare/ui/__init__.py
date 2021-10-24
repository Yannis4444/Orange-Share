import sys

from flask import render_template, send_from_directory

import orangeshare
from orangeshare import Config


def favicon():
    return send_from_directory("logo", "white.ico")


def index():
    return render_template("index.html", version=orangeshare.__version__, newer_version_available=orangeshare.newer_version_available, newer_version=orangeshare.newer_version)


def devices():
    return render_template("devices.html")


def shortcuts():
    return render_template("shortcuts.html")


def settings():
    return render_template("settings.html", conf_file=Config.get_config().file)


def update():
    # TODO: not always windows
    # return render_template("update.html", newer_version_available=orangeshare.newer_version_available, newer_version=orangeshare.newer_version, windows=sys.platform == "win32", gnome=sys.platform in ["linux", "linux2"], executables=orangeshare.newer_version_executables)
    return render_template("update.html", newer_version_available=orangeshare.newer_version_available, newer_version=orangeshare.newer_version, windows=True, gnome=sys.platform in ["linux", "linux2"], executables=orangeshare.newer_version_executables)
