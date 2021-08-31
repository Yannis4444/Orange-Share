from flask import render_template, send_from_directory
from .api import *
from orangeshare import Config


def favicon():
    return send_from_directory("logo", "white.ico")


def index():
    return render_template("index.html")


def devices():
    config = Config.get_config()
    return render_template("devices.html", ip=config.config.get("HOST", "ip"), hostname=config.config.get("HOST", "hostname"))


def shortcuts():
    return render_template("shortcuts.html")


def settings():
    return render_template("settings.html", conf_file=Config.get_config().file)
