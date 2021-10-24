from flask import render_template, send_from_directory

import orangeshare
from orangeshare import Config


def favicon():
    return send_from_directory("logo", "white.ico")


def index():
    return render_template("index.html", version=orangeshare.__version__, newer_version_available=orangeshare.newer_version_available)


def devices():
    return render_template("devices.html")


def shortcuts():
    return render_template("shortcuts.html")


def settings():
    return render_template("settings.html", conf_file=Config.get_config().file)


def update():
    return render_template("update.html")
