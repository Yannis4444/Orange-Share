from flask import render_template, send_from_directory
from .api import *


def favicon():
    return send_from_directory("logo", "white.ico")


def index():
    return render_template("index.html")


def devices():
    # TODO: get the actual ip and port
    return render_template("devices.html")
